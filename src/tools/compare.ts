import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig, workspacePaths } from "../config.js";
import { readHistory } from "../io/history.js";
import { readUtf8 } from "../io/workspace.js";
import { parseMermaid, diffDiagrams } from "../render/diff.js";
import { buildSideBySide } from "../render/sideBySide.js";
import { jsonResult, errorResult } from "../util/mcp.js";

const sideSchema = z.union([
  z.object({ kind: z.literal("history"), file: z.string() }),
  z.object({ kind: z.literal("current") }),
  z.object({ kind: z.literal("inline"), mermaid: z.string() }),
]);

async function resolveSide(
  side: z.infer<typeof sideSchema>,
  currentDiagramPath: string,
  config: ReturnType<typeof resolveConfig>,
): Promise<string> {
  if (side.kind === "inline") return side.mermaid;
  if (side.kind === "current") return readUtf8(currentDiagramPath);
  return readHistory(config, side.file);
}

export function registerCompare(server: McpServer): void {
  server.registerTool(
    "oop_design_compare",
    {
      title: "Compare design snapshots — Before/After (설계 변경 시각화)",
      description:
        "[USE WHEN] 사용자가 객체지향/OOP 설계를 변경한 직후, '뭐가 바뀌었어?', '리팩터링 전후 비교', 'Before/After 보여줘'를 요청할 때, 또는 큰 구조 변경 후 영향 시각화가 필요할 때. " +
        "두 시점의 Mermaid 다이어그램(history 스냅샷 / 현재 / 인라인)을 비교해 Before/After를 색상 강조(added=녹, removed=빨, changed=노)와 함께 세로 스택 마크다운으로 반환. diff 요약 포함.",
      inputSchema: {
        before: sideSchema,
        after: sideSchema.default({ kind: "current" }),
        labels: z
          .object({ before: z.string().default("Before"), after: z.string().default("After") })
          .default({ before: "Before", after: "After" }),
      },
    },
    async ({ before, after, labels }) => {
      const config = resolveConfig();
      try {
        const current = workspacePaths(config).currentDiagram;
        const beforeM = await resolveSide(before, current, config);
        const afterM = await resolveSide(after, current, config);
        const diff = diffDiagrams(parseMermaid(beforeM), parseMermaid(afterM));
        const result = buildSideBySide(beforeM, afterM, diff, labels);
        return jsonResult(
          {
            before_mermaid: result.before_mermaid,
            after_mermaid: result.after_mermaid,
            diff: result.diff,
            side_by_side_markdown: result.side_by_side_markdown,
          },
          result.side_by_side_markdown,
        );
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
