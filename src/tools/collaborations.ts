import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { upsertCollaboration } from "../io/collaborationStore.js";
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
      description: "두 클래스 사이의 메시지 협력을 정의합니다. 의존 관계의 정본(collaborations)에 기록되며, 각 클래스의 collaborators는 여기서 자동 파생됩니다.",
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
        // collaborators는 여기서 쓰지 않는다 — loadDesign이 collaborations에서 파생한다.
        // (단일 진실 출처: 의존 관계의 정본은 collaborations)
        return jsonResult({ id, path: res.path, created: res.created });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
