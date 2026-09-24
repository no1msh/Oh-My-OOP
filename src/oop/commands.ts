import * as path from "node:path";
import { z } from "zod";
import { type OopConfig, ensureProjectRootExists, workspacePaths } from "../config.js";
import { CollaborationDirectionSchema, StereotypeSchema, TradeoffQuestionSchema } from "../domain/schemas.js";
import { classIdFromName, collaborationId, toSlug } from "../domain/ids.js";
import { classExists, readClass, upsertClass } from "../io/classStore.js";
import { upsertCollaboration } from "../io/collaborationStore.js";
import { loadDesign } from "../io/design.js";
import { createDefaultIndex } from "../io/designIndex.js";
import { nowIso } from "../io/frontmatter.js";
import { listHistory, readHistory, snapshotMermaid } from "../io/history.js";
import { listUseCases, readUseCase, upsertUseCase } from "../io/useCaseStore.js";
import { atomicWriteFile, ensureWorkspace, pathExists, readUtf8 } from "../io/workspace.js";
import { diffDiagrams, parseMermaid } from "../render/diff.js";
import { renderClassDiagram } from "../render/mermaid.js";
import { buildSideBySide } from "../render/sideBySide.js";
import { generateAlternatives } from "../tradeoff/engine.js";
import { buildResponsibilitySeeds } from "../tradeoff/heuristics/responsibilitySplit.js";
import { expansionPromptResponsibilities } from "../tradeoff/templates.js";
import { ALL_RULE_IDS, summarize, validateDesign } from "../validate/rules.js";
import { buildDesignContract, CONFORMANCE_CHECKLIST, CONFORMANCE_INSTRUCTION } from "./conformance.js";

/** Transport-neutral data plus optional human-readable presentation. Errors throw. */
export interface OopCommandResult<T = unknown> {
  data: T;
  text?: string;
}

function operation<S extends z.AnyZodObject, T>(
  inputSchema: S,
  execute: (config: OopConfig, input: z.output<S>) => Promise<OopCommandResult<T>>,
) {
  return {
    inputSchema,
    execute: async (config: OopConfig, input: unknown) => execute(config, inputSchema.parse(input)),
  };
}

const sideSchema = z.union([
  z.object({ kind: z.literal("history"), file: z.string() }),
  z.object({ kind: z.literal("current") }),
  z.object({ kind: z.literal("inline"), mermaid: z.string() }),
]);

async function resolveSide(side: z.infer<typeof sideSchema>, config: OopConfig): Promise<string> {
  if (side.kind === "inline") return side.mermaid;
  if (side.kind === "current") return readUtf8(workspacePaths(config).currentDiagram);
  return readHistory(config, side.file);
}

async function snapshotCurrent(config: OopConfig, label?: string): Promise<void> {
  if (!label) return;
  const current = workspacePaths(config).currentDiagram;
  if (await pathExists(current)) {
    await snapshotMermaid(config, await readUtf8(current), label);
  }
}

