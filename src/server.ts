import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";
import { registerAllPrompts } from "./prompts/index.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "oh-my-oop",
      version: "0.1.0",
    },
    {
      // 모델·클라이언트 무관 행동 지침. 철학(단일 답 금지·도메인 어휘·권고)을
      // 여기 두면 어떤 LLM/클라이언트에도 전달된다(서버 instructions는 표준 채널).
      instructions: [
        "이 서버는 책임 주도 설계(RDD, 조영호) 조력 도구다. 행동 원칙:",
        "1) 절대 단일 답을 주지 마라 — 항상 N개 대안 + 트레이드오프를 제시하고, 선택은 사용자에게 맡긴다.",
        "2) pros/cons는 추상 문장이 아니라 이 도메인의 구체적 결과(어휘)로 다시 써라.",
        "3) 검증·검수 finding은 차단이 아니라 권고다. 코드 통제권은 개발자에게 있다. 모든 finding은 ≥2개 대안 remedy를 가진다.",
        "4) 설계가 끝나고 코드를 구현했다면, 반드시 oop_conformance_check를 호출해 구현이 설계(책임·stereotype)에 부합하는지 검토하라 (예: 도메인 객체에 표현 로직이 섞였는지).",
      ].join("\n"),
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  registerAllTools(server);
  registerAllResources(server);
  registerAllPrompts(server);

  return server;
}
