import type { AlternativeSeed } from "../engine.js";

// "값 객체를 어떤 *모양*으로 만들 것인가" — Kotlin 도메인에서 자주 보이는 결정.
// 근거: lotto PR #8, #40, #49, #64, #75, #87, #131 (LottoNumber/Money/Profit/Rank 등).

export function valueObjectShapeSeeds(targetName: string): AlternativeSeed[] {
  const T = targetName || "Value";
  return [
    {
      id: "vo-value-class",
      label: "value class",
      summary:
        `${T}을 \`value class\`로 선언한다. 컴파일러가 인라이닝해 원시값 수준 비용을 유지하면서, ` +
        `타입 안전성과 init invariant를 모두 얻는다.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "원시값 수준의 런타임 비용 (래퍼 할당 회피)",
          "Int/Long과 컴파일러 단계에서 구분되어 인자 순서 실수 차단",
          "init require로 *유효한 값만 존재* 보장",
          "*고빈도 생성* 도메인(LottoNumber 등)에 특히 유리",
        ],
        cons: [
          "value class 제약: secondary constructor 불가, equals/hashCode 커스터마이즈 제한",
          "nullable/제네릭/list 안에 들어가면 *박싱* 발생 (인라이닝 깨짐)",
          "필드가 *정확히 하나*여야 함 — 복합 값에는 부적합",
          "리플렉션/직렬화 라이브러리와의 호환성 검증 필요",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "단일 필드 + invariant가 본질인 값 객체에 가장 정직한 모양.",
      },
    },
    {
      id: "vo-data-class",
      label: "data class",
      summary:
        `${T}을 \`data class\`로 선언한다. equals/hashCode/toString/copy/구조 분해를 자동 생성하며 ` +
        `여러 필드를 자연스럽게 표현한다.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "*여러 필드*로 구성된 값 객체에 적합 (Money(amount, currency) 같은)",
          "copy()로 변경된 사본 생성 — 불변성 유지가 쉬움",
          "equals/hashCode가 *값 기반*으로 자동 — 컬렉션 사용 안전",
          "구조 분해 선언으로 호출 측 코드 간결화",
        ],
        cons: [
          "단일 원시 필드에는 *과한 비용* — value class 대비 인스턴스 할당 비용",
          "*copy()의 invariant 우회* 위험 — copy는 init 호출하지만 호출자가 검증 의도를 깨기 쉬움",
          "data class를 *상속*하면 equals가 깨질 수 있음 (final 클래스로 두는 게 안전)",
        ],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "neutral",
        testability: "improves",
        notes: "필드가 2개 이상이거나 destructuring/copy가 자주 쓰일 때 정당.",
      },
    },
    {
      id: "vo-class-with-init",
      label: "일반 class + init require",
      summary:
        `${T}을 일반 \`class\`로 선언하고 init 블록에서 invariant를 강제한다. ` +
        `생성자 가시성을 \`private\`으로 두고 팩토리 메서드로 *입력 변환*을 분리.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "private constructor + factory 패턴으로 *생성 정책*과 *invariant 검증*을 분리",
          "value/data class 제약(필드 1개, 상속 불가 등)에 묶이지 않음",
          "복잡한 invariant(예: 1..45 AND 짝수) 표현 자유도 가장 높음",
        ],
        cons: [
          "보일러플레이트 — equals/hashCode/toString 직접 작성",
          "*값 비교* 의미를 코드에 명시하지 않으면 자칫 *참조 비교*로 회귀",
          "리뷰어가 \"왜 data class가 아니죠?\"를 반복 질문",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "neutral",
        testability: "neutral",
        notes: "값 객체 의미를 *명시적으로 표현*해야 가치를 회복.",
      },
    },
    {
      id: "vo-keep-primitive",
      label: "원시값 유지 + 검증을 호출 지점에 분산",
      summary:
        `${T}을 별도 클래스로 만들지 않고 Int/String 등을 그대로 쓰며, 검증은 *진짜 도메인 객체*가 ` +
        `생성 시점에 한다. 일종의 *Primitive Obsession 수용*.`,
      design_delta: {},
      tradeoffs: {
        pros: [
          "객체 수 최소화 — 단순 도메인에 가벼움",
          "Kotlin 산술/비교 연산을 그대로 활용",
          "*검증이 정말 한 자리*에서만 일어난다면 합리적 선택",
        ],
        cons: [
          "도메인 어휘 상실 — Int 한 자리에서 \"번호인지 금액인지\" 의미가 사라짐",
          "*같은 검증이 여러 곳에 흩어지면* 누락이 사일런트 버그",
          "인자 순서 실수에 취약 (`fun foo(a: Int, b: Int)`)",
        ],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "hurts",
        testability: "neutral",
        notes: "조영호 「오브젝트」: 도메인 개념이 *코드에 직접 보이지 않으면* 협업이 어려워진다.",
      },
    },
  ];
}
