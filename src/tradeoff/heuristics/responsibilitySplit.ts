import type { UseCase } from "../../domain/model.js";
import type { Stereotype } from "../../domain/stereotypes.js";

export interface ResponsibilityAssignment {
  responsibility: string;
  kind: "knowing" | "doing";
  candidate_class: string;
  candidate_stereotype: Stereotype;
}

export interface ResponsibilityAlternative {
  id: string;
  name: string;
  rationale: string;
  tradeoffs: { pros: string[]; cons: string[] };
  assignments: ResponsibilityAssignment[];
}

const NOUN_HINT = /([가-힣A-Za-z]+(?:들|s)?)/g;
const VERB_RE = /([가-힣A-Za-z]+(?:다|s|e|기|함|이|하기)?)/g;

function topNounCandidates(text: string, limit = 3): string[] {
  const counts = new Map<string, number>();
  const matches = text.match(NOUN_HINT) ?? [];
  for (const raw of matches) {
    const t = raw.trim();
    if (t.length < 2) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([n]) => capitalize(n));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function actionsFromFlow(uc: UseCase): string[] {
  return uc.main_flow.slice();
}

export function seedsByNoun(uc: UseCase): ResponsibilityAlternative {
  const nouns = topNounCandidates(`${uc.title} ${uc.main_flow.join(" ")}`);
  const top = nouns[0] ?? "Subject";
  const second = nouns[1] ?? "Detail";
  const assignments: ResponsibilityAssignment[] = [
    {
      responsibility: `${top} 정보를 안다`,
      kind: "knowing",
      candidate_class: top,
      candidate_stereotype: "InformationHolder",
    },
    {
      responsibility: `${second} 정보를 안다`,
      kind: "knowing",
      candidate_class: second,
      candidate_stereotype: "InformationHolder",
    },
  ];
  for (const step of actionsFromFlow(uc)) {
    assignments.push({
      responsibility: step,
      kind: "doing",
      candidate_class: top,
      candidate_stereotype: "ServiceProvider",
    });
  }
  return {
    id: "alt-by-noun",
    name: "도메인 명사 중심 분해",
    rationale:
      `유스케이스에서 가장 자주 등장한 명사(${top}, ${second})를 1급 객체로 보고 그 주변에 책임을 모았습니다.`,
    tradeoffs: {
      pros: [
        "도메인 모델이 코드에 1:1로 드러난다",
        "값 객체가 자연스럽게 등장한다",
        "이름이 짧고 도메인 언어를 따른다",
      ],
      cons: [
        "행위(doing) 책임의 자리가 명확하지 않을 수 있다",
        "협력 흐름을 보려면 추가 사고가 필요하다",
      ],
    },
    assignments,
  };
}

export function seedsByVerb(uc: UseCase): ResponsibilityAlternative {
  const actions = actionsFromFlow(uc);
  const services = actions.map((a, i) => `${verbToName(a)}Service`).filter((s, i, arr) => arr.indexOf(s) === i);
  const assignments: ResponsibilityAssignment[] = [];
  actions.forEach((step, i) => {
    const name = services[i] ?? services[0] ?? "ActionService";
    assignments.push({
      responsibility: step,
      kind: "doing",
      candidate_class: name,
      candidate_stereotype: "ServiceProvider",
    });
  });
  return {
    id: "alt-by-verb",
    name: "행위(유스케이스 단계) 중심 분해",
    rationale: "유스케이스의 각 단계(동사)를 ServiceProvider 단위로 잘랐습니다. 절차가 명확합니다.",
    tradeoffs: {
      pros: [
        "유스케이스 흐름이 코드 구조로 그대로 드러남",
        "각 단계가 단위테스트하기 좋음",
      ],
      cons: [
        "도메인 명사가 1급으로 표현되지 않음",
        "절차적 코드에 가까워질 수 있음 (객체지향의 장점이 약해짐)",
      ],
    },
    assignments,
  };
}

export function seedsSingleClass(uc: UseCase): ResponsibilityAlternative {
  const top = topNounCandidates(uc.title)[0] ?? "Game";
  const assignments: ResponsibilityAssignment[] = [];
  for (const step of uc.main_flow) {
    assignments.push({
      responsibility: step,
      kind: "doing",
      candidate_class: top,
      candidate_stereotype: "Coordinator",
    });
  }
  return {
    id: "alt-single-class",
    name: "단일 Coordinator로 시작",
    rationale: "처음엔 한 클래스로 시작하고 통증이 보이는 책임만 추출하는 점진적 접근입니다.",
    tradeoffs: {
      pros: [
        "초기 설계 비용이 가장 낮음",
        "실제 마찰이 보인 뒤 분리하므로 과설계 위험이 적음",
      ],
      cons: [
        "방치 시 god-object로 자라기 쉬움",
        "테스트 단위가 커진다",
      ],
    },
    assignments,
  };
}

export function seedsByStereotype(uc: UseCase): ResponsibilityAlternative {
  const top = topNounCandidates(uc.title)[0] ?? "Game";
  const assignments: ResponsibilityAssignment[] = [
    {
      responsibility: "유스케이스 진입과 호출 순서를 조율한다",
      kind: "doing",
      candidate_class: `${top}Coordinator`,
      candidate_stereotype: "Coordinator",
    },
    {
      responsibility: `${top} 도메인 정보를 안다`,
      kind: "knowing",
      candidate_class: top,
      candidate_stereotype: "InformationHolder",
    },
    {
      responsibility: "도메인 규칙을 계산한다",
      kind: "doing",
      candidate_class: `${top}Rule`,
      candidate_stereotype: "ServiceProvider",
    },
  ];
  for (const step of uc.main_flow) {
    assignments.push({
      responsibility: step,
      kind: "doing",
      candidate_class: `${top}Coordinator`,
      candidate_stereotype: "Coordinator",
    });
  }
  return {
    id: "alt-by-stereotype",
    name: "Stereotype 5종으로 사전 분류",
    rationale:
      "Coordinator / Information Holder / Service Provider / (필요 시 Interfacer)로 책임의 종류부터 분리합니다.",
    tradeoffs: {
      pros: [
        "역할이 명시적이라 god-object 위험이 낮음",
        "각 클래스가 한 가지 이유로만 변경된다",
      ],
      cons: [
        "초기 객체 수가 많아 학습 곡선 상승",
        "유스케이스가 단순할 때 과설계 위험",
      ],
    },
    assignments,
  };
}

function verbToName(step: string): string {
  const cleaned = step.replace(/[^A-Za-z가-힣]+/g, " ").trim().split(/\s+/)[0] ?? "Action";
  return capitalize(cleaned);
}

export function buildResponsibilitySeeds(
  uc: UseCase,
  bias?: "by-noun" | "by-verb" | "balanced",
): ResponsibilityAlternative[] {
  if (bias === "by-noun") return [seedsByNoun(uc), seedsByStereotype(uc), seedsSingleClass(uc)];
  if (bias === "by-verb") return [seedsByVerb(uc), seedsByStereotype(uc), seedsSingleClass(uc)];
  return [seedsByNoun(uc), seedsByVerb(uc), seedsByStereotype(uc), seedsSingleClass(uc)];
}
