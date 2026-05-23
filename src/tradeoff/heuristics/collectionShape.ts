import type { AlternativeSeed } from "../engine.js";

// "*List<T>를 그대로 쓸까, 일급 컬렉션으로 감쌀까*" — Kotlin 도메인에서 자주 보이는 결정.
// 근거: lotto PR #80, #119, #144 — 특히 #144 @krrong 균형 답변
// ("역할 없으면 안 만드는 것도 합리. 단 의미/불변성/확장성은 일급 컬렉션 장점").

export function collectionShapeSeeds(targetName: string): AlternativeSeed[] {
  const T = targetName || "Items";
  const single = T.replace(/s$/i, "") || "Item";
  return [
    {
      id: "cs-first-class",
      label: "일급 컬렉션 (행위 보유)",
      summary:
        `${T}을 일급 컬렉션으로 도입하고, *그 위에서만 의미 있는 행위*(합계/일치/우승자 판정/필터)를 ` +
        `${T} 안으로 끌어온다. 외부에서 List<${single}>를 풀어 다루는 코드는 사라진다.`,
      design_delta: {
        added_classes: [{ name: T, stereotype: "Structurer" }],
      },
      tradeoffs: {
        pros: [
          "도메인 어휘가 코드에 드러남 (\"List<Lotto>\" 대신 \"Lottos.match(winning)\")",
          "*컬렉션 불변성*을 게이트로 보장 (MutableList 변형 방지)",
          "도메인 행위가 더 늘어도 한 곳에 모임 (확장성)",
          "*Feature Envy*를 자연스럽게 제거",
        ],
        cons: [
          "*역할 없는 wrapper*가 되면 한 겹 간접 비용만 더함",
          "Kotlin 표준 컬렉션 API(map/filter/sumOf)를 *그대로 노출하려면* 위임 코드 작성",
          "*초기에 행위가 없으면* 인위적 메서드를 만들 위험",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "@krrong: \"로또 묶음이 하는 일이 생겼을 때 일급 컬렉션에 로직만 추가하면 되니 변경이 좀 더 자유로움\".",
      },
    },
    {
      id: "cs-raw-list",
      label: "List<T> 직접 사용",
      summary:
        `${T} wrapper 없이 \`List<${single}>\`를 그대로 사용. 컬렉션 위에서 도는 도메인 계산은 ` +
        `별도 ServiceProvider(또는 확장 함수)로 분리.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "객체 수 최소 — Kotlin 컬렉션 표준 API를 자연스럽게 활용",
          "*행위가 정말 없다면* 정직한 선택 (@krrong: \"만들지 않는 것도 좋은 근거\")",
          "*죽은 추상* 회피",
        ],
        cons: [
          "도메인 의미 상실 (\"List<Lotto>\"가 *어떤 컬렉션인지* 타입에 안 보임)",
          "*불변성 보장*이 약함 — MutableList가 우연히 넘어가도 컴파일러가 막지 못함",
          "이후 행위가 생기면 *흩어진 호출 지점을 모으는* 비용 발생",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "hurts",
        testability: "neutral",
        notes: "도메인 행위가 *진짜로 없는* 단계에서는 정직한 선택이지만 행위가 생기면 회수 신호.",
      },
    },
    {
      id: "cs-typealias",
      label: "typealias로 *이름만* 부여",
      summary:
        `\`typealias ${T} = List<${single}>\`로 이름만 부여한다. 런타임 구조는 같지만 *읽는 사람*에게 ` +
        `의도를 전달.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "객체 추가 없이 *도메인 어휘*만 회복",
          "Kotlin 표준 API 그대로 사용 가능 (위임 코드 0)",
          "*리팩토링 마중물*로 좋음 — 추후 진짜 일급 컬렉션으로 승격하기 쉬움",
        ],
        cons: [
          "typealias는 *컴파일러 단계에서 동일 타입* — 인자 순서 실수 차단 안 됨",
          "*불변성/도메인 행위*는 여전히 부재",
          "리뷰어가 \"왜 typealias죠?\"를 물을 수 있음 — 의도 명시 필요",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "neutral",
        testability: "neutral",
        notes: "*이름만 회복*하는 카드. 행위가 자라면 일급 컬렉션으로, 안 자라면 typealias도 정직.",
      },
    },
    {
      id: "cs-inline-class-wrapper",
      label: "value class wrapper + 위임",
      summary:
        `\`@JvmInline value class ${T}(val items: List<${single}>)\`로 감싸 *0 비용*으로 타입 안전성을 얻고, ` +
        `필요한 행위만 메서드로 노출한다.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "*원시값 수준* 비용 + 도메인 어휘 회복",
          "Int/Long 위치와 마찬가지로 컴파일러가 *List<T>와 ${T}를 구분*",
          "행위 추가가 점진적으로 가능",
        ],
        cons: [
          "value class 제약: nullable/제네릭 위치에서 박싱",
          "Kotlin 표준 컬렉션 API를 *위임 메서드로 다시 노출*해야 함 (Iterable 위임 패턴)",
          "직렬화/리플렉션 호환성 검증 필요",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "*비용 부담 없이* 이름과 안전성을 회복하는 카드. 행위 자라기 전 단계에 적합.",
      },
    },
  ];
}
