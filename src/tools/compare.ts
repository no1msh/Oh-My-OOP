import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerCompare(server: McpServer): void {
  registerOopOperation(server, "oop_design_compare", {
    title: "Compare design snapshots — Before/After (설계 변경 시각화)",
    description:
      "[USE WHEN] 사용자가 객체지향/OOP 설계를 변경한 직후, '뭐가 바뀌었어?', '리팩터링 전후 비교', 'Before/After 보여줘'를 요청할 때, 또는 큰 구조 변경 후 영향 시각화가 필요할 때. " +
      "두 시점의 Mermaid 다이어그램(history 스냅샷 / 현재 / 인라인)을 비교해 Before/After를 색상 강조(added=녹, removed=빨, changed=노)와 함께 세로 스택 마크다운으로 반환. diff 요약 포함.",
  });
}
