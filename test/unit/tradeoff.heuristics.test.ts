import { describe, it, expect } from "vitest";
import { buildResponsibilitySeeds } from "../../src/tradeoff/heuristics/responsibilitySplit.js";
import { generateAlternatives } from "../../src/tradeoff/engine.js";
import type { Design, UseCase } from "../../src/domain/model.js";

const SAMPLE_UC: UseCase = {
  id: "race-cars",
  title: "N대의 자동차로 M번 경주한다",
  actor: "Player",
  preconditions: [],
  main_flow: ["자동차 이름을 입력받는다", "한 라운드를 진행한다", "우승자를 출력한다"],
  postconditions: [],
  related_classes: [],
};

const EMPTY_DESIGN: Design = {
  index: {
    oop_version: 1,
    project: "demo",
    target_language: "kotlin",
    updated_at: "x",
    use_cases: [],
    classes: [],
    collaborations: [],
    current_diagram: "x",
  },
  use_cases: [SAMPLE_UC],
  classes: [],
  collaborations: [],
};

describe("responsibility seeds", () => {
  it("returns at least 2 distinct alternatives", () => {
    const seeds = buildResponsibilitySeeds(SAMPLE_UC);
    expect(seeds.length).toBeGreaterThanOrEqual(2);
    const ids = new Set(seeds.map((s) => s.id));
    expect(ids.size).toBe(seeds.length);
  });

  it("each alternative carries non-empty pros and cons", () => {
    const seeds = buildResponsibilitySeeds(SAMPLE_UC);
    for (const s of seeds) {
      expect(s.tradeoffs.pros.length).toBeGreaterThan(0);
      expect(s.tradeoffs.cons.length).toBeGreaterThan(0);
      expect(s.assignments.length).toBeGreaterThan(0);
    }
  });
});

describe("generateAlternatives engine", () => {
  it("class_split returns >=2 alternatives with design_delta and cho_younghos_lens", () => {
    const res = generateAlternatives(
      "class_split",
      { description: "Big God class needs splitting" },
      EMPTY_DESIGN,
      3,
    );
    expect(res.alternatives.length).toBeGreaterThanOrEqual(2);
    for (const a of res.alternatives) {
      expect(a.tradeoffs.pros.length).toBeGreaterThan(0);
      expect(a.cho_younghos_lens.notes).toBeTruthy();
    }
    expect(res.expansion_prompt).toContain("트레이드오프");
  });

  it("collaboration_shape includes Tell-Don't-Ask as one option", () => {
    const res = generateAlternatives(
      "collaboration_shape",
      { description: "How should A talk to B?", involved: ["A", "B"] },
      EMPTY_DESIGN,
      4,
    );
    const labels = res.alternatives.map((a) => a.label);
    expect(labels).toContain("Tell-Don't-Ask");
  });

  it("stereotype_choice returns 5 stereotype candidates", () => {
    const res = generateAlternatives(
      "stereotype_choice",
      { description: "What is Foo?" },
      EMPTY_DESIGN,
      5,
    );
    expect(res.alternatives.length).toBe(5);
  });
});
