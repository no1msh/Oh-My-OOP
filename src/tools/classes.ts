import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { listClasses, upsertClass, readClass, classExists } from "../io/classStore.js";
import { snapshotMermaid } from "../io/history.js";
import { workspacePaths } from "../config.js";
import { readUtf8, pathExists } from "../io/workspace.js";
import { classIdFromName } from "../domain/ids.js";
import { StereotypeSchema, CollaboratorRefSchema } from "../domain/schemas.js";
import { nowIso } from "../io/frontmatter.js";
import { jsonResult, errorResult } from "../util/mcp.js";

export function registerClasses(server: McpServer): void {
  server.registerTool(
    "oop_class_upsert",
    {
      title: "Add or update a CRC card",
      description:
        "이름, Stereotype, 책임(knowing/doing), 협력자를 가진 CRC 카드를 생성/수정합니다.",
      inputSchema: {
        id: z.string().optional(),
        name: z.string().min(1),
        stereotype: StereotypeSchema,
        responsibilities: z
          .object({
            knowing: z.array(z.string()).default([]),
            doing: z.array(z.string()).default([]),
          })
          .default({ knowing: [], doing: [] }),
        collaborators: z.array(CollaboratorRefSchema).default([]),
        from_use_cases: z.array(z.string()).default([]),
        notes: z.string().optional(),
        snapshot_label: z.string().optional(),
      },
    },
    async (args) => {
      const config = resolveConfig();
      try {
        const id = args.id ?? classIdFromName(args.name);

        if (args.snapshot_label) {
          const cur = workspacePaths(config).currentDiagram;
          if (await pathExists(cur)) {
            const mermaid = await readUtf8(cur);
            await snapshotMermaid(config, mermaid, args.snapshot_label);
          }
        }

        const exists = await classExists(config, id);
        const prev = exists ? await readClass(config, id) : null;

        const card = {
          id,
          name: args.name,
          stereotype: args.stereotype,
          responsibilities: args.responsibilities,
          collaborators: args.collaborators,
          provenance: {
            derived_from_use_cases:
              args.from_use_cases.length > 0
                ? args.from_use_cases
                : prev?.provenance.derived_from_use_cases ?? [],
            created_at: prev?.provenance.created_at ?? nowIso(),
            updated_at: nowIso(),
          },
          notes: args.notes ?? prev?.notes,
        };
        const res = await upsertClass(config, card);
        return jsonResult({ id, path: res.path, created: res.created });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );

  server.registerTool(
    "oop_class_list",
    {
      title: "List classes",
      description: "현재 정의된 모든 CRC 카드의 요약을 반환합니다.",
      inputSchema: {},
    },
    async () => {
      const config = resolveConfig();
      const cards = await listClasses(config);
      return jsonResult({
        classes: cards.map((c) => ({
          id: c.id,
          name: c.name,
          stereotype: c.stereotype,
          responsibility_count:
            c.responsibilities.knowing.length + c.responsibilities.doing.length,
          collaborator_count: c.collaborators.length,
        })),
      });
    },
  );
}
