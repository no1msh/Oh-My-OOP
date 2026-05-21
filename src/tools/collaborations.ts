import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { upsertCollaboration } from "../io/collaborationStore.js";
import { readClass, upsertClass, classExists } from "../io/classStore.js";
import { snapshotMermaid } from "../io/history.js";
import { workspacePaths } from "../config.js";
import { readUtf8, pathExists } from "../io/workspace.js";
import { collaborationId } from "../domain/ids.js";
import { CollaborationDirectionSchema } from "../domain/schemas.js";
import { jsonResult, errorResult } from "../util/mcp.js";

export function registerCollaborations(server: McpServer): void {
  server.registerTool(
    "oop_collaboration_define",
    {
      title: "Define a collaboration (message between classes)",
      description: "두 클래스 사이의 메시지 협력을 정의합니다. 두 클래스 카드에도 collaborators 목록을 동기화합니다.",
      inputSchema: {
        from: z.string().min(1),
        to: z.string().min(1),
        message: z.string().min(1),
        direction: CollaborationDirectionSchema.default("send"),
        multiplicity: z.string().optional(),
        rationale: z.string().optional(),
        snapshot_label: z.string().optional(),
      },
    },
    async (args) => {
      const config = resolveConfig();
      try {
        if (args.snapshot_label) {
          const cur = workspacePaths(config).currentDiagram;
          if (await pathExists(cur)) {
            const mermaid = await readUtf8(cur);
            await snapshotMermaid(config, mermaid, args.snapshot_label);
          }
        }

        const id = collaborationId(args.from, args.message, args.to);
        const collab = {
          id,
          from: args.from,
          to: args.to,
          message: args.message,
          direction: args.direction,
          multiplicity: args.multiplicity,
          rationale: args.rationale,
        };
        const res = await upsertCollaboration(config, collab);

        if (await classExists(config, args.from) && await classExists(config, args.to)) {
          const fromCard = await readClass(config, args.from);
          const toCard = await readClass(config, args.to);
          const ref = { name: toCard.name, message: args.message };
          const already = fromCard.collaborators.some(
            (c) => c.name === ref.name && c.message === ref.message,
          );
          if (!already) {
            fromCard.collaborators.push(ref);
            await upsertClass(config, fromCard);
          }
        }
        return jsonResult({ id, path: res.path, created: res.created });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
