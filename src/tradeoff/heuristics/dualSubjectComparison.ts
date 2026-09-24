import type { AlternativeSeed } from "../engine.js";

// "양측이 동등한 두 주체가 어떤 결과(승부·우위·비교)를 결정"하는 협력 패턴.
// MCP `oh-my-oop` 핵심 가치: *외부 비교자*는 거의 항상 잘못된 첫 답.
// 근거: lessons/woowacourse-kotlin-blackjack 다수 PR — 외부 정적 Judge.judge / Outcome.of 패턴.
// @laco-dev (krrong/19): "몇 개 일치하는지 요청해서 결과를 받아오도록 해보세요.
//                        객체지향 프로그래밍에서는 이 개념을 메시지를 보낸다 라고 표현합니다."
// @BeokBeok (EmilyCh0/38): "내 카드들의 정보를 넘겨줄테니 블랙잭인지 알려줘."

export function dualSubjectComparisonSeeds(
  involved: string[],
): AlternativeSeed[] {
  const A = involved[0] ?? "Participant";
  const B = involved[1] ?? "Other";
  const aMsg = A.charAt(0).toLowerCase() + A.slice(1);
  const bMsg = B.charAt(0).toLowerCase() + B.slice(1);
  return [
    {
      id: "dsc-external-comparator",
      label: "외부 비교자 (Judge.judge)",
      summary:
        `별도 ServiceProvider 클래스(예: Judge / Outcome.of)가 ${A}와 ${B}의 *데이터를 모두 꺼내* ` +
        `비교한 후 결과를 반환한다. 양측은 *데이터를 노출*하기만 한다.`,
      design_delta: {
        added_classes: [{ name: "Judge", stereotype: "ServiceProvider" }],
      },
      tradeoffs: {
        pros: [
          "비교 로직이 *한 자리*에 모임 — \"심판이 룰을 안다\" 메타포와 부합",
          "양측 주체에 비교 책임이 없어 *각 주체 클래스는 단순*하게 유지",
        ],
        cons: [
          "Tell-Don't-Ask 위반 — 양측의 knowing 을 *외부가 꺼내 처리*",
          "양측에 *getter 누수* 강제 (캡슐화 약화)",
          "*외부 객체 추가*가 가상 객체로 성장할 위험 — @laco-dev: \"객체는 모두 스스로 일을 합니다\"",
        ],
      },
      cho_younghos_lens: {
        cohesion: "hurts",
        coupling: "hurts",
        testability: "neutral",
        notes:
          "거의 항상 *잘못된 첫 답*. 비교가 *대칭*이라는 이유로 정당화되지만, 메시지로 풀 수 있다면 그 쪽이 우선.",
      },
    },
    {
      id: "dsc-one-way-message",
      label: `일방향 메시지 (${aMsg}.match(${bMsg}))`,
      summary:
        `한쪽 주체(${A})가 다른 주체(${B})에게 *결과를 묻는다* — \`${aMsg}.match(${bMsg})\`. ` +
        `호출 측이 *누가 누구에게 묻는지* 결정한다.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "Tell-Don't-Ask 충실 — 외부에 데이터 노출 X",
          `*비교 로직이 ${A}에 응집* (능동적인 측이 책임을 보유)`,
          "메시지 방향이 *코드에 명시*되어 협력 그래프가 읽기 쉬움",
        ],
        cons: [
          `*비대칭* — \`${aMsg}.match(${bMsg})\` 와 \`${bMsg}.match(${aMsg})\` 결과가 같아야 한다면 *수동 일관성* 비용`,
          "*어느 쪽이 묻는가*가 호출 지점에 분산 → 호출처가 결정을 떠안음",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes:
          "*객체에게 메시지를 보낸다* 의 가장 직접적 형태. 첫 답으로 가장 자연스러운 카드.",
      },
    },
    {
      id: "dsc-symmetric-bidirectional",
      label: "대칭 양방향 메시지",
      summary:
        `${A}와 ${B} *양측 모두*에게 비교 메시지를 둔다. 결과의 일관성은 ` +
        `*공통 invariant*(예: 한쪽 WIN ↔ 다른 쪽 LOSE)로 테스트 또는 코드로 강제.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "*어느 쪽에서나 물을 수 있어* 호출처 자유도 증가",
          "비교 책임이 *양측에 대칭*하게 응집 — 한쪽이 비대해질 위험 ↓",
        ],
        cons: [
          "*결과 일관성 강제* 비용 — 한쪽 룰 변경 시 양측 모두 갱신 필요",
          "*중복 로직* 위험 — 결국 한쪽이 다른 쪽을 호출하는 구조로 수렴 가능",
          "*테스트 매트릭스 N²* — 양방향 케이스를 모두 검증",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "neutral",
        testability: "neutral",
        notes:
          "*동등성이 본질*인 도메인(양측이 동시에 결정을 행사)에 적합. 비대칭이라면 일방향 메시지가 더 자연.",
      },
    },
    {
      id: "dsc-state-self-judging",
      label: "State 자가 판정 (state.compareTo(other))",
      summary:
        `${A}와 ${B}가 *각자 State 객체*를 가지며, 비교는 \`State.compareTo(otherState)\` 다형성으로 풀린다. ` +
        `상태별 *고유 비교 룰*을 sealed 다형성이 표현 (예: Bust 는 항상 패배).`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "상태별 *고유 비교 룰*을 다형성으로 자연 표현",
          "비교 책임이 *주체에서 상태로 이동* — 주체 클래스 단순화",
          "*분기 N×M 폭증* 회피 (state-machine 학습 장치)",
        ],
        cons: [
          "*State 패턴 도입 비용* — sealed/abstract 계층 + 전이 룰 추가 학습",
          "*외부 mutation 위험* (state private 강제 필요)",
          "비교가 *단순한 산술*이라면 과설계",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes:
          "분기 폭증을 *경험한 후* 도달할 카드. 처음부터 도입하면 *그저 좋다*의 함정 (@ghojeong State 패턴 2 기준: 다형성 활용 + Context 책임).",
      },
    },
  ];
}
