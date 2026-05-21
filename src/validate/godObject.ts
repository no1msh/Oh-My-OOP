import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

export function checkGodObject(
  design: Design,
  thresholds: { responsibilities: number; collaborators: number },
): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    const total =
      card.responsibilities.knowing.length + card.responsibilities.doing.length;
    const tooManyResp = total > thresholds.responsibilities;
    const tooManyCollab = card.collaborators.length > thresholds.collaborators;
    if (!tooManyResp && !tooManyCollab) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "god-object",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}이(가) ${total}개의 책임, ${card.collaborators.length}명의 협력자를 가져 ` +
          `(${tooManyResp ? "책임 과다" : ""}${tooManyResp && tooManyCollab ? " · " : ""}${tooManyCollab ? "협력자 과다" : ""}) ` +
          `God Object 가능성이 있습니다.`,
        evidence: {
          responsibilities: total,
          collaborators: card.collaborators.length,
          thresholds,
        },
        remedies: [
          {
            label: "doing 클러스터를 새 협력자로 추출",
            summary:
              "가장 응집도 높은 doing 책임 묶음을 별개 ServiceProvider로 분리하고, " +
              "현재 클래스는 그 협력자에게 위임한다.",
            tradeoffs: {
              pros: [
                "각 클래스 책임이 명확해진다",
                "테스트 단위가 작아진다",
                "변경 영향 범위가 축소된다",
              ],
              cons: [
                "협력자 수가 1 증가하여 결합도 측면은 트레이드오프",
                "추출 기준이 모호하면 인위적인 분리가 될 수 있음",
              ],
            },
          },
          {
            label: "knowing 클러스터를 값 객체(InformationHolder)로 추출",
            summary:
              "강하게 묶인 knowing 책임을 새 InformationHolder로 옮기고, " +
              "이 클래스는 그 값을 보유하도록 한다.",
            tradeoffs: {
              pros: [
                "도메인 개념이 1급으로 드러난다",
                "원시 타입 강박을 줄인다",
              ],
              cons: [
                "단순 위임이 늘어 표면적인 코드량이 증가",
                "값 객체가 진짜 도메인 개념이 아니면 과한 추상화",
              ],
            },
          },
          {
            label: "Coordinator/Service 분리 (역할별 분할)",
            summary:
              "흐름 조율(Coordinator)과 도메인 계산(ServiceProvider)을 다른 클래스로 분리한다.",
            tradeoffs: {
              pros: [
                "Stereotype 혼합을 제거해 책임이 깔끔해짐",
                "Tell-Don't-Ask 적용이 쉬워짐",
              ],
              cons: [
                "객체 수가 늘어 초기 학습 비용 증가",
                "유스케이스가 단순하면 과설계가 될 수 있음",
              ],
            },
          },
        ],
      }),
    );
  }
  return out;
}
