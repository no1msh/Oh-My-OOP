import type { CrcCard, Design } from "../domain/model.js";
import type { Stereotype } from "../domain/stereotypes.js";
import type { TradeoffQuestion } from "../domain/schemas.js";
import { classSplitSeeds } from "./heuristics/classSplit.js";
import { collaborationShapeSeeds } from "./heuristics/collaborationShape.js";
import { stereotypeChoiceSeeds } from "./heuristics/stereotypeChoice.js";
import { expansionPromptAlternatives } from "./templates.js";

export interface DesignDelta {
  added_classes?: Array<{ name: string; stereotype: Stereotype }>;
  removed_classes?: string[];
  moved_responsibilities?: Array<{ text: string; from: string; to: string }>;
  added_collaborations?: Array<{ from: string; to: string; message: string }>;
  removed_collaborations?: Array<{ from: string; to: string }>;
}

export interface ChoYounghosLens {
  cohesion: "improves" | "neutral" | "hurts";
  coupling: "improves" | "neutral" | "hurts";
  testability: "improves" | "neutral" | "hurts";
  notes: string;
}

export interface AlternativeSeed {
  id: string;
  label: string;
  summary: string;
  design_delta: DesignDelta;
  tradeoffs: { pros: string[]; cons: string[] };
  cho_younghos_lens: ChoYounghosLens;
}

export interface AlternativesResult {
  alternatives: AlternativeSeed[];
  expansion_prompt: string;
}

export interface AlternativesContext {
  description: string;
  class_id?: string;
  use_case_id?: string;
  involved?: string[];
}

export function generateAlternatives(
  question: TradeoffQuestion,
  context: AlternativesContext,
  design: Design,
  n: number,
): AlternativesResult {
  let seeds: AlternativeSeed[];
  switch (question) {
    case "class_split":
      seeds = classSplitSeeds(findClass(design, context.class_id));
      break;
    case "collaboration_shape":
      seeds = collaborationShapeSeeds(context.involved ?? []);
      break;
    case "stereotype_choice":
      seeds = stereotypeChoiceSeeds(
        findClass(design, context.class_id)?.name ?? "Target",
      );
      break;
    case "responsibility_split":
      seeds = classSplitSeeds(findClass(design, context.class_id));
      break;
    case "free_form":
      seeds = freeFormSeeds(context);
      break;
  }
  const capped = seeds.slice(0, Math.max(2, Math.min(n, seeds.length)));
  return {
    alternatives: capped,
    expansion_prompt: expansionPromptAlternatives(question, context.description),
  };
}

function findClass(design: Design, id?: string): CrcCard | undefined {
  if (!id) return undefined;
  return design.classes.find((c) => c.id === id);
}

function freeFormSeeds(context: AlternativesContext): AlternativeSeed[] {
  return [
    {
      id: "free-keep",
      label: "현 상태 유지",
      summary: `"${context.description}"에 대해 변경하지 않고 통증을 더 관찰한다.`,
      design_delta: {},
      tradeoffs: {
        pros: ["변경 비용 0", "잘못된 추측 위험 회피"],
        cons: ["통증이 누적되면 변경 비용 상승"],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "neutral",
        testability: "neutral",
        notes: "조영호님: '경험이 없으면 일단 해보고 고치자' — 단, 통증을 지켜볼 것.",
      },
    },
    {
      id: "free-extract",
      label: "새 클래스로 추출",
      summary: "관련된 책임을 새 클래스로 분리한다.",
      design_delta: { added_classes: [{ name: "ExtractedTarget", stereotype: "ServiceProvider" }] },
      tradeoffs: { pros: ["응집도 향상", "테스트 단위 축소"], cons: ["객체 수 증가"] },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "neutral",
        testability: "improves",
        notes: "통증의 출처가 한 클래스의 비대함이라면 효과적.",
      },
    },
    {
      id: "free-invert",
      label: "메시지 방향 반전 (Tell-Don't-Ask)",
      summary: "데이터 소유자에게 행위를 옮긴다.",
      design_delta: {},
      tradeoffs: { pros: ["조회 감소", "캡슐화 강화"], cons: ["수신자 비대"] },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "구조 변경 없이도 큰 효과를 낼 수 있는 카드.",
      },
    },
  ];
}
