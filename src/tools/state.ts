import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerState(server: McpServer): void {
  registerOopOperation(server, "oop_state_read", {
    title: "Read consolidated design state",
    description: "현재 .oop/의 전체 설계 상태(스냅샷)를 한 번에 반환합니다.",
  });
}
