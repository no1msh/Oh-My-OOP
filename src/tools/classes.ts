import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerClasses(server: McpServer): void {
  registerOopOperation(server, "oop_class_upsert", {
    title: "Add or update a CRC card",
    description:
      "이름, Stereotype, 책임(knowing/doing)을 가진 CRC 카드를 생성/수정합니다. " +
      "협력자(collaborators)는 여기서 받지 않습니다 — oop_collaboration_define으로 정의하면 자동 파생됩니다 (단일 진실 출처).",
  });
  registerOopOperation(server, "oop_class_list", {
    title: "List classes",
    description: "현재 정의된 모든 CRC 카드의 요약을 반환합니다.",
  });
}