/** Shared contracts and handlers for CLI, MCP, and in-process callers. */
export const OOP_OPERATIONS = {
  oop_init: operation(z.object({
    project: z.string().optional(),
    force: z.boolean().default(false),
  }), async (config, { project, force }) => {
    ensureProjectRootExists(config);
    const ws = await ensureWorkspace(config, { force });
    const index = await createDefaultIndex(config, project ?? path.basename(config.projectRoot));
    const paths = workspacePaths(config);
    await atomicWriteFile(paths.currentDiagram,
      "classDiagram\n" +
      "  %% 아직 클래스가 정의되지 않았습니다. oop_class_upsert로 시작하세요.\n");
    return {
      data: {
        project_root: config.projectRoot,
        oop_dir: paths.root,
        created: ws.created,
        existed: ws.existed,
        index,
      },
      text: `워크스페이스를 ${paths.root}에 초기화했습니다.`,
    };
  }),

  oop_use_case_add: operation(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    actor: z.string().min(1),
    preconditions: z.array(z.string()).default([]),
    main_flow: z.array(z.string()).min(1),
    postconditions: z.array(z.string()).default([]),
    related_classes: z.array(z.string()).default([]),
    notes: z.string().optional(),
  }), async (config, args) => {
    const id = args.id ?? toSlug(args.title);
    const result = await upsertUseCase(config, {
      id,
      title: args.title,
      actor: args.actor,
      preconditions: args.preconditions,
      main_flow: args.main_flow,
      postconditions: args.postconditions,
      related_classes: args.related_classes,
      notes: args.notes,
    });
    return {
      data: { id, path: result.path, created: result.created },
      text: `${result.created ? "추가" : "갱신"}: ${id}`,
    };
  }),

  oop_use_case_list: operation(z.object({}), async (config) => ({
    data: {
      use_cases: (await listUseCases(config)).map((uc) => ({
        id: uc.id,
        title: uc.title,
        actor: uc.actor,
        related_classes: uc.related_classes,
      })),
    },
  })),

  oop_propose_responsibilities: operation(z.object({
    use_case_id: z.string().min(1),
    n: z.number().int().min(2).max(5).default(3),
    bias_hint: z.enum(["by-noun", "by-verb", "balanced"]).optional(),
  }), async (config, { use_case_id, n, bias_hint }) => {
    const uc = await readUseCase(config, use_case_id);
    const all = buildResponsibilitySeeds(uc, bias_hint);
    return {
      data: {
        alternatives: all.slice(0, Math.max(2, Math.min(n, all.length))),
        expansion_prompt: expansionPromptResponsibilities(uc.title),
      },
    };
  }),

  oop_assign_responsibility: operation(z.object({
    class_id: z.string().min(1),
    kind: z.enum(["knowing", "doing"]),
    text: z.string().min(1),
    from_use_case: z.string().optional(),
  }), async (config, { class_id, kind, text, from_use_case }) => {
    const card = await readClass(config, class_id);
    const list = card.responsibilities[kind];
    if (!list.includes(text)) list.push(text);
    if (from_use_case && !card.provenance.derived_from_use_cases.includes(from_use_case)) {
      card.provenance.derived_from_use_cases.push(from_use_case);
    }
    card.provenance.updated_at = nowIso();
    const result = await upsertClass(config, card);
    return { data: { class_id, kind, path: result.path } };
  }),

  oop_class_upsert: operation(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    stereotype: StereotypeSchema,
    responsibilities: z.object({
      knowing: z.array(z.string()).default([]),
      doing: z.array(z.string()).default([]),
    }).default({ knowing: [], doing: [] }),
    from_use_cases: z.array(z.string()).default([]),
    notes: z.string().optional(),
    snapshot_label: z.string().optional(),
  }), async (config, args) => {
    const id = args.id ?? classIdFromName(args.name);
    await snapshotCurrent(config, args.snapshot_label);
    const prev = (await classExists(config, id)) ? await readClass(config, id) : null;
    const card = {
      id,
      name: args.name,
      stereotype: args.stereotype,
      responsibilities: args.responsibilities,
      // Collaborators are derived from collaborations when the design is loaded.
      collaborators: prev?.collaborators ?? [],
      provenance: {
        derived_from_use_cases: args.from_use_cases.length > 0
          ? args.from_use_cases : prev?.provenance.derived_from_use_cases ?? [],
        created_at: prev?.provenance.created_at ?? nowIso(),
        updated_at: nowIso(),
      },
      notes: args.notes ?? prev?.notes,
    };
    const result = await upsertClass(config, card);
    return { data: { id, path: result.path, created: result.created } };
  }),

  oop_class_list: operation(z.object({}), async (config) => {
    const { classes } = await loadDesign(config);
    return {
      data: {
        classes: classes.map((card) => ({
          id: card.id,
          name: card.name,
          stereotype: card.stereotype,
          responsibility_count: card.responsibilities.knowing.length + card.responsibilities.doing.length,
          collaborator_count: card.collaborators.length,
        })),
      },
    };
  }),

  oop_collaboration_define: operation(z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    message: z.string().min(1),
    direction: CollaborationDirectionSchema.default("send"),
    multiplicity: z.string().optional(),
    rationale: z.string().optional(),
    snapshot_label: z.string().optional(),
  }), async (config, args) => {
    await snapshotCurrent(config, args.snapshot_label);
    const id = collaborationId(args.from, args.message, args.to);
    const result = await upsertCollaboration(config, {
      id,
      from: args.from,
      to: args.to,
      message: args.message,
      direction: args.direction,
      multiplicity: args.multiplicity,
      rationale: args.rationale,
    });
    return { data: { id, path: result.path, created: result.created } };
  }),

  oop_propose_alternatives: operation(z.object({
    question: TradeoffQuestionSchema,
    context: z.object({
      description: z.string().min(1),
      class_id: z.string().optional(),
      use_case_id: z.string().optional(),
      involved: z.array(z.string()).optional(),
    }),
    n: z.number().int().min(2).max(5).default(3),
  }), async (config, { question, context, n }) => ({
    data: generateAlternatives(question, context, await loadDesign(config), n),
  })),

  oop_diagram_generate: operation(z.object({
    write_current: z.boolean().default(true),
  }), async (config, { write_current }) => {
    const mermaid = renderClassDiagram(await loadDesign(config));
    let written: string | undefined;
    if (write_current) {
      written = workspacePaths(config).currentDiagram;
      await atomicWriteFile(written, mermaid);
    }
    return {
      data: { mermaid, path: written, next_step: "구현을 마치면 oop_conformance_check로 설계 적합성을 검토하세요." },
      text: "```mermaid\n" + mermaid + "```\n\n" +
        "> **다음 단계:** 이 설계대로 구현을 마치면 `oop_conformance_check`를 호출해 " +
        "구현이 설계(책임·stereotype)에 부합하는지 검토하세요.",
    };
  }),

  oop_design_compare: operation(z.object({
    before: sideSchema,
    after: sideSchema.default({ kind: "current" }),
    labels: z.object({
      before: z.string().default("Before"),
      after: z.string().default("After"),
    }).default({ before: "Before", after: "After" }),
  }), async (config, { before, after, labels }) => {
    const beforeM = await resolveSide(before, config);
    const afterM = await resolveSide(after, config);
    const diff = diffDiagrams(parseMermaid(beforeM), parseMermaid(afterM));
    const result = buildSideBySide(beforeM, afterM, diff, labels);
    return {
      data: {
        before_mermaid: result.before_mermaid,
        after_mermaid: result.after_mermaid,
        diff: result.diff,
        side_by_side_markdown: result.side_by_side_markdown,
      },
      text: result.side_by_side_markdown,
    };
  }),

  oop_design_validate: operation(z.object({
    rules: z.array(z.enum(ALL_RULE_IDS)).optional(),
    severity_min: z.enum(["info", "warn", "error"]).default("info"),
  }), async (config, { rules, severity_min }) => {
    const design = await loadDesign(config);
    const findings = validateDesign(design, {
      rules,
      severityMin: severity_min,
      thresholds: design.index.thresholds,
    });
    return { data: { findings, summary: summarize(findings) } };
  }),

  oop_conformance_check: operation(z.object({
    class_ids: z.array(z.string()).optional(),
  }), async (config, { class_ids }) => {
    const design = await loadDesign(config);
    const selected = class_ids && class_ids.length > 0
      ? design.classes.filter((card) => class_ids.includes(card.id) || class_ids.includes(card.name))
      : design.classes;
    if (selected.length === 0) {
      throw new Error(class_ids && class_ids.length > 0
        ? "지정한 class_ids에 해당하는 클래스가 없습니다."
        : "설계에 클래스가 없습니다. 먼저 oop_class_upsert로 CRC를 정의하세요.");
    }
    return {
      data: {
        instruction: CONFORMANCE_INSTRUCTION,
        checklist: CONFORMANCE_CHECKLIST,
        design_contract: buildDesignContract(selected),
      },
    };
  }),

  oop_state_read: operation(z.object({
    include: z.array(z.enum(["use_cases", "classes", "collaborations", "diagram", "history"])).optional(),
  }), async (config, { include }) => {
    const want = new Set(include ?? ["use_cases", "classes", "collaborations", "diagram", "history"]);
    const design = await loadDesign(config);
    const data: Record<string, unknown> = { index: design.index };
    if (want.has("use_cases")) data.use_cases = design.use_cases;
    if (want.has("classes")) data.classes = design.classes;
    if (want.has("collaborations")) data.collaborations = design.collaborations;
    if (want.has("diagram")) {
      const current = workspacePaths(config).currentDiagram;
      data.diagram = (await pathExists(current)) ? await readUtf8(current) : "";
    }
    if (want.has("history")) data.history = await listHistory(config);
    return { data };
  }),
};

export type OopOperationName = keyof typeof OOP_OPERATIONS;
export const OOP_OPERATION_NAMES = Object.keys(OOP_OPERATIONS) as [OopOperationName, ...OopOperationName[]];
export const OopRequestSchema = z.object({
  action: z.enum(OOP_OPERATION_NAMES),
}).passthrough();

/** Execute an OOP action with an explicitly chosen workspace; no environment lookup. */
export async function oopCommand(config: OopConfig, input: unknown): Promise<unknown> {
  const { action, ...args } = OopRequestSchema.parse(input);
  return (await OOP_OPERATIONS[action].execute(config, args)).data;
}
