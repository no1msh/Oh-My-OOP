import type { Design, CrcCard } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 검증/유효성 책임이 여러 stereotype에 분산되어 있으면 경고한다.
// 우아한테크코스 racing-car 미션에서 가장 흔하게 학생들이 헷갈리는 주제.
//
// 권장 3분류:
//   - UI 형식 검증 (빈 문자열, 숫자 아님)     → Interfacer
//   - 사용자 입력 정책 (재입력 흐름)          → Coordinator
//   - 도메인 무결성 invariant (길이/중복/범위) → InformationHolder / Structurer 의 init

const VALIDATION_RE = /(검증|유효성|확인|검사|validate|valid|check|verify)/i;

function hasValidationResponsibility(card: CrcCard): boolean {
  const all = [...card.responsibilities.knowing, ...card.responsibilities.doing];
  return all.some((r) => VALIDATION_RE.test(r));
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[()\[\]{}.,;:!?]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1),
  );
}

function sharedDomainTokens(a: CrcCard, b: CrcCard): string[] {
  const at = tokenize(
    [...a.responsibilities.knowing, ...a.responsibilities.doing].join(" "),
  );
  const bt = tokenize(
    [...b.responsibilities.knowing, ...b.responsibilities.doing].join(" "),
  );
  const out: string[] = [];
  for (const t of at) if (bt.has(t)) out.push(t);
  return out;
}

export function checkValidationLocation(design: Design): Finding[] {
  const validators = design.classes.filter(hasValidationResponsibility);
  if (validators.length < 2) return [];

  const out: Finding[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < validators.length; i++) {
    for (let j = i + 1; j < validators.length; j++) {
      const a = validators[i]!;
      const b = validators[j]!;
      const shared = sharedDomainTokens(a, b).filter(
        (t) => !VALIDATION_RE.test(t),
      );
      if (shared.length < 2) continue; // 같은 도메인 개념 공유가 약하면 분산이 아님

      // 두 카드의 stereotype 조합으로 분산 패턴 판정
      const stPair = [a.stereotype, b.stereotype].sort().join("+");

      // 같은 stereotype이면 중복일 수 있으나 다른 stereotype이면 분산
      if (a.stereotype === b.stereotype) continue;

      const key = `${a.id}+${b.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push(
        assertHasMultipleRemedies({
          rule_id: "validation-misplacement",
          severity: "warn",
          target: { kind: "class", id: a.id },
          message:
            `${a.name}(${a.stereotype})과 ${b.name}(${b.stereotype})이 같은 도메인 개념(${shared
              .slice(0, 3)
              .join(", ")})의 검증을 양쪽에서 수행합니다. ` +
            `검증 책임이 분산되어 있어 변경 시 양쪽 모두 수정해야 할 위험이 있습니다.`,
          evidence: {
            paired_with: b.name,
            paired_stereotype: b.stereotype,
            shared_concepts: shared,
            stereotype_pair: stPair,
            guideline:
              "권장 3분류 — UI 형식: Interfacer / 입력 정책: Coordinator / 도메인 invariant: InformationHolder·Structurer init",
          },
          remedies: [
            {
              label: "도메인 invariant를 InformationHolder/Structurer init으로 통합",
              summary:
                `검증의 *최종 진실*을 도메인 객체에 두고, 외부 검증은 제거한다. ` +
                `호출 측은 도메인 생성 시점에 require/init으로 보호받는다.`,
              tradeoffs: {
                pros: [
                  "검증 위치가 단일 (이중 검증 제거)",
                  "도메인 진입점이 곧 검증 경계",
                  "리뷰어 다수가 권장한 표준 패턴",
                ],
                cons: [
                  "도메인 init이 무거워질 수 있음",
                  "재입력 흐름과 도메인 예외를 호출 측이 어떻게 처리할지 결정 필요",
                ],
              },
            },
            {
              label: "Interfacer는 형식만, 도메인은 무결성만 (책임 분할)",
              summary:
                `${a.name}/${b.name} 중 하나는 UI 형식 검증(빈 문자열, 숫자 아님)만, ` +
                `다른 하나는 도메인 invariant(길이/중복/범위)만 갖도록 책임을 갈라낸다. ` +
                `같은 토큰을 다루더라도 *검증의 종류*가 다르면 분산이 아님.`,
              tradeoffs: {
                pros: [
                  "각 stereotype에 맞는 검증만 남음",
                  "Interfacer 변경(UI 형식 변경)이 도메인에 영향 없음",
                ],
                cons: [
                  "같은 입력값이 두 단계를 거치므로 호출 흐름이 복잡해짐",
                  "어디까지가 \"형식\"이고 어디부터가 \"무결성\"인지 팀 합의 필요",
                ],
              },
            },
            {
              label: "Coordinator가 재입력 흐름만 담당하도록 분리",
              summary:
                `Coordinator는 \"검증 실패 시 재입력\" 같은 사용자 입력 정책만 갖고, ` +
                `실제 검증 로직은 Interfacer(형식) 또는 도메인(무결성)이 담당한다.`,
              tradeoffs: {
                pros: [
                  "Coordinator가 검증 규칙을 *알지 않게* 됨",
                  "흐름 변경(재입력 vs 종료)이 검증 로직 변경과 분리됨",
                ],
                cons: [
                  "단순 미션에서는 과한 분리일 수 있음",
                ],
              },
            },
          ],
        }),
      );
    }
  }
  return out;
}
