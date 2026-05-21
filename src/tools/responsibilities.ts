import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { readUseCase } from "../io/useCaseStore.js";
import { readClass, upsertClass } from "../io/classStore.js";
import { buildResponsibilitySeeds } from "../tradeoff/heuristics/responsibilitySplit.js";
import { expansionPromptResponsibilities } from "../tradeoff/templates.js";
import { jsonResult, errorResult } from "../util/mcp.js";
import { nowIso } from "../io/frontmatter.js";

export function registerResponsibilities(server: McpServer): void {
  server.registerTool(
    "oop_propose_responsibilities",
    {
      title: "Propose responsibility decompositions",
      description:
        "유스케이스로부터 책임을 어떻게 분해할지 N개의 대안을 트레이드오프와 함께 제안합니다. 단일 답을 내지 않습니다.",
      inputSchema: {
        use_case_id: z.string().min(1),
        n: z.number().int().min(2).max(5).default(3),
        bias_hint: z.enum(["by-noun", "by-verb", "balanced"]).optional(),
      },
    },
    async ({ use_case_id, n, bias_hint }) => {
      const config = resolveConfig();
      try {
        const uc = await readUseCase(config, use_case_id);
        const all = buildResponsibilitySeeds(uc, bias_hint);
        const capped = all.slice(0, Math.max(2, Math.min(n, all.length)));
        return jsonResult({
          alternatives: capped,
          expansion_prompt: expansionPromptResponsibilities(uc.title),
        });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );

  server.registerTool(
    "oop_assign_responsibility",
    {
      title: "Assign a responsibility to a class",
      description: "선택된 책임을 특정 클래스의 knowing 또는 doing 목록에 추가합니다(idempotent).",
      inputSchema: {
        class_id: z.string().min(1),
        kind: z.enum(["knowing", "doing"]),
        text: z.string().min(1),
        from_use_case: z.string().optional(),
      },
    },
    async ({ class_id, kind, text, from_use_case }) => {
      const config = resolveConfig();
      try {
        const card = await readClass(config, class_id);
        const list = card.responsibilities[kind];
        if (!list.includes(text)) list.push(text);
        if (from_use_case && !card.provenance.derived_from_use_cases.includes(from_use_case)) {
          card.provenance.derived_from_use_cases.push(from_use_case);
        }
        card.provenance.updated_at = nowIso();
        const res = await upsertClass(config, card);
        return jsonResult({ class_id, kind, path: res.path });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
