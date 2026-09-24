import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 한 데이터(value, score 등)가 *표현(출력/렌더링)*과 *비교/판정* 두 책임에 묶이는 안티패턴.
// 외관상 같은 데이터라도 *답해야 할 메시지가 다르면 다른 모델*이다.
//
// 근거: lessons/woowacourse-kotlin-blackjack aprilgom/105 (laco-dev):
//   "승패를 비교할 때는 strength를 이용하고, 점수 출력을 할 때에는
//    손에 있는 카드 점수의 총합을 이용해 출력합니다."

const DISPLAY_VERBS = [
  "display",
  "render",
  "format",
  "show",
  "print",
  "tostring",
  "astext",
  "출력",
  "표시",
  "포맷",
  "보여",
  "그려",
];

const COMPARE_VERBS = [
  "compare",
  "beat",
  "judge",
  "match",
  "winsagainst",
  "isabove",
  "isbelow",
  "isgreater",
  "isless",
  "strength",
  "rank",
  "비교",
  "이기",
  "지는",
  "판정",
  "우열",
  "승부",
];

function findFirstMatch(doings: string[], vocab: string[]): string | null {
  for (const d of doings) {
    const lower = d.toLowerCase();
    for (const v of vocab) {
      if (lower.includes(v)) return d;
    }
  }
  return null;
}

export function checkDualPurposeKnowing(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    if (
      card.stereotype !== "InformationHolder" &&
      card.stereotype !== "Structurer"
    )
      continue;

    const doing = card.responsibilities.doing;
    if (doing.length < 2) continue;

    const displayHit = findFirstMatch(doing, DISPLAY_VERBS);
    const compareHit = findFirstMatch(doing, COMPARE_VERBS);
    if (!displayHit || !compareHit) continue;
    // 같은 doing 문자열 한 줄이 양쪽 vocab 모두 매치하면 중복 카운트 방지.
    if (displayHit === compareHit) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "dual-purpose-knowing",
        severity: "info",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은(는) 같은 데이터에 *표현(출력/렌더링)* 책임과 *비교/판정* 책임이 동시에 묶여 있는 신호입니다. ` +
          `외관상 같은 데이터라도 *답해야 할 메시지가 다르면 다른 모델*입니다.`,
        evidence: {
          stereotype: card.stereotype,
          display_doing: displayHit,
          compare_doing: compareHit,
          guideline:
            "@laco-dev (woowacourse-kotlin-blackjack aprilgom/105): " +
            "\"승패를 비교할 때는 strength를 이용하고, 점수 출력을 할 때에는 손에 있는 카드 점수의 총합을 이용해 출력합니다.\" " +
            "— 같은 점수도 *표시용*과 *비교용*이 다를 수 있다는 인사이트. " +
            "데이터의 *모양*이 아니라 *답해야 할 메시지*가 모델링의 기준이다.",
        },
        remedies: [
          {
            label: "두 메서드로 책임 분리 (displayX vs strength/compare)",
            summary:
              `${card.name}이 표현용과 비교용 *두 메서드*를 명시적으로 갖게 한다. ` +
              `예: \`displayValue()\` 와 \`strength()\`. 같은 knowing 을 참조하더라도 ` +
              `*답하는 메시지가 다름*을 시그니처에 드러낸다.`,
            tradeoffs: {
              pros: [
                "*책임이 다르면 다른 메서드*라는 의도가 코드에 드러남",
                "외부에서 *비교용*과 *표시용*을 혼동하지 않음",
                "한 책임 변경이 다른 책임에 영향 X",
              ],
              cons: [
                "메서드 수 증가",
                "두 값이 *대부분 같다*면 중복으로 보일 수 있음 — 차이가 *예외 케이스*에 있다면 가치 명확",
              ],
            },
          },
          {
            label: "State 객체에 위임 — 상태별 다형성으로 두 책임 표현",
            summary:
              `${card.name}이 *상태(sealed State)*를 가지고, 표현/비교 둘 다 State 객체에 위임. ` +
              `각 상태가 \`displayValue()\` 와 \`strength()\` 를 다형성으로 다르게 응답.`,
            tradeoffs: {
              pros: [
                "*상태별 고유 행동*을 다형성으로 자연 표현",
                "분기 N×M 폭증 회피",
                "두 책임이 *한 자리(State)*에 응집",
              ],
              cons: [
                "State 패턴 도입 비용 — sealed/abstract 계층 추가 학습",
                "단순 케이스에는 과설계",
              ],
            },
          },
          {
            label: "두 값 객체로 분리 (DisplayValue vs ComparisonStrength)",
            summary:
              `${card.name}의 데이터를 *두 별도 값 객체*로 분리. 표현용은 \`DisplayValue\`, ` +
              `비교용은 \`Strength\`. ${card.name}이 두 값을 *동시에 보유*하거나, 두 값이 ` +
              `*별도 도메인 객체*에 속하게 한다.`,
            tradeoffs: {
              pros: [
                "값 객체 단위에서 invariant 분리 가능",
                "*서로 다른 invariant*가 명시적으로 드러남",
              ],
              cons: [
                "값 객체 수 증가",
                "*거의 같은 데이터*라면 두 객체 간 동기화 비용",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
