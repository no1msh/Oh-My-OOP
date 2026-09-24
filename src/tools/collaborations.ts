import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerCollaborations(server: McpServer): void {
  registerOopOperation(server, "oop_collaboration_define", {
    title: "Define a collaboration (message between classes)",
    description: "두 클래스 사이의 메시지 협력을 정의합니다. 의존 관계의 정본(collaborations)에 기록되며, 각 클래스의 collaborators는 여기서 자동 파생됩니다.",
  });
}
