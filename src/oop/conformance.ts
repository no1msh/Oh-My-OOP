import type { CrcCard } from "../domain/model.js";
import { STEREOTYPE_DESCRIPTIONS, STEREOTYPE_HINTS } from "../domain/stereotypes.js";

// 적합성 검토는 코드의 의미를 판단해야 하므로 호출 모델이 저장된 명세와 실제 코드를 대조한다.
export const CONFORMANCE_CHECKLIST: string[] = [
  "코드의 각 public 메서드/행위가 design의 책임(knowing/doing) 중 하나로 *추적*되는가? 추적되지 않으면 → 미설계 행위(undesigned-behavior).",
  "각 클래스가 자기 stereotype의 misfit을 코드에서 수행하는가? (예: InformationHolder가 표현 문자열 생성·I/O·흐름 조율) → stereotype-violation.",
  "design에 적힌 각 책임이 코드에 실제로 구현되어 있는가? 빠졌으면 → missing-responsibility.",
  "코드가 실제로 호출/생성하는 의존이 design의 collaborators와 일치하는가? design에 없는 의존 → undeclared-collaboration.",
  "특히 도메인 객체(InformationHolder/Structurer)가 자기 필드를 표시 문자열로 포맷(toString/getStatus류)하는가? → 표현 책임은 Interfacer로 옮긴다.",
];

export const CONFORMANCE_INSTRUCTION: string =
  "당신은 *설계 적합성(conformance)* 검토자다. 아래 design_contract가 **의도된 명세**다. " +
  "지금 대화 컨텍스트에 있는 **실제 코드**를 이 명세와 대조하라. " +
  "적대적으로 — 위반이 *있다고 가정*하고 찾는다. " +
  "발견한 각 이탈을 finding으로 보고하라: " +
  "{ category: 'undesigned-behavior' | 'stereotype-violation' | 'missing-responsibility' | 'undeclared-collaboration', " +
  "target(클래스/메서드), message(무엇이 왜 명세와 어긋나는지 — 이 도메인 어휘로), remedies(≥2개 대안, 각각 pros/cons) }. " +
  "remedies는 항상 2개 이상 — 단일 답을 주지 말 것(코드 통제권은 개발자에게). " +
  "이탈이 없으면 '명세 부합'으로 보고하고, 판단이 불확실하면 그 불확실성을 명시하라.";

export function buildDesignContract(classes: CrcCard[]) {
  return classes.map((card) => ({
    id: card.id,
    name: card.name,
    stereotype: card.stereotype,
    stereotype_means: STEREOTYPE_DESCRIPTIONS[card.stereotype],
    fits: STEREOTYPE_HINTS[card.stereotype].fits,
    misfits: STEREOTYPE_HINTS[card.stereotype].misfits,
    designed_responsibilities: card.responsibilities,
    designed_collaborators: card.collaborators,
  }));
}
