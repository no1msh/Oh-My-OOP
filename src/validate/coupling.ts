import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

export function checkCoupling(
  design: Design,
  threshold: number,
): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    if (card.collaborators.length <= threshold) continue;
    out.push(
      assertHasMultipleRemedies({
        rule_id: "too-many-collaborators",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}이(가) ${card.collaborators.length}명의 협력자에 의존합니다. ` +
          `결합도가 높아 변경 시 영향 범위가 큽니다.`,
        evidence: {
          collaborators: card.collaborators.map((c) => c.name),
          threshold,
        },
        remedies: [
          {
            label: "Facade/Mediator로 협력자 묶기",
            summary:
              "관련된 협력자 일부를 하나의 인터페이스 뒤로 숨겨 외부에서 보이는 협력자 수를 줄인다.",
            tradeoffs: {
              pros: ["호출자 입장의 인터페이스가 단순해진다", "결합 표면이 줄어든다"],
              cons: ["간접 계층이 늘어 추적이 어려워질 수 있음"],
            },
          },
          {
            label: "Tell-Don't-Ask: 협력자에게 책임 이전",
            summary:
              "현재 클래스가 협력자들의 상태를 끌어와 처리하고 있다면, 작업을 가지고 있는 협력자에게 옮긴다.",
            tradeoffs: {
              pros: ["조회 메시지가 줄어든다", "데이터 소유자에게 행위가 모인다"],
              cons: ["협력자의 책임이 커질 수 있어 god-object 위험"],
            },
          },
          {
            label: "응집된 협력자 병합",
            summary:
              "사실상 같은 개념을 두 클래스가 나눠 표현 중이라면 합쳐서 협력자 수를 줄인다.",
            tradeoffs: {
              pros: ["인위적인 경계가 사라짐"],
              cons: ["분리가 의도된 경우 응집도가 훼손될 수 있음"],
            },
          },
        ],
      }),
    );
  }
  return out;
}
