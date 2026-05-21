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
      title: "Generate current class diagram (Mermaid)",
      description: "현재 .oop/ 상태로부터 Mermaid 클래스 다이어그램을 생성합니다.",
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
