import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";
import { registerAllPrompts } from "./prompts/index.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: "oh-my-oop", version: "0.2.0" }, {
    instructions: [
      "책임 주도 설계(RDD)를 돕는 OOP 도구다. oop_capabilities / oop_describe로 CLI 대응 명령과 입력을 확인한다.",
      "항상 여러 대안과 트레이드오프를 제시한다. 장단점은 사용자의 도메인 어휘로 설명하고 선택은 사용자에게 맡긴다.",
      "검증 finding은 권고이며 설계 승인이나 실행 차단이 아니다. 모든 finding은 둘 이상의 remedy를 가진다.",
      "oop_design_validate는 저장된 설계 모델을 검사한다. 구현을 자동 분석하지 않는다.",
      "oop_conformance_check는 설계 계약과 체크리스트를 반환한다. 호스트가 허용된 실제 코드와 비교하고 불충분한 근거를 명시한다.",
      "모델/API 키/Skill 설치가 필요하지 않다. LLM의 대화나 로그인이 아니라 같은 프로젝트 루트의 .oop 상태만 공유된다.",
    ].join("\n"),
    capabilities: { tools: {}, resources: {}, prompts: {} },
  });
  registerAllTools(server);
  registerAllResources(server);
  registerAllPrompts(server);
  return server;
}
