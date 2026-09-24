import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerAlternatives(server: McpServer): void {
  registerOopOperation(server, "oop_propose_alternatives", {
    title: "Propose design alternatives with trade-offs (설계 트레이드오프 엔진)",
    description:
      "[USE WHEN] 사용자가 '이 클래스 어떻게 나눌까', '어떤 협력 모양이 좋을까', 'Tell-Don't-Ask이 맞을까', 'A가 B한테 데이터를 가져올까 vs B에게 시킬까', 'Stereotype 뭘 줘야 하나', '값 객체를 value class로 할까 data class로 할까', '정책을 interface로 풀까 enum으로 풀까', '예외 처리는 runCatching이 맞을까 null+while이 맞을까', '일급 컬렉션을 만들까 List를 그대로 쓸까', '응집도/결합도 트레이드오프' 등 구체적 설계 결정을 묻는 모든 순간. " +
      "9가지 질문 유형(responsibility_split / class_split / collaboration_shape / stereotype_choice / value_object_shape / strategy_or_policy / error_handling / collection_shape / free_form)에 대해 N개 대안 + 장단점 + 조영호 렌즈(cohesion/coupling/testability) 평가를 반환. 단일 답을 내지 않음.",
  });
}
