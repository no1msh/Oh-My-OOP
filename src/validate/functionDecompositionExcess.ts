import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 한 가지 일을 *짧은 동사 함수 다수*로 쪼개는 안티패턴.
// 대표 사례: WinningDiscriminator init을 compute/extract/build/verify/format/trim 같은
// *도메인 명사 없는 짧은 동사*로 분해 — 의미 없는 단계 노출.
// 근거: lotto 일반 패턴 (MCP_STRUCTURE.md §5) — "함수를 *분리*하는 것이지 *분해*하는 것이 아니다" (@krrong 류 코멘트).

const SHORT_KOREAN_VERB = /^[가-힣]{1,5}(다|기|하기|함|이)?$/;
const SHORT_KOREAN_NOUN = /^[가-힣]{2,4}$/;
const SHORT_ENGLISH_VERB = /^[a-zA-Z]{2,10}$/;

function looksLikeShortStep(doing: string): boolean {
  const t = doing.trim();
  if (t.length === 0) return true; // 빈 책임도 결국 같은 시그널
  if (t.length > 14) return false; // 충분히 길면 도메인 어휘 동반 가능
  if (SHORT_KOREAN_VERB.test(t)) return true;
  if (SHORT_KOREAN_NOUN.test(t)) return true;
  if (SHORT_ENGLISH_VERB.test(t)) return true;
  return false;
}

function hasDomainNoun(doing: string): boolean {
  const t = doing.trim();
  // 길이가 충분히 길고 공백/조사 포함이면 도메인 어휘 가능성이 큼.
  if (t.length > 14) return true;
  // 명백한 도메인 명사 토큰 — 영어 PascalCase 단어, 한국어 4글자 이상 명사 추정
  if (/[A-Z][a-z]+[A-Z]/.test(t)) return true; // CamelCase
  if (/[가-힣]{5,}/.test(t)) return true;
  return false;
}

export function checkFunctionDecompositionExcess(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    // Interfacer는 어댑터로서 짧은 메서드 다수가 자연스러움 — 스킵.
    if (card.stereotype === "Interfacer") continue;

    const doing = card.responsibilities.doing;
    if (doing.length < 4) continue;

    const shortSteps = doing.filter((d) => looksLikeShortStep(d));
    const allShort = shortSteps.length === doing.length;
    if (!allShort) continue;

    const anyDomainNoun = doing.some((d) => hasDomainNoun(d));
    if (anyDomainNoun) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "function-decomposition-excess",
        severity: "info",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}의 doing 책임이 ${doing.length}개로 *짧은 동사*에 머물러 있고, 도메인 명사가 보이지 않습니다. ` +
          `한 가지 일을 의미 없는 단계들로 *분해*했을 가능성이 있습니다. ` +
          `함수는 *분리*되어야 하지 *분해*되어선 안 됩니다 — 각 조각이 자기 이름값을 해야 합니다.`,
        evidence: {
          doing_count: doing.length,
          short_step_samples: doing.slice(0, 4),
          guideline:
            "lotto 일반 가르침: \"*함수를 분리하는 것이지 분해하는 것이 아니다*\". " +
            "한 동작을 6개 헬퍼로 쪼개도 각 헬퍼가 도메인을 표현하지 않으면 *의미가 한 곳에 흩어지기만* 한다.",
        },
        remedies: [
          {
            label: "도메인 어휘로 *재명명* — 단계가 아니라 의도",
            summary:
              `각 doing을 *무엇을 하는가*가 아니라 *왜 하는가*로 다시 이름 짓는다. ` +
              `예: extract → \"당첨 번호 추출\", verify → \"중복 없음 보장\". ` +
              `이름이 바뀌면 분리가 정당해지고, 정당화되지 않는 조각은 합쳐진다.`,
            tradeoffs: {
              pros: [
                "각 조각이 *왜 존재하는지* 코드만 봐도 드러남",
                "재명명 과정에서 *합쳐야 할 조각*이 자연스럽게 식별됨",
                "리뷰어가 \"이 단계는 왜 있죠?\"를 물을 일이 줄어듦",
              ],
              cons: [
                "이름 자체가 길어져 라인 폭이 늘 수 있음",
                "기존 호출자의 메서드명 의존이 깨질 수 있음 (검색/리네임 비용)",
              ],
            },
          },
          {
            label: "단계 *재흡수* — 한 메서드 안으로 합치기",
            summary:
              `이름값 못 하는 조각들을 한 도메인 메서드 안의 *지역 변수/표현식*으로 합친다. ` +
              `여러 헬퍼가 단 한 곳에서만 불린다면, 헬퍼는 *변수 하나*만큼의 가치도 못 한다.`,
            tradeoffs: {
              pros: [
                "*단일 사용 헬퍼* 제거로 호출 그래프 단순화",
                "맥락이 한 자리에 모여 *읽기 흐름*이 끊기지 않음",
                "테스트가 *행위 단위*로 작성되어 단계별 결합 감소",
              ],
              cons: [
                "메서드 한 개의 라인 수가 증가",
                "조각마다 단위 테스트하던 패턴이 깨짐 — 더 큰 단위 테스트가 필요",
              ],
            },
          },
          {
            label: "*진짜 협력자*로 단계를 객체화",
            summary:
              `조각 중 *2개 이상*이 한 도메인 개념(예: NumberExtractor, DuplicationGuard)을 함께 ` +
              `표현한다면 새 ServiceProvider로 빼서 ${card.name}의 협력자가 되게 한다. ` +
              `*함수 분해*가 아니라 *객체 분리*로 승격.`,
            tradeoffs: {
              pros: [
                "함수 다수가 *진짜 책임*을 가진 객체로 승격",
                "테스트 단위가 *객체 경계*로 다시 정렬됨",
                "OCP에 가까워짐 — 새 정책 추가가 새 객체로 가능",
              ],
              cons: [
                "객체 수 증가 — 통증이 적다면 과설계",
                "협력 그래프가 복잡해져 *호출 흐름 추적* 비용 증가",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
