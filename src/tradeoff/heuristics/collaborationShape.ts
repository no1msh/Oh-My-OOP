import type { AlternativeSeed } from "../engine.js";

export function collaborationShapeSeeds(involved: string[]): AlternativeSeed[] {
  const [a = "A", b = "B"] = involved;
  return [
    {
      id: "shape-tell-dont-ask",
      label: "Tell-Don't-Ask",
      summary: `${a}이 ${b}에게 작업을 명령한다. ${b}이 자신의 데이터로 결정/행동을 수행.`,
      design_delta: {
        added_collaborations: [{ from: a, to: b, message: "perform()" }],
      },
      tradeoffs: {
        pros: ["조회 메시지 감소", "데이터 곁에 행위", "캡슐화 강화"],
        cons: ["수신자가 무거워질 수 있음"],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "조영호님이 강조하는 객체지향의 기본기. 우선 시도 가치가 가장 높음.",
      },
    },
    {
      id: "shape-pull",
      label: "Pull (조회) 모델",
      summary: `${a}이 ${b}에게서 데이터를 조회한 뒤 ${a} 자신이 결정/행동한다.`,
      design_delta: {
        added_collaborations: [{ from: a, to: b, message: "getState()" }],
      },
      tradeoffs: {
        pros: ["호출자가 흐름을 한곳에서 통제"],
        cons: ["Feature Envy 발생 가능", "캡슐화 약화"],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "hurts",
        testability: "neutral",
        notes: "Tell-Don't-Ask가 어려운 경우(외부 시스템 데이터 등)에만 사용.",
      },
    },
    {
      id: "shape-event",
      label: "이벤트/알림 모델",
      summary: `${a}이 사건을 발행하고 관심 있는 ${b}이 이를 구독해 자체적으로 반응한다.`,
      design_delta: {
        added_collaborations: [{ from: a, to: b, message: "<event>" }],
      },
      tradeoffs: {
        pros: ["발신자가 수신자를 알 필요 없음", "확장 용이"],
        cons: ["흐름 추적이 어려워짐", "디버깅 비용 증가"],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "neutral",
        notes: "도메인 이벤트가 자연스러운 모델일 때만 채택.",
      },
    },
    {
      id: "shape-mediator",
      label: "Mediator 도입",
      summary: `${a}과 ${b} 사이에 Mediator를 두고 양쪽 모두 Mediator만 안다.`,
      design_delta: {
        added_classes: [{ name: `${a}${b}Mediator`, stereotype: "Coordinator" }],
        added_collaborations: [
          { from: a, to: `${a}${b}Mediator`.toLowerCase(), message: "notify()" },
          { from: `${a}${b}Mediator`.toLowerCase(), to: b, message: "perform()" },
        ],
      },
      tradeoffs: {
        pros: ["양쪽 직접 결합이 사라진다"],
        cons: ["객체 수 증가", "단순 호출에는 과한 구조"],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "improves",
        testability: "neutral",
        notes: "협력 그래프 사이클이나 다대다 결합이 있을 때만 고려.",
      },
    },
  ];
}
