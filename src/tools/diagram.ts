import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig, workspacePaths } from "../config.js";
import { loadDesign } from "../io/design.js";
import { renderClassDiagram } from "../render/mermaid.js";
import { atomicWriteFile } from "../io/workspace.js";
import { jsonResult, errorResult } from "../util/mcp.js";

export function registerDiagram(server: McpServer): void {
  server.registerTool(
    "oop_diagram_generate",
    {
      title: "Generate current class diagram (Mermaid classDiagram)",
      description:
        "[USE WHEN] 사용자가 '클래스 다이어그램 보여줘', '지금 설계 어떻게 생겼어?', 'OOP 구조 그려줘'를 요청하거나 변경 직후 시각화가 필요할 때. " +
        "현재 .oop/ 상태(클래스 + 협력)로부터 Mermaid classDiagram을 생성하고 diagrams/current.mmd에 기록.",
      inputSchema: {
        write_current: z.boolean().default(true),
      },
    },
    async ({ write_current }) => {
      const config = resolveConfig();
      try {
        const design = await loadDesign(config);
        const mermaid = renderClassDiagram(design);
        let written: string | undefined;
        if (write_current) {
          written = workspacePaths(config).currentDiagram;
          await atomicWriteFile(written, mermaid);
        }
        return jsonResult(
          { mermaid, path: written },
          "```mermaid\n" + mermaid + "```",
        );
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
