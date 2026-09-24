import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerResponsibilities(server: McpServer): void {
  registerOopOperation(server, "oop_propose_responsibilities", {
    title: "Propose responsibility decompositions (책임 분해 N안)",
    description:
      "[USE WHEN] 사용자가 객체지향/OOP/RDD/책임 주도 설계 맥락에서 '이 유스케이스의 책임을 어떻게 나눌까', '어떤 클래스가 필요할까', '누가 무엇을 알고 무엇을 해야 하는가'를 묻거나 책임/협력 구조를 고민할 때. " +
      "유스케이스로부터 책임을 분해하는 N개의 대안(by-noun, by-verb, by-stereotype, single-class)을 트레이드오프와 함께 제안. 단일 답을 내지 않음 — 조영호님의 '설계는 제약 아래 답을 찾는 행위' 원칙.",
  });
  registerOopOperation(server, "oop_assign_responsibility", {
    title: "Assign a responsibility to a class",
    description: "선택된 책임을 특정 클래스의 knowing 또는 doing 목록에 추가합니다(idempotent).",
  });
}
