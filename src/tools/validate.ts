import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerValidate(server: McpServer): void {
  registerOopOperation(server, "oop_design_validate", {
    title: "Validate current OOP design (책임/결합도/테스터빌리티 권고)",
    description:
      "[USE WHEN] 사용자가 객체지향 설계를 '리뷰'/'검토'/'평가'해달라거나, '이거 좋은 설계인가', 'god object 같지 않아?', '결합도/응집도 어때', '테스트하기 어렵지 않을까', 'Tell-Don't-Ask 위배 아냐?'를 물을 때. " +
      "현재 .oop/ 설계를 20여 개 룰(god-object, mixed-stereotype, low-cohesion, too-many-collaborators, feature-envy, non-newable, side-effect-in-holder, mocking-pressure, cycle, orphan-class, dependency-direction, presentation-in-domain 등)로 검사. 모든 finding은 항상 ≥2개의 대안 remedies를 포함. 결과는 권고일 뿐 차단하지 않음 — 코드 통제권은 개발자에게.",
  });
}
