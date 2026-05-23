import type { AlternativeSeed } from "../engine.js";

// "정책/전략을 *interface로* 풀까 *enum*으로 풀까" — Kotlin 도메인의 빈번한 결정.
// 근거: lotto PR #131, #144, #147 (LottoMachine/LottoRank/등급 결정).

export function strategyOrPolicySeeds(targetName: string): AlternativeSeed[] {
  const T = targetName || "Decision";
  return [
    {
      id: "sp-interface",
      label: "Strategy interface + 구현체",
      summary:
        `${T}을 인터페이스로 선언하고 구현체를 주입한다. 각 구현체는 *자기 상태/의존*을 ` +
        `생성자로 받는다 (예: ManualLottoMachine(numbers), AutomaticLottoMachine(random)).`,
      design_delta: {
        added_classes: [{ name: `${T}Strategy`, stereotype: "ServiceProvider" }],
      },
      tradeoffs: {
        pros: [
          "구현체별 *자기 상태*를 생성자로 받아 인터페이스 시그니처를 정화",
          "테스트에서 *페이크 구현체* 주입 용이 (Random/Clock 같은 non-newable 분리)",
          "새 정책 추가가 *새 클래스 추가*로 끝남 (OCP에 가까움)",
        ],
        cons: [
          "구현체별 *생성/주입* 책임이 호출 지점에 분산",
          "정책이 1~2종에서 끝나면 *과설계*",
          "*케이스 추가의 폐쇄성*이 깨질 수 있음 — sealed가 아니라면 컴파일러가 누락 케이스를 알려주지 못함",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "*다형성으로 정책을 표현*하는 가장 객체지향적인 선택.",
      },
    },
    {
      id: "sp-enum-policy",
      label: "enum class + 케이스별 동작",
      summary:
        `${T}을 enum으로 정의하고 각 상수가 자기 데이터를 가지거나 추상 메서드를 오버라이드한다. ` +
        `예: enum class Rank(val matchCount: Int, val money: Long) { FIRST(6, ...), SECOND(5, ...) }`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "케이스가 *닫혀 있음*이 타입에 드러나 when exhaustive 보장",
          "각 케이스의 *영구한 도메인 데이터*가 한 자리에 모임",
          "*수가 적고 변하지 않는* 정책에 가벼움",
        ],
        cons: [
          "케이스마다 의존 주입 어려움 — 생성자가 *정적 데이터*에 한정",
          "*동작이 외부 상태에 의존*해야 하면 enum이 깨지기 시작",
          "ordinal 기반 코드 결합 위험 (\"첫 번째 enum이 0등\" 같은 암묵적 가정)",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "neutral",
        testability: "neutral",
        notes: "lotto Rank처럼 *고정 도메인 사실*을 표현할 때 자연. 외부 의존이 끼면 interface로 전환 신호.",
      },
    },
    {
      id: "sp-sealed-class",
      label: "sealed class + when 분기",
      summary:
        `${T}을 sealed class(또는 sealed interface)로 만들어 *닫힌 다형성*을 표현. ` +
        `케이스마다 *서로 다른 필드*를 가질 수 있어 enum의 한계를 보완.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "케이스별 *서로 다른 데이터 모양*을 자연스럽게 표현 (Manual(numbers) vs Automatic)",
          "when 표현식이 *모든 케이스를 컴파일 단계에서* 강제 — 누락 차단",
          "enum 대비 *상속/생성자 자유도* 확보",
        ],
        cons: [
          "변형 추가가 모든 when 분기 수정 비용 유발 (OCP 약화)",
          "when 분기가 코드 곳곳에 흩어지면 *추상화 누설*",
          "외부 의존 주입은 여전히 *생성자 의존*",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "neutral",
        testability: "improves",
        notes: "다형성과 enum의 *중간 지점*. 변형 데이터 모양이 다를 때 선택.",
      },
    },
    {
      id: "sp-functional",
      label: "함수 타입(고차 함수) 정책",
      summary:
        `${T}을 별도 객체 없이 \`(Input) -> Output\` 함수 타입으로 주입한다. ` +
        `간단한 정책(예: random 선택 함수)에 가장 가벼움.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "*케이스 추가 = 람다 작성*으로 최소 비용",
          "테스트에서 *람다 stub*으로 매우 간결",
          "*Random/Clock* 같은 외부 의존 분리에 자연 (Kotlin functional interface)",
        ],
        cons: [
          "함수 시그니처만 봐서는 *의도*가 코드에 드러나지 않음",
          "*명명되지 않은 정책*이 호출 그래프에 떠다니면 디버깅 비용 증가",
          "정책 수가 늘면 다시 객체화가 필요 — 마이그레이션 비용",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "improves",
        testability: "improves",
        notes: "정책이 *얇고 일회성*일 때 자연. 본격 도메인이 되면 객체로 승격 신호.",
      },
    },
  ];
}
