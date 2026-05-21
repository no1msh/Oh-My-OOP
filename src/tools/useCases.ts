import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { upsertUseCase, listUseCases } from "../io/useCaseStore.js";
import { toSlug } from "../domain/ids.js";
import { jsonResult } from "../util/mcp.js";

export function registerUseCases(server: McpServer): void {
  server.registerTool(
    "oop_use_case_add",
    {
      title: "Add a use case",
      description: "도메인 유스케이스를 .oop/use-cases/<id>.md로 저장합니다.",
      inputSchema: {
        id: z.string().optional(),
        title: z.string().min(1),
        actor: z.string().min(1),
        preconditions: z.array(z.string()).default([]),
        main_flow: z.array(z.string()).min(1),
        postconditions: z.array(z.string()).default([]),
        related_classes: z.array(z.string()).default([]),
        notes: z.string().optional(),
      },
      outputSchema: {
        id: z.string(),
        path: z.string(),
        created: z.boolean(),
      },
    },
    async (args) => {
      const config = resolveConfig();
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
      return jsonResult(
        { id, path: result.path, created: result.created },
        `${result.created ? "추가" : "갱신"}: ${id}`,
      );
    },
  );

  server.registerTool(
    "oop_use_case_list",
    {
      title: "List use cases",
      description: "현재 정의된 유스케이스 목록을 반환합니다.",
      inputSchema: {},
    },
    async () => {
      const config = resolveConfig();
      const items = await listUseCases(config);
      return jsonResult({
        use_cases: items.map((u) => ({
          id: u.id,
          title: u.title,
          actor: u.actor,
          related_classes: u.related_classes,
        })),
      });
    },
  );
}
