import type { Design, CrcCard } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// "Manager", "Util", "Helper" 등 일반 어휘만으로 이루어진 클래스명은 책임 회피의 신호.
// woowacourse/kotlin-racingcar 133 PR 리뷰에서 가장 빈번하게 지적된 안티패턴 중 하나.
// 단, 의미 있는 도메인 어휘가 *앞에* 붙으면 책임이 좁혀지므로 허용한다.

const SUSPECT_SUFFIXES = [
  "Manager",
  "Helper",
  "Util",
  "Utils",
  "Service",
  "Handler",
  "Processor",
  "Worker",
  // 가상 객체 어휘 — 행동을 자기 객체가 아닌 *외부 명사*로 분리하려는 신호.
  // 도메인 객체가 그 책임을 이미 가져야 하는 경우가 대부분.
  "Calculator",
  "Picker",
  "Distributor",
  "Decider",
  "Information",
  "Info",
];

// 클래스명 단독으로도 모호한 어휘
const SUSPECT_STANDALONE = new Set([
  "Validator",
  "Validation",
  "Exception",
  "Common",
  "Const",
  "Constants",
  "Util",
  "Utils",
  "Helper",
  "Manager",
  "Service",
  "Handler",
  // 가상 객체 어휘 (단독 사용 시 god-object 거의 확실)
  "Calculator",
  "Picker",
  "Distributor",
  "Judge",
  "Decider",
  "Information",
  "Info",
  "Rule",
]);

interface Hit {
  reason: "suspect-standalone" | "suspect-suffix-only";
  matched: string;
}

function classify(name: string): Hit | null {
  if (SUSPECT_STANDALONE.has(name)) {
    return { reason: "suspect-standalone", matched: name };
  }
  for (const suf of SUSPECT_SUFFIXES) {
    if (name === suf) return { reason: "suspect-standalone", matched: suf };
    if (name.endsWith(suf)) {
      const prefix = name.slice(0, name.length - suf.length);
      // 의미 있는 prefix (3자 이상의 도메인 단어)는 허용
      if (prefix.length < 3) {
        return { reason: "suspect-suffix-only", matched: suf };
      }
    }
  }
  return null;
}

export function checkVagueClassName(design: Design): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    const hit = classify(card.name);
    if (!hit) continue;

    const message =
      hit.reason === "suspect-standalone"
        ? `${card.name}이라는 이름은 무엇을 하는지 모호합니다. ` +
          `네이밍 모호함은 god-object 안티패턴의 신호일 수 있습니다.`
        : `${card.name}은 "${hit.matched}" 접미사 외에 의미 있는 도메인 어휘가 부족합니다. ` +
          `클래스의 책임이 모호하면 god-object가 될 위험이 있습니다.`;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "vague-class-name",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message,
        evidence: {
          name: card.name,
          matched_pattern: hit.matched,
          stereotype: card.stereotype,
          guideline:
            "@vagabond95 (woowacourse-racingcar): \"네이밍이 모호하다는 것은 곧 해당 클래스/함수의 역할이 모호하거나 모호해질 수 있다는 신호\". " +
            "@laco-dev (woowacourse-kotlin-blackjack tobae-time/115): \"현실세계라면 블랙잭 게임의 규칙이지만, 객체지향 세계에서 객체는 모두 스스로 일을 합니다\" — Picker/Distributor/Calculator/Judge 같은 *가상 객체*는 행동을 외부 명사로 분리하려는 신호이며, 도메인 객체가 그 책임을 이미 가져야 한다. " +
            "@ghojeong (woowacourse-kotlin-blackjack kimhm0728/72): \"해당 역할을 컴퓨터가 아니라 사람에게 시키려고 했을 때, 사람이 한 명 더 필요한가\" — 같은 사람이 할 수 있다면 별도 객체로 분리하지 않는다.",
        },
        remedies: [
          {
            label: "무엇을 + 행위로 도메인 어휘 추가",
            summary:
              `현재 클래스가 *무엇을* 검증/관리/돕는지 이름에 명시한다. ` +
              `예: Validator → InputValidator, Manager → RacingGame, Helper → CarsHelper(여전히 모호하면 다음 안).`,
            tradeoffs: {
              pros: [
                "이름만 보고도 책임 범위가 명확해짐",
                "동료가 IDE 자동완성에서 빠르게 찾을 수 있음",
              ],
              cons: [
                "이름이 길어질 수 있음",
                "도메인이 진화하면 이름 갱신 비용",
              ],
            },
          },
          {
            label: "Stereotype에 맞는 역할 이름으로 재명명",
            summary:
              `현재 stereotype(${card.stereotype})에 맞는 역할 어휘로 바꾼다. ` +
              `Coordinator → "${card.name}Coordinator/Service", InformationHolder → 도메인 명사 단독, Interfacer → "${card.name}View/Adapter".`,
            tradeoffs: {
              pros: [
                "Wirfs-Brock stereotype과 이름이 일치해 협력 패턴 예측 가능",
                "리뷰 시 책임 누수 판단이 쉬워짐",
              ],
              cons: [
                "stereotype 자체가 잘못 설정됐다면 잘못된 방향으로 재명명될 위험",
              ],
            },
          },
          {
            label: "협력자에게 책임 이전 후 클래스 삭제",
            summary:
              `이 클래스가 *얇은 위임 계층*에 그친다면, 책임을 진짜 소유자(데이터를 가진 객체)에게 옮기고 클래스 자체를 제거한다.`,
            tradeoffs: {
              pros: [
                "객체 수 감소 + Tell-Don't-Ask 강화",
                "god-folder 안티패턴 회피",
              ],
              cons: [
                "협력자가 비대해질 위험 (다음 라운드에서 god-object 가능성)",
              ],
            },
          },
        ],
      }),
    );
  }
  return out;
}
