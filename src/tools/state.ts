import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig, workspacePaths } from "../config.js";
import { loadDesign } from "../io/design.js";
import { listHistory } from "../io/history.js";
import { pathExists, readUtf8 } from "../io/workspace.js";
import { jsonResult, errorResult } from "../util/mcp.js";

export function registerState(server: McpServer): void {
  server.registerTool(
    "oop_state_read",
    {
      title: "Read consolidated design state",
      description: "현재 .oop/의 전체 설계 상태(스냅샷)를 한 번에 반환합니다.",
      inputSchema: {
        include: z
          .array(z.enum(["use_cases", "classes", "collaborations", "diagram", "history"]))
          .optional(),
      },
    },
    async ({ include }) => {
      const config = resolveConfig();
      try {
        const want = new Set(include ?? ["use_cases", "classes", "collaborations", "diagram", "history"]);
        const design = await loadDesign(config);
        const out: Record<string, unknown> = { index: design.index };
        if (want.has("use_cases")) out.use_cases = design.use_cases;
        if (want.has("classes")) out.classes = design.classes;
        if (want.has("collaborations")) out.collaborations = design.collaborations;
        if (want.has("diagram")) {
          const cur = workspacePaths(config).currentDiagram;
          out.diagram = (await pathExists(cur)) ? await readUtf8(cur) : "";
        }
        if (want.has("history")) out.history = await listHistory(config);
        return jsonResult(out);
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
