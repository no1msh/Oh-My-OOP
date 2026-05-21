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
      title: "Propose design alternatives with trade-offs (설계 트레이드오프 엔진)",
      description:
        "[USE WHEN] 사용자가 '이 클래스 어떻게 나눌까', '어떤 협력 모양이 좋을까', 'Tell-Don't-Ask이 맞을까', 'A가 B한테 데이터를 가져올까 vs B에게 시킬까', 'Stereotype 뭘 줘야 하나', '응집도/결합도 트레이드오프' 등 구체적 설계 결정을 묻는 모든 순간. " +
        "5가지 질문 유형(responsibility_split / class_split / collaboration_shape / stereotype_choice / free_form)에 대해 N개 대안 + 장단점 + 조영호 렌즈(cohesion/coupling/testability) 평가를 반환. 단일 답을 내지 않음.",
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
