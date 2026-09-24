import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsShape = {
  code_or_description: z.string().optional(),
};

export function registerTellDontAskRephrase(server: McpServer): void {
  server.registerPrompt(
    "tell-dont-ask-rephrase",
    {
      title: "Tell-Don't-Ask 다시 쓰기",
      description:
        "외부 비교자/외부 getter 사용 코드를 *메시지 호출* 형태로 다시 쓰는 4안 + 진단 질문. 답을 즉시 주지 않고 학생 자가 도달 유도.",
      argsSchema: argsShape,
    },
    ({ code_or_description }) => {
      const desc = code_or_description ?? "(코드/설명 미입력)";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `# Tell-Don't-Ask 다시 쓰기`,
                ``,
                `다음 코드 또는 협력 흐름이 *외부에서 객체의 데이터를 꺼내 처리*하고 있는지 점검합니다:`,
                ``,
                `\`\`\``,
                desc,
                `\`\`\``,
                ``,
                `## 진단 질문 (학생에게 먼저 묻고, 답을 즉시 주지 마세요)`,
                ``,
                `1. *데이터를 꺼내는 외부 객체*는 누구입니까? 그 객체에 *자기 행동*과 *자기 데이터*가 있습니까?`,
                `2. *꺼내진 데이터의 주인*은 그 처리를 *자기 책임*으로 받을 수 있습니까?`,
                `3. 외부 객체가 *사라져도* 같은 결과를 낼 수 있습니까? (있다면 그 객체는 가상 객체일 가능성)`,
                `4. 데이터의 *모양*이 아니라 *답해야 할 메시지*가 무엇입니까?`,
                ``,
                `## 4안 트레이드오프 (학생이 진단 후 함께 본다)`,
                ``,
                `### 0. 만들지 않는다 — 현 코드 유지 + 통증 관찰`,
                `- pros: 변경 비용 0. 추측 기반 변경 회피.`,
                `- cons: 통증 누적 시 비용 증가. *책임이 정말 다른 곳에 있는가* 입증되지 않은 경우.`,
                ``,
                `### A. 일방향 메시지 (\`a.action(b)\`)`,
                `- pros: 데이터 곁에 행위. Tell-Don't-Ask 충실. 메시지 방향이 코드에 명시.`,
                `- cons: 비대칭 — 결과 일관성 강제 비용. 호출처가 *누가 누구에게 묻는지* 결정 부담.`,
                ``,
                `### B. 대칭 양방향 (둘 다에 메서드 + 공통 invariant)`,
                `- pros: 호출처 자유도 ↑. 양측 책임 응집.`,
                `- cons: *결과 일관성 강제* 비용. 양측 룰 동기화 부담. 테스트 매트릭스 N².`,
                ``,
                `### C. 상태/역할 객체에 위임 (State 다형성)`,
                `- pros: 상태별 고유 로직을 다형성으로 자연 표현. 분기 N×M 회피.`,
                `- cons: State 패턴 도입 비용 — sealed 계층 + 전이 룰. 단순 케이스에는 과설계.`,
                ``,
                `## 진행 원칙`,
                ``,
                `- 학생에게 *어느 대안이 적절해 보이는지* 먼저 물으세요.`,
                `- 학생의 결정 전에 *권장 답*을 제시하지 마세요. *어느 안이 정답*이라고 말하지 마세요.`,
                `- 결정 후 *왜 이 대안인가*를 학생이 *도메인 어휘*로 설명하게 하세요.`,
                ``,
                `**가르침**: 외부 비교자는 거의 항상 *잘못된 첫 답*입니다 — 단, *그것이 적절한 경우*(예: 양측 모두 데이터만 보유한 값 객체끼리의 산술 비교)도 있으므로 정답으로 강요하지 마세요. 단일 답 거부.`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
