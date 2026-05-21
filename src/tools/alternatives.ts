import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { loadDesign } from "../io/design.js";
import { generateAlternatives } from "../tradeoff/engine.js";
import { TradeoffQuestionSchema } from "../domain/schemas.js";
import { jsonResult, errorResult } from "../util/mcp.js";

export function registerAlternatives(server: McpServer): void {
  server.registerTool(
    "oop_propose_alternatives",
    {
      title: "Propose design alternatives with trade-offs",
      description:
        "특정 설계 질문(클래스 분리/협력 형태/Stereotype 선택 등)에 대해 N개의 대안을 트레이드오프, 조영호 렌즈와 함께 제안합니다. 단일 답을 내지 않습니다.",
      inputSchema: {
        question: TradeoffQuestionSchema,
        context: z.object({
          description: z.string().min(1),
          class_id: z.string().optional(),
          use_case_id: z.string().optional(),
          involved: z.array(z.string()).optional(),
        }),
        n: z.number().int().min(2).max(5).default(3),
      },
    },
    async ({ question, context, n }) => {
      const config = resolveConfig();
      try {
        const design = await loadDesign(config);
        const result = generateAlternatives(question, context, design, n);
        return jsonResult(result);
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
