export const STEREOTYPES = [
  "InformationHolder",
  "ServiceProvider",
  "Structurer",
  "Coordinator",
  "Interfacer",
] as const;

export type Stereotype = (typeof STEREOTYPES)[number];

export const STEREOTYPE_DESCRIPTIONS: Record<Stereotype, string> = {
  InformationHolder:
    "도메인 정보를 알고 제공한다. 상태를 유지하지만 행동은 최소화한다. (Wirfs-Brock)",
  ServiceProvider:
    "구체적인 계산이나 작업을 수행한다. 외부에 결과를 제공한다. (Wirfs-Brock)",
  Structurer:
    "다른 객체들 사이의 관계를 유지하고 관리한다. 컬렉션/구성 객체에 해당. (Wirfs-Brock)",
  Coordinator:
    "다른 객체들에게 작업을 위임하고 흐름을 조율한다. (Wirfs-Brock)",
  Interfacer:
    "시스템 경계에서 외부 세계와 통신한다. 어댑터/UI/I-O. (Wirfs-Brock)",
};

export const STEREOTYPE_HINTS: Record<Stereotype, { fits: string[]; misfits: string[] }> = {
  InformationHolder: {
    fits: ["불변/거의 불변 상태", "값 객체", "도메인 사실 표현"],
    misfits: ["외부 I/O를 직접 수행", "여러 객체 흐름 조율"],
  },
  ServiceProvider: {
    fits: ["순수 계산", "정책/전략 구현", "도메인 규칙"],
    misfits: ["대규모 상태 보유", "여러 서비스 조율"],
  },
  Structurer: {
    fits: ["컬렉션 일급 표현", "구성 관계 유지", "그룹 행위"],
    misfits: ["혼자서 도메인 결정 수행"],
  },
  Coordinator: {
    fits: ["유스케이스 진입점", "여러 객체 호출 순서 결정"],
    misfits: ["도메인 규칙을 직접 계산", "상태를 길게 보유"],
  },
  Interfacer: {
    fits: ["UI 핸들러", "외부 시스템 어댑터", "I/O 게이트웨이"],
    misfits: ["핵심 도메인 로직 보유"],
  },
};
