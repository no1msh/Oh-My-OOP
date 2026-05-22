import type { Design, CrcCard } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// "객체는 메서드 + 멤버 둘 다" — @ghojeong (PR #128)
// 멤버(knowing) 없이 행위(doing) 하나만 있는 클래스는 사실상 함수.
// "judge() 함수만 가진 Winner 클래스"가 대표 사례.

export function checkFunctionNotObject(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    const knowingCount = card.responsibilities.knowing.length;
    const doingCount = card.responsibilities.doing.length;

    // 멤버 0 + 행위 1개 → 함수에 가까움
    // 단, Interfacer는 외부 시스템과의 어댑터로 knowing이 0일 수 있어 예외
    if (card.stereotype === "Interfacer") continue;
    if (knowingCount > 0) continue;
    if (doingCount !== 1) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "function-not-object",
        severity: "info",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은(는) knowing(멤버)이 없고 doing이 1개뿐이라 사실상 *함수*에 가깝습니다. ` +
          `객체는 메서드와 멤버 둘 다로 구성됩니다.`,
        evidence: {
          knowing_count: knowingCount,
          doing_count: doingCount,
          stereotype: card.stereotype,
          doing_text: card.responsibilities.doing[0],
          guideline:
            "@ghojeong (PR #128): \"객체는 메서드 뿐만 아니라 멤버로도 구성된다는 사실을 잊지 말아주세요.\"",
        },
        remedies: [
          {
            label: "함수로 강등 (top-level 또는 object의 메서드)",
            summary:
              `클래스로 둘 가치가 없다면 일반 함수 또는 object 안의 함수로 옮긴다. ` +
              `호출자가 인스턴스화 부담에서 해방된다.`,
            tradeoffs: {
              pros: [
                "객체 수 감소",
                "호출 단순화 (인스턴스화 불필요)",
                "분리의 정당화가 약한 클래스 제거",
              ],
              cons: [
                "나중에 상태가 추가될 가능성이 있다면 다시 클래스로 되돌리는 비용",
              ],
            },
          },
          {
            label: "데이터 소유 객체에 메서드로 흡수",
            summary:
              `${card.responsibilities.doing[0]} 행위가 다루는 데이터의 소유자(예: 일급 컬렉션)에 ` +
              `메서드로 옮긴다. Tell-Don't-Ask 강화.`,
            tradeoffs: {
              pros: [
                "행위와 데이터가 한 곳에 (응집도 향상)",
                "기존 호출자는 더 자연스러운 메시지 사용",
              ],
              cons: [
                "데이터 소유 객체가 비대해질 수 있음",
              ],
            },
          },
          {
            label: "멤버를 추가해 진짜 객체로 격상",
            summary:
              `이 클래스가 *영구한 상태/정책*을 가져야 한다면 knowing을 추가한다. ` +
              `예: ${card.name}이 정책 객체라면 정책 파라미터(임계값 등)를 멤버로.`,
            tradeoffs: {
              pros: [
                "클래스로 둘 정당성이 생김",
                "정책 변경 시 인스턴스만 교체",
              ],
              cons: [
                "knowing이 사실은 *외부 의존*에 불과하다면 부자연스러운 멤버화",
              ],
            },
          },
        ],
      }),
    );
  }
  return out;
}
