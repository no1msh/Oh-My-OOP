import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsShape = {
  class_or_code: z.string().optional(),
};

export function registerStateMachineIntrospect(server: McpServer): void {
  server.registerPrompt(
    "state-machine-introspect",
    {
      title: "State 패턴 도입 점검",
      description:
        "boolean 플래그/when 분기 폭증을 sealed State 패턴으로 풀지 점검하는 2 기준 체크 + 4안 비교. 자동 감지 X, 학생 자가 도달.",
      argsSchema: argsShape,
    },
    ({ class_or_code }) => {
      const desc = class_or_code ?? "(클래스/코드 미입력)";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `# State 패턴 도입 점검`,
                ``,
                `다음 클래스/코드에 *상태 분기가 폭증*하고 있는지 학생과 함께 점검합니다:`,
                ``,
                `\`\`\``,
                desc,
                `\`\`\``,
                ``,
                `## 1단계 — 분기 폭증 신호 진단 (학생이 직접 답하게)`,
                ``,
                `1. 상태를 나타내는 *boolean 플래그/enum/문자열*이 몇 개입니까?`,
                `2. *같은 데이터를 분기하는* \`when\`/\`if\` 구문이 클래스 안에 몇 군데입니까?`,
                `3. *새 상태 1개*를 추가하려면 몇 군데를 수정해야 합니까? (분기 N개 × 메서드 M개)`,
                `4. 분기 안에서 *각 상태별 행동이 다른가*, 아니면 *데이터만 다른가*?`,
                ``,
                `## 2단계 — State 패턴 도입 2 기준 (둘 다 만족할 때만 답)`,
                ``,
                `**기준 1: 다형성을 활용하는가?** — 각 상태가 *행동에 다르게 응답*해야 한다. 단순히 *데이터만 다르다*면 enum + when 으로 충분.`,
                ``,
                `**기준 2: Context 의 책임이 있는가?** — State 가 Context(주체 객체)의 *행동을 위임*받는 구조여야 한다. State 가 단순히 *데이터 묶음*이라면 패턴 적용 X.`,
                ``,
                `두 기준 모두 *Yes* 이면 sealed interface 도입. 한 쪽이라도 *No* 면 다른 안.`,
                ``,
                `## 3단계 — 4안 비교 (도입 결정 후)`,
                ``,
                `### 0. 만들지 않는다 — boolean 플래그 유지 + 분기 관찰`,
                `- pros: 변경 비용 0. 분기가 더 늘어나기 전까지 통증 관찰.`,
                `- cons: *통증이 N×M으로 폭증*하면 마이그레이션 비용 ↑.`,
                ``,
                `### A. enum + when (exhaustive 강제)`,
                `- pros: 케이스 닫힘이 컴파일러 강제. 단순 데이터 차이에 가벼움.`,
                `- cons: 행동 차이 표현 한계. enum 상수가 *외부 의존 주입*에 약함.`,
                ``,
                `### B. sealed interface + 다형성`,
                `- pros: 상태별 *고유 행동* 다형성 표현. 분기 N×M 흡수. Context 책임 위임 자연.`,
                `- cons: sealed/abstract 계층 도입 비용. *외부 mutation 위험* (private 강제 필요).`,
                ``,
                `### C. lateinit var state + setter`,
                `- pros: *기존 코드 변경 최소*.`,
                `- cons: 호출 순서 invariant 부재 — 거의 항상 *잘못된 답*. 학습 차원에서 보여만 주세요.`,
                ``,
                `## 4단계 — 도입 직후 함정 점검 (sealed 선택 시)`,
                ``,
                `학생에게 다음 3가지 함정을 *미리* 안내:`,
                ``,
                `- **외부 mutation**: \`obj.state = NewState()\` 직접 변경 시 전이 룰이 우회됨 → State private + 다음 상태 *메서드가 반환*하게.`,
                `- **\`if state is X\` 잔재**: 다형성 도입 후 호출처에서 다시 타입 검사하면 다형성 무효화 → State 메서드로 책임 이동.`,
                `- **데이터 차이 없는 sealed**: 멤버 차이 없으면 enum 과 동치 → 진짜 다형성 지점이 있는지 재검토.`,
                ``,
                `## 진행 원칙`,
                ``,
                `- *분기 폭증을 학생이 직접 경험한 뒤*에 sealed 권하세요. 처음부터 권하면 *그저 좋다* 함정.`,
                `- 두 기준 중 하나라도 만족하지 않으면 sealed 추천하지 마세요.`,
                `- 도입 결정은 학생에게.`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
