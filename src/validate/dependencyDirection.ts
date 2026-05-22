import type { Design, CrcCard } from "../domain/model.js";
import type { Stereotype } from "../domain/stereotypes.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 의존 방향 검사 — Domain은 UI/Interfacer를 알아서는 안 된다.
// 학생 PR에서 자주 등장: Validator가 OutputView 의존, InformationHolder가 InputView 호출.
// 허용: Coordinator만 Interfacer에 의존 가능. 그 외 stereotype은 Interfacer 비의존.

const STEREOTYPES_THAT_MAY_TOUCH_INTERFACER: Stereotype[] = ["Coordinator", "Interfacer"];

// 협력자 이름에서 Interfacer 성격을 추론하는 휴리스틱
// (Interfacer로 stereotype이 명시된 경우 외에도, 이름으로 강하게 시사되는 경우)
const INTERFACER_NAME_RE = /(View|Adapter|Gateway|Printer|Console|Cli|Ui|Window|Screen)$/;

function isInterfacerByName(name: string): boolean {
  return INTERFACER_NAME_RE.test(name);
}

function classifyCollaborator(
  collaboratorName: string,
  design: Design,
): { stereotype: Stereotype | null; nameInferred: boolean } {
  const card = design.classes.find((c) => c.name === collaboratorName);
  if (card) return { stereotype: card.stereotype, nameInferred: false };
  if (isInterfacerByName(collaboratorName)) {
    return { stereotype: "Interfacer", nameInferred: true };
  }
  return { stereotype: null, nameInferred: false };
}

export function checkDependencyDirection(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    // Coordinator/Interfacer는 Interfacer 의존 가능
    if (STEREOTYPES_THAT_MAY_TOUCH_INTERFACER.includes(card.stereotype)) continue;

    const offending = card.collaborators
      .map((c) => ({
        name: c.name,
        message: c.message,
        ...classifyCollaborator(c.name, design),
      }))
      .filter((c) => c.stereotype === "Interfacer");

    if (offending.length === 0) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "dependency-direction",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}(${card.stereotype})이(가) Interfacer 성격의 협력자(${offending
            .map((o) => o.name)
            .join(", ")})에 의존합니다. ` +
          `Domain → UI 의존 방향은 역전된 의존입니다. ` +
          `Coordinator만 Interfacer를 알아도 되며, 도메인은 Interfacer를 몰라야 합니다.`,
        evidence: {
          offenders: offending.map((o) => ({
            name: o.name,
            inferred_by_name: o.nameInferred,
          })),
          allowed_stereotypes: STEREOTYPES_THAT_MAY_TOUCH_INTERFACER,
          guideline:
            "@BeokBeok: \"Validator는 Controller가 아닙니다. View와 관련된 의존성을 가지면 안 됩니다.\"",
        },
        remedies: [
          {
            label: "결과를 반환하고 흐름 제어는 Coordinator로",
            summary:
              `현재 클래스는 검증/계산 결과만 반환하고, ` +
              `Interfacer 호출(에러 메시지 출력, 재입력 요청)은 Coordinator가 결과를 보고 결정한다.`,
            tradeoffs: {
              pros: [
                "Domain 객체가 IO에서 자유로워 단위 테스트 단순",
                "Interfacer 변경(콘솔 → GUI)이 도메인에 영향 없음",
              ],
              cons: [
                "Coordinator가 더 많은 분기를 가지게 됨",
              ],
            },
          },
          {
            label: "인터페이스 도입 후 의존 역전 (DIP)",
            summary:
              `Domain이 정의한 인터페이스(예: ResultPort, NotificationPort)를 ` +
              `Interfacer가 구현하도록 의존 방향을 뒤집는다. Domain은 인터페이스만 알면 된다.`,
            tradeoffs: {
              pros: [
                "Clean Architecture 의 안쪽 의존 원칙 충족",
                "Domain 테스트 시 fake port 주입 용이",
              ],
              cons: [
                "객체 수 증가 + 인터페이스 추가",
                "소규모 도메인에서는 과한 설계일 수 있음",
              ],
            },
          },
          {
            label: "이벤트/콜백 기반 통지로 분리",
            summary:
              `Domain이 \"이런 일이 일어났다\"는 이벤트만 발행하고, ` +
              `Interfacer가 구독해 출력/입력 요청한다. Domain ↔ Interfacer 직접 결합 제거.`,
            tradeoffs: {
              pros: [
                "다수의 Interfacer가 같은 이벤트에 반응 가능 (CLI + 파일 로그 등)",
                "Domain 테스트는 이벤트 발행만 확인",
              ],
              cons: [
                "이벤트 버스/리스너 도입 비용",
                "동기 흐름이 약해져 디버깅 어려울 수 있음",
              ],
            },
          },
        ],
      }),
    );
  }
  return out;
}
