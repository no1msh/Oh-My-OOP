import type { Design } from "../domain/model.js";
import {
  type Finding,
  type Severity,
  severityAtLeast,
  assertHasMultipleRemedies,
} from "./findings.js";
import { checkGodObject } from "./godObject.js";
import { checkCohesion } from "./cohesion.js";
import { checkCoupling } from "./coupling.js";
import {
  checkNonNewable,
  checkSideEffectInHolder,
  checkMockingPressure,
} from "./testability.js";
import { checkCycles } from "./cycle.js";
import { checkVagueClassName } from "./vagueName.js";
import { checkValidationLocation } from "./validationLocation.js";
import { checkDependencyDirection } from "./dependencyDirection.js";
import { checkDataSourceDuplication } from "./dataDuplication.js";
import { checkFunctionNotObject } from "./functionNotObject.js";
import { checkEmptyObjectFill } from "./emptyObjectFill.js";
import { checkCollectionWrapperWithoutBehavior } from "./collectionWrapper.js";
import { checkPrimitiveWrapperWithoutInvariant } from "./primitiveWrapper.js";

export interface RuleThresholds {
  god_object_responsibilities: number;
  god_object_collaborators: number;
  cohesion_min_overlap: number;
  too_many_collaborators: number;
  mocking_pressure_max: number;
  data_duplication_overlap: number;
}

export const DEFAULT_THRESHOLDS: RuleThresholds = {
  god_object_responsibilities: 7,
  god_object_collaborators: 6,
  cohesion_min_overlap: 0.2,
  too_many_collaborators: 4,
  mocking_pressure_max: 2,
  data_duplication_overlap: 0.5,
};

export const ALL_RULE_IDS = [
  "god-object",
  "low-cohesion",
  "too-many-collaborators",
  "non-newable",
  "side-effect-in-holder",
  "mocking-pressure",
  "cycle",
  "mixed-stereotype",
  "feature-envy",
  "orphan-class",
  "vague-class-name",
  "validation-misplacement",
  "dependency-direction",
  "data-source-duplication",
  "function-not-object",
  "empty-object-external-fill",
  "collection-wrapper-without-behavior",
  "primitive-wrapper-without-invariant",
] as const;

export type RuleId = (typeof ALL_RULE_IDS)[number];

const COORDINATING_VERBS = /(조율|진행|호출|위임|보고|순서)/;

function checkMixedStereotype(design: Design): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    if (card.stereotype === "Coordinator") continue;
    const hasKnowing = card.responsibilities.knowing.length > 0;
    const hasDoing = card.responsibilities.doing.length > 0;
    const hasCoord = card.responsibilities.doing.some((d) => COORDINATING_VERBS.test(d));
    if (!(hasKnowing && hasDoing && hasCoord)) continue;
    out.push(
      assertHasMultipleRemedies({
        rule_id: "mixed-stereotype",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은 ${card.stereotype}로 분류되어 있지만 knowing/doing/coordinating 책임을 모두 가집니다.`,
        evidence: { stereotype: card.stereotype },
        remedies: [
          {
            label: "Coordinator로 재분류",
            summary: "조율이 본질이라면 Stereotype을 Coordinator로 바꾸고 도메인 계산은 위임한다.",
            tradeoffs: { pros: ["역할이 명확"], cons: ["기존 호출자 기대가 깨질 수 있음"] },
          },
          {
            label: "별도 Coordinator 추출",
            summary: "현재 클래스는 본래 역할(예: ServiceProvider)을 유지하고, 새 Coordinator가 호출 순서를 책임진다.",
            tradeoffs: { pros: ["단일 책임 보존"], cons: ["객체 수 증가"] },
          },
          {
            label: "조율 책임을 협력자에게 이전 (Tell-Don't-Ask)",
            summary: "현재 클래스가 데이터 소유자에게 작업을 위임하도록 메시지 방향을 뒤집는다.",
            tradeoffs: { pros: ["조회 메시지 감소", "데이터 곁에 행위"], cons: ["협력자가 무거워질 수 있음"] },
          },
        ],
      }),
    );
  }
  return out;
}

function checkFeatureEnvy(design: Design): Finding[] {
  const cards = design.classes;
  const out: Finding[] = [];
  const knowingOf = new Map<string, string[]>();
  for (const c of cards) knowingOf.set(c.name, c.responsibilities.knowing);

  for (const card of cards) {
    const ownTokens = new Set(card.responsibilities.knowing.join(" ").toLowerCase().split(/\s+/));
    for (const doing of card.responsibilities.doing) {
      const text = doing.toLowerCase();
      let bestOther: { name: string; score: number } | null = null;
      let ownScore = 0;
      for (const t of ownTokens) if (t.length > 2 && text.includes(t)) ownScore++;
      for (const c of cards) {
        if (c.id === card.id) continue;
        let s = 0;
        for (const k of c.responsibilities.knowing) {
          const norm = k.toLowerCase();
          for (const tok of norm.split(/\s+/))
            if (tok.length > 2 && text.includes(tok)) s++;
        }
        if (s > 0 && (!bestOther || s > bestOther.score)) bestOther = { name: c.name, score: s };
      }
      if (bestOther && bestOther.score > ownScore && bestOther.score >= 2) {
        out.push(
          assertHasMultipleRemedies({
            rule_id: "feature-envy",
            severity: "warn",
            target: { kind: "class", id: card.id },
            message:
              `${card.name}의 "${doing}" 책임이 자신보다 ${bestOther.name}의 knowing을 더 많이 참조합니다.`,
            evidence: { other: bestOther.name, otherScore: bestOther.score, ownScore },
            remedies: [
              {
                label: `책임을 ${bestOther.name}로 이전 (Tell-Don't-Ask)`,
                summary: "데이터 곁으로 행위를 옮긴다.",
                tradeoffs: {
                  pros: ["조회 메시지 감소", "응집도 향상"],
                  cons: [`${bestOther.name}이 비대해질 수 있음`],
                },
              },
              {
                label: "두 개념을 합쳐 새 클래스로 추출",
                summary: "양쪽 모두에 걸친 책임이라면 새 ServiceProvider를 만든다.",
                tradeoffs: { pros: ["역할 명확"], cons: ["객체 수 증가"] },
              },
              {
                label: "조회 메시지를 명시하고 현재 위치 유지",
                summary: "결합을 받아들이고 명시적인 query 협력으로 둔다.",
                tradeoffs: { pros: ["변경 최소"], cons: ["Tell-Don't-Ask 원칙 위배"] },
              },
            ],
          }),
        );
        break;
      }
    }
  }
  return out;
}

