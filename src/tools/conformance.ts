import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

// Preserve the existing import surface for callers of the conformance helpers.
export { buildDesignContract, CONFORMANCE_CHECKLIST, CONFORMANCE_INSTRUCTION } from "../oop/conformance.js";

export function registerConformance(server: McpServer): void {
  registerOopOperation(server, "oop_conformance_check", {
    title: "Review whether implementation conforms to the design (설계 적합성 검토)",
    description:
      "[USE WHEN] 사용자가 '설계대로 잘 짰는지 봐줘', '이 코드가 설계에 맞아?', '구현이 CRC/책임과 일치해?', '도메인에 표현 로직(getStatus 등) 섞이지 않았어?'를 묻거나, 설계 후 구현한 코드를 리뷰할 때. " +
      "저장된 .oop 설계를 *명세(contract)*로 꺼내고 적대적 체크리스트를 반환한다. 코드는 직접 파싱하지 않으며 — 호출 모델이 컨텍스트의 코드를 이 명세와 대조해 이탈(미설계 행위·stereotype 위반·미구현·미선언 협력)을 finding으로 보고한다. 모든 finding은 ≥2 remedy. 권고이며 차단하지 않음.",
  });
}
