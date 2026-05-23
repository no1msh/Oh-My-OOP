import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 원시값 wrapper인데 *invariant 검증 의도가 보이지 않는* 안티패턴.
// 대표 사례: class LottoNumber(val value: Int) — init 블록의 require 없음.
// woowacourse/kotlin-lotto: LottoNumber/Money/Profit 다수 PR (특히 @junjange #58, @haeum808 #67).

const WRAPPER_NAME_HINTS =
  /(number|money|count|amount|price|yield|profit|age|quantity|fee|distance|score|index|범위|금액|개수|가격|단위|수량|값|점수)/i;

const PRIMITIVE_TOKEN_HINTS = /(\bint\b|\blong\b|\bdouble\b|\bfloat\b|\bnumber\b|\bvalue\b|\bn\b|숫자|정수|실수|값)/i;

const INVARIANT_INTENT =
  /(require|invariant|범위|검증|보장|validate|init|distinct|중복|min|max|음수|양수|양의|소수)/i;

export function checkPrimitiveWrapperWithoutInvariant(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    if (card.stereotype !== "InformationHolder") continue;

    // 이름이 *값 wrapper*처럼 보이는가
    if (!WRAPPER_NAME_HINTS.test(card.name)) continue;

    const knowing = card.responsibilities.knowing;
    // 단일 knowing이어야 *원시 1개* wrapper. 2개 이상은 다른 종류 holder.
    if (knowing.length !== 1) continue;

    // knowing이 원시 토큰을 시사하는가
    if (!PRIMITIVE_TOKEN_HINTS.test(knowing[0]!)) continue;

    const doing = card.responsibilities.doing;
    const hasInvariantIntent =
      INVARIANT_INTENT.test(knowing[0]!) ||
      doing.some((d) => INVARIANT_INTENT.test(d)) ||
      (card.notes ? INVARIANT_INTENT.test(card.notes) : false);

    if (hasInvariantIntent) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "primitive-wrapper-without-invariant",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은(는) 원시값 1개를 감싸는 InformationHolder인데, *invariant 검증 의도*가 보이지 않습니다. ` +
          `원시 wrapper는 *유효한 값만 존재한다*는 보장을 줄 때 비용이 정당화됩니다. 검증 없이 감싸기만 하면 ` +
          `Int 타입을 *이름만 바꾼* 셈입니다.`,
        evidence: {
          stereotype: card.stereotype,
          knowing_count: knowing.length,
          knowing_token: knowing[0],
          doing_count: doing.length,
          guideline:
            "@junjange (lotto PR #58): \"init { require(lottoNumbers.distinct().size == LOTTO_SIZE) }\" — " +
            "*init 블록의 require는 도메인 invariant 강제 수단*. " +
            "@hxeyexn 리뷰 (PR #77): \"init = 자기 invariant, factory = 입력 변환 + 생성 결정\".",
        },
        remedies: [
          {
            label: "init 블록에 require 추가 (가장 가벼운 시작)",
            summary:
              `${card.name}의 init 블록에서 도메인 범위/규칙을 require로 강제한다. ` +
              `예: LottoNumber → init { require(value in 1..45) }, ` +
              `Money → init { require(value >= 0) }. 생성자 통과 = invariant 보장.`,
            tradeoffs: {
              pros: [
                "wrapper의 *존재 이유*가 코드에 드러남 (유효 범위가 곧 타입)",
                "호출자가 value를 꺼내 재검증할 필요 없음",
                "잘못된 값이 *생성 시점*에 즉시 차단",
              ],
              cons: [
                "검증 실패 시 IllegalArgumentException 흐름을 호출자가 처리해야 함",
                "테스트에서 *경계값*을 매번 충족시켜야 fixture 생성 가능",
              ],
            },
          },
          {
            label: "value class로 전환 + invariant",
            summary:
              `${card.name}을 \`value class\`로 선언해 런타임 할당 비용을 제거하면서 init require를 유지한다. ` +
              `타입 안전성은 그대로, 메모리/객체 생성 비용은 원시값과 동일. ` +
              `LottoNumber처럼 *고빈도 생성*하는 값 객체에 특히 유리.`,
            tradeoffs: {
              pros: [
                "원시값 수준 성능 + 타입 안전성",
                "Int와 *컴파일러 단계*에서 구분되어 인자 순서 실수 차단",
                "Kotlin 표준 패턴 — 학습 비용 낮음",
              ],
              cons: [
                "value class 제약: secondary constructor 불가, equals 커스터마이즈 제한 등",
                "JVM 인라이닝 규칙 학습 필요 (특히 nullable/제네릭 위치에서 박싱)",
              ],
            },
          },
          {
            label: "wrapper 제거 + 호출 지점 *Tell-Don't-Ask*로 검증",
            summary:
              `검증 의도가 정말 없다면 ${card.name} 자체를 제거하고 Int로 되돌린다. 검증이 정말 필요한 곳에서만 ` +
              `그 검증을 가진 *진짜 도메인 객체*(예: Money 대신 PurchaseAmount, LottoNumber 대신 Lotto)에서 ` +
              `처리하게 한다.`,
            tradeoffs: {
              pros: [
                "*역할 없는 wrapper* 제거로 객체 수 감소",
                "Kotlin 산술 연산을 그대로 활용",
                "\"왜 wrapper?\" 라는 반복 리뷰 질문 소멸",
              ],
              cons: [
                "도메인 어휘 상실 (Int 한 자리에 *번호인지 금액인지* 의미가 사라짐)",
                "*Primitive Obsession* 안티패턴으로 회귀 — 향후 검증 필요해질 때 흩어짐",
                "호출 시그니처가 동일해 *인자 순서 실수*에 취약",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
