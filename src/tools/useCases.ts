import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerUseCases(server: McpServer): void {
  registerOopOperation(server, "oop_use_case_add", {
    title: "Add a use case",
    description: "도메인 유스케이스를 .oop/use-cases/<id>.md로 저장합니다.",
    outputSchema: {
      id: z.string(),
      path: z.string(),
      created: z.boolean(),
    },
  });
  registerOopOperation(server, "oop_use_case_list", {
    title: "List use cases",
    description: "현재 정의된 유스케이스 목록을 반환합니다.",
  });
}