function checkOrphan(design: Design): Finding[] {
  const out: Finding[] = [];
  const referencedByUseCase = new Set<string>();
  for (const uc of design.use_cases) for (const id of uc.related_classes) referencedByUseCase.add(id);
  const referencedByCollab = new Set<string>();
  for (const c of design.collaborations) {
    referencedByCollab.add(c.from);
    referencedByCollab.add(c.to);
  }
  for (const card of design.classes) {
    const hasCollab = card.collaborators.length > 0 || referencedByCollab.has(card.id);
    const hasUseCase = referencedByUseCase.has(card.id);
    if (hasCollab || hasUseCase) continue;
    out.push(
      assertHasMultipleRemedies({
        rule_id: "orphan-class",
        severity: "info",
        target: { kind: "class", id: card.id },
        message: `${card.name}은 어떤 협력자도 유스케이스도 참조하지 않습니다.`,
        evidence: {},
        remedies: [
          {
            label: "삭제",
            summary: "정말 사용처가 없다면 제거한다.",
            tradeoffs: { pros: ["YAGNI 준수"], cons: ["미래 사용처를 잘못 추측한 경우 재추가 비용"] },
          },
          {
            label: "유스케이스에 연결",
            summary: "어떤 유스케이스가 이 클래스를 필요로 하는지 명시한다.",
            tradeoffs: { pros: ["설계 의도 회복"], cons: ["맞는 유스케이스가 없으면 강제 연결"] },
          },
          {
            label: "미사용 표시(notes)와 함께 유지",
            summary: "미래 확장을 위해 의도적으로 둔다면 notes에 사유를 적는다.",
            tradeoffs: { pros: ["맥락 보존"], cons: ["추측 기반 설계"] },
          },
        ],
      }),
    );
  }
  return out;
}

export interface ValidateOptions {
  rules?: RuleId[];
  severityMin?: Severity;
  thresholds?: Partial<RuleThresholds>;
}

export function validateDesign(design: Design, opts: ValidateOptions = {}): Finding[] {
  const enabled = new Set<RuleId>(opts.rules ?? ALL_RULE_IDS);
  const thresholds: RuleThresholds = { ...DEFAULT_THRESHOLDS, ...(opts.thresholds ?? {}) };

  const findings: Finding[] = [];
  if (enabled.has("god-object"))
    findings.push(
      ...checkGodObject(design, {
        responsibilities: thresholds.god_object_responsibilities,
        collaborators: thresholds.god_object_collaborators,
      }),
    );
  if (enabled.has("low-cohesion"))
    findings.push(...checkCohesion(design, thresholds.cohesion_min_overlap));
  if (enabled.has("too-many-collaborators"))
    findings.push(...checkCoupling(design, thresholds.too_many_collaborators));
  if (enabled.has("non-newable")) findings.push(...checkNonNewable(design));
  if (enabled.has("side-effect-in-holder")) findings.push(...checkSideEffectInHolder(design));
  if (enabled.has("mocking-pressure"))
    findings.push(...checkMockingPressure(design, thresholds.mocking_pressure_max));
  if (enabled.has("cycle")) findings.push(...checkCycles(design));
  if (enabled.has("mixed-stereotype")) findings.push(...checkMixedStereotype(design));
  if (enabled.has("feature-envy")) findings.push(...checkFeatureEnvy(design));
  if (enabled.has("orphan-class")) findings.push(...checkOrphan(design));
  if (enabled.has("vague-class-name")) findings.push(...checkVagueClassName(design));
  if (enabled.has("validation-misplacement"))
    findings.push(...checkValidationLocation(design));
  if (enabled.has("dependency-direction"))
    findings.push(...checkDependencyDirection(design));
  if (enabled.has("data-source-duplication"))
    findings.push(
      ...checkDataSourceDuplication(design, thresholds.data_duplication_overlap),
    );
  if (enabled.has("function-not-object"))
    findings.push(...checkFunctionNotObject(design));
  if (enabled.has("empty-object-external-fill"))
    findings.push(...checkEmptyObjectFill(design));
  if (enabled.has("collection-wrapper-without-behavior"))
    findings.push(...checkCollectionWrapperWithoutBehavior(design));
  if (enabled.has("primitive-wrapper-without-invariant"))
    findings.push(...checkPrimitiveWrapperWithoutInvariant(design));

  const sevMin = opts.severityMin ?? "info";
  return findings.filter((f) => severityAtLeast(f.severity, sevMin));
}

export function summarize(findings: Finding[]): { error: number; warn: number; info: number } {
  const out = { error: 0, warn: 0, info: 0 };
  for (const f of findings) out[f.severity]++;
  return out;
}
