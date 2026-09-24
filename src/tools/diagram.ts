import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerDiagram(server: McpServer): void {
  registerOopOperation(server, "oop_diagram_generate", {
    title: "Generate current class diagram (Mermaid classDiagram)",
    description:
      "[USE WHEN] 사용자가 '클래스 다이어그램 보여줘', '지금 설계 어떻게 생겼어?', 'OOP 구조 그려줘'를 요청하거나 변경 직후 시각화가 필요할 때. " +
      "현재 .oop/ 상태(클래스 + 협력)로부터 Mermaid classDiagram을 생성하고 diagrams/current.mmd에 기록.",
  });
}
