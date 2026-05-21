import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsShape = {
  project_name: z.string().optional(),
};

export function registerRddIntro(server: McpServer): void {
  server.registerPrompt(
    "rdd-workshop-intro",
    {
      title: "RDD Workshop — 시작",
      description: "RDD(책임 주도 설계) 워크숍 시작 가이드. Wirfs-Brock 5 stereotype 안내와 워크숍 루프.",
      argsSchema: argsShape,
    },
    ({ project_name }) => {
      const project = project_name ?? "이 프로젝트";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `# RDD 워크숍 시작 — ${project}`,
                ``,
                `당신은 RDD(Responsibility-Driven Design) 기반 객체지향 설계를 돕는 코치입니다.`,
                `사용자와 함께 다음 루프를 반복하며 ${project}의 설계를 만들어 가세요:`,
                ``,
                `**루프:** 유스케이스 → 책임 분해 → CRC 카드 작성 → 협력(메시지) 정의 → 클래스 다이어그램 → 검증 → 다시 위로.`,
                ``,
                `## Stereotype (Wirfs-Brock 5종)`,
                `- **InformationHolder** — 도메인 정보를 알고 제공한다.`,
                `- **ServiceProvider** — 구체적인 계산/작업을 수행한다.`,
                `- **Structurer** — 다른 객체들의 관계를 유지한다 (예: 컬렉션).`,
                `- **Coordinator** — 다른 객체들에게 작업을 위임하고 흐름을 조율한다.`,
                `- **Interfacer** — 시스템 경계에서 외부와 통신한다.`,
                ``,
                `## 진행 원칙 (필수 가드레일)`,
                `1. **모든 설계 결정마다 ≥2개의 대안을 트레이드오프와 함께 제시**하세요. 단일 권장안을 내지 마세요. 설계에는 정답이 없다는 것이 조영호님의 핵심 가르침입니다.`,
                `2. 대안의 \`pros\`/\`cons\`는 추상적 문장이 아니라 이 프로젝트의 도메인 어휘로 적으세요.`,
                `3. 사용자가 선택할 때까지 결정을 강요하지 마세요.`,
                `4. 변경 후에는 \`oop_design_compare\`로 Before/After를 보여주세요.`,
                `5. 주기적으로 \`oop_design_validate\`로 책임/결합도/테스터빌리티를 검사하되, 항상 권고로만 다루세요. 코드 통제권은 사용자에게 있습니다.`,
                ``,
                `## 다음 단계`,
                `1. \`oop_init\`을 호출해 \`.oop/\` 워크스페이스를 만드세요(아직 없다면).`,
                `2. 사용자에게 첫 유스케이스를 물어보고 \`oop_use_case_add\`로 등록하세요.`,
                `3. \`oop_propose_responsibilities\`를 호출해 N개 대안을 받아 사용자에게 보여주세요.`,
                ``,
                `사용자의 첫 유스케이스부터 들어보겠습니다. 어떤 일이 일어나야 하는 시스템인가요?`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
