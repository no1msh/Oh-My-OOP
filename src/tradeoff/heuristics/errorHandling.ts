import type { AlternativeSeed } from "../engine.js";

// "*외부에서 들어온 잘못된 입력*을 어떻게 다룰까" — 재입력/예외/Result/null+while 선택.
// 근거: lotto PR #5, #36, #50, #90 (입력 검증 + 재입력 흐름).

export function errorHandlingSeeds(targetName: string): AlternativeSeed[] {
  const T = targetName || "Input";
  return [
    {
      id: "eh-runcatching-loop",
      label: "runCatching + 외부 루프",
      summary:
        `${T} 처리 메서드는 require로 *unhappy path를 예외로* 끝낸다. ` +
        `재시도 흐름은 호출 지점에서 \`runCatching { ... }.onFailure { ... }\` 루프로 표현.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "*도메인 객체는 unhappy path를 모름* — 단일 책임 유지",
          "재시도 정책이 *Coordinator/Controller에 한 곳에서* 표현",
          "*invariant가 깨지면 예외*라는 Kotlin 관용을 따름",
        ],
        cons: [
          "예외가 *제어 흐름*으로 쓰이면 비용/혼란 증가",
          "runCatching이 catch-all로 동작 — *예상치 못한 예외*도 같이 삼킬 위험",
          "Result 체이닝 깊이가 깊어지면 코드 가독성 저하",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "도메인은 *행복 경로*만 안다는 분리가 가장 객체지향적.",
      },
    },
    {
      id: "eh-null-while",
      label: "null + while 루프",
      summary:
        `재입력이 필요하면 \`tryParse()\`가 null을 반환하고 호출자가 \`while (result == null) { ... }\`로 ` +
        `반복한다. 예외를 *흐름 제어로 쓰지 않는* 보수적 선택.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "예외를 흐름으로 쓰지 않음 — 성능/관용 모두 안전",
          "null이 *복구 가능한 실패*임을 타입이 알려줌",
          "단순한 입력 재시도에 가장 가벼움",
        ],
        cons: [
          "*실패 이유*가 null 한 종류로 뭉개짐 — 사용자에게 *왜* 실패했는지 알려주기 어려움",
          "null 처리 + 루프가 호출 지점마다 반복 — *재입력 로직 중복*",
          "Kotlin의 *nullable 의미*가 \"실패\" + \"부재\" 두 의미로 오버로드",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "neutral",
        testability: "neutral",
        notes: "*도메인 의미가 단순 부재*에 가깝다면 자연. 실패 이유가 풍부하면 부족.",
      },
    },
    {
      id: "eh-result-type",
      label: "Result<T> / sealed class 타입화",
      summary:
        `\`sealed class ParseResult { data class Ok(val value: T) : ParseResult(); data class Err(val reason: ErrorKind) : ParseResult() }\` ` +
        `같이 *성공/실패를 타입으로* 표현. 호출자가 when으로 분기.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "*실패 이유*를 타입으로 풍부하게 표현 (사용자에게 정확한 안내 가능)",
          "exhaustive when으로 *모든 케이스* 컴파일 검증",
          "예외/null 어느 쪽도 흐름 제어로 쓰지 않음 — *함수형* 스타일",
        ],
        cons: [
          "*결과 타입 보일러플레이트* 증가 (sealed class 정의, when 분기)",
          "호출 사이트마다 ParseResult 처리 — 코드 폭이 늘 수 있음",
          "*Kotlin 표준 Result*와 혼동될 수 있어 도메인용은 별도 명명 필요",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "실패에도 *도메인 의미*가 있다면 가장 정직한 표현.",
      },
    },
    {
      id: "eh-coordinator-policy",
      label: "Coordinator에 *재입력 정책* 격리",
      summary:
        `도메인 객체는 require로 끝나고, 재입력 루프/사용자 안내/포기 조건은 \`InputCoordinator\` 같은 ` +
        `별도 Coordinator가 책임진다. *입력 정책*과 *도메인 invariant*를 객체로 분리.`,
      design_delta: {
        added_classes: [{ name: "InputCoordinator", stereotype: "Coordinator" }],
      },
      tradeoffs: {
        pros: [
          "*재입력 횟수 제한*, *기본값 대체* 같은 정책 변경이 한 곳에서",
          "도메인 객체는 *행복 경로*만 신경 — 인지 부담 분산",
          "테스트가 *입력 정책 vs 도메인 invariant*로 깔끔히 갈림",
        ],
        cons: [
          "객체 수 증가 — *재입력 1회* 같은 단순 도메인엔 과설계",
          "Coordinator가 *상태를 길게 들고 있는* 위험 (lateinit var 등 안티)",
          "*UI 흐름*과 *도메인*을 잇는 추가 레이어가 호출 그래프를 깊게 함",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "*재입력이 정책이 되는 순간* Coordinator로 끌어올리는 것이 정직.",
      },
    },
  ];
}
