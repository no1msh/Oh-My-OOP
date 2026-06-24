import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 계층 누수(presentation-in-domain): 도메인 stereotype(비-Interfacer)이 표현/출력 책임을 가짐.
// 예) InformationHolder가 자기 상태를 표시 문자열로 포맷(toString/getStatus류).
// 표현 형식 결정은 Interfacer(View)의 자리다 (Wirfs-Brock stereotype, 조영호).
// 도메인이 표시 문자열을 만들면 출력 형식이 바뀔 때 도메인이 오염된다.
//
// 주의: 설계 모델의 *책임 문구*에 대한 휴리스틱이다(코드 파싱 아님) → 권고(warn), 오탐 가능.
const PRESENTATION_RE =
  /(출력|화면|콘솔|포맷|렌더|문자열로\s*(표현|표시|변환|만든)|표시한다|toString|\bprint|\brender|\bformat|\bdisplay)/i;

export function checkPresentationInDomain(design: Design): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    // 표현은 Interfacer의 정당한 책임 → 면제
    if (card.stereotype === "Interfacer") continue;
    const offenders = card.responsibilities.doing.filter((d) => PRESENTATION_RE.test(d));
    if (offenders.length === 0) continue;
    out.push(
      assertHasMultipleRemedies({
        rule_id: "presentation-in-domain",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}(${card.stereotype})이(가) 표현/출력 책임(${offenders
            .map((o) => `"${o}"`)
            .join(", ")})을 가집니다. ` +
          `표현 형식 결정은 Interfacer(View)의 자리입니다 — 도메인 객체가 표시 문자열을 만들면 출력 형식 변경이 도메인을 오염시킵니다.`,
        evidence: { stereotype: card.stereotype, offending_responsibilities: offenders },
        remedies: [
          {
            label: "표현 책임을 Interfacer로 이전",
            summary:
              "표시 형식 결정을 View/OutputView 같은 Interfacer로 옮기고, 도메인은 값/상태만 노출한다.",
            tradeoffs: {
              pros: ["출력 형식 변경이 도메인을 건드리지 않는다", "도메인이 순수해져 단위 테스트가 쉽다"],
              cons: ["뷰가 도메인 값을 읽게 되어 약한 노출이 생긴다"],
            },
          },
          {
            label: "표시용 값 객체를 반환",
            summary:
              "포맷된 문자열 대신 구조화된 표시용 값(예: 이름+위치)을 반환하고, 포맷은 호출측(뷰)이 결정한다.",
            tradeoffs: {
              pros: ["뷰가 도메인 내부가 아니라 명시적 계약에 의존한다", "도메인 내부 리팩터링에 강하다"],
              cons: ["표시용 타입이 하나 늘어난다"],
            },
          },
          {
            label: "단순 케이스면 의도를 명시하고 유지",
            summary: "출력 형식이 사소하고 변하지 않는다면 notes에 사유를 적고 유지한다.",
            tradeoffs: {
              pros: ["작은 미션에 실용적이다", "객체 수가 최소화된다"],
              cons: ["형식 변경 시 도메인 수정이 필요하다", "stereotype 경계가 흐려진다"],
            },
          },
        ],
      }),
    );
  }
  return out;
}
