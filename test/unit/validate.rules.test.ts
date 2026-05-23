import { describe, it, expect } from "vitest";
import { validateDesign, ALL_RULE_IDS } from "../../src/validate/rules.js";
import type { Design } from "../../src/domain/model.js";

function design(partial: Partial<Design> = {}): Design {
  return {
    index: {
      oop_version: 1,
      project: "demo",
      target_language: "kotlin",
      updated_at: "x",
      use_cases: [],
      classes: [],
      collaborations: [],
      current_diagram: "diagrams/current.mmd",
    },
    use_cases: [],
    classes: [],
    collaborations: [],
    ...partial,
  };
}

describe("validation contract: every finding has >= 2 remedies", () => {
  it("god-object finding has >= 2 remedies", () => {
    const d = design({
      classes: [
        {
          id: "big",
          name: "Big",
          stereotype: "Coordinator",
          responsibilities: {
            knowing: ["a", "b", "c", "d"],
            doing: ["e", "f", "g", "h"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["god-object"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("too-many-collaborators >= 2 remedies", () => {
    const d = design({
      classes: [
        {
          id: "c1",
          name: "C1",
          stereotype: "Coordinator",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [
            { name: "A", message: "x()" },
            { name: "B", message: "x()" },
            { name: "C", message: "x()" },
            { name: "D", message: "x()" },
            { name: "E", message: "x()" },
          ],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["too-many-collaborators"] });
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) expect(f.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("non-newable triggers on Repository collaborator without Strategy seam", () => {
    const d = design({
      classes: [
        {
          id: "svc",
          name: "Svc",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [{ name: "UserRepository", message: "find(id)" }],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["non-newable"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("non-newable suppressed when a Strategy collaborator exists", () => {
    const d = design({
      classes: [
        {
          id: "svc",
          name: "Svc",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [
            { name: "UserRepository", message: "find(id)" },
            { name: "ClockStrategy", message: "now()" },
          ],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["non-newable"] });
    expect(findings.length).toBe(0);
  });

  it("cycle detection finds a directed cycle", () => {
    const d = design({
      collaborations: [
        { id: "1", from: "A", to: "B", message: "x()", direction: "send" },
        { id: "2", from: "B", to: "C", message: "x()", direction: "send" },
        { id: "3", from: "C", to: "A", message: "x()", direction: "send" },
      ],
    });
    const findings = validateDesign(d, { rules: ["cycle"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("error");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("vague-class-name fires on standalone 'Manager' and 'Validator'", () => {
    const d = design({
      classes: [
        {
          id: "m",
          name: "Manager",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["do something"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "v",
          name: "Validator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["validate"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "iv",
          name: "InputValidator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["validate input"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["vague-class-name"] });
    // Manager + Validator triggers, InputValidator does not
    expect(findings.length).toBe(2);
    const names = findings.map((f) => (f.evidence as { name: string }).name).sort();
    expect(names).toEqual(["Manager", "Validator"]);
    for (const f of findings) expect(f.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("validation-misplacement fires when validation duplicated across stereotypes", () => {
    const d = design({
      classes: [
        {
          id: "iv",
          name: "InputView",
          stereotype: "Interfacer",
          responsibilities: {
            knowing: [],
            doing: ["자동차 이름 입력값 검증"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "car",
          name: "Car",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["자동차 이름"],
            doing: ["init에서 이름 길이 검증"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["validation-misplacement"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("dependency-direction fires when domain depends on Interfacer", () => {
    const d = design({
      classes: [
        {
          id: "val",
          name: "InputValidator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["validate"] },
          collaborators: [{ name: "OutputView", message: "printError(msg)" }],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["dependency-direction"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("dependency-direction allows Coordinator to use Interfacer", () => {
    const d = design({
      classes: [
        {
          id: "ctrl",
          name: "RacingController",
          stereotype: "Coordinator",
          responsibilities: { knowing: [], doing: ["run game"] },
          collaborators: [{ name: "OutputView", message: "printResult(r)" }],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["dependency-direction"] });
    expect(findings.length).toBe(0);
  });

  it("data-source-duplication fires when two linked cards share knowing", () => {
    const d = design({
      classes: [
        {
          id: "race",
          name: "Race",
          stereotype: "Coordinator",
          responsibilities: {
            knowing: ["자동차 이름들 names 리스트", "라운드 수"],
            doing: ["race 진행"],
          },
          collaborators: [{ name: "Cars", message: "moveAll()" }],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "cars",
          name: "Cars",
          stereotype: "Structurer",
          responsibilities: {
            knowing: ["자동차 이름들 names 리스트"],
            doing: ["moveAll"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["data-source-duplication"] });
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) expect(f.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("function-not-object fires on knowing-empty + single-doing class", () => {
    const d = design({
      classes: [
        {
          id: "win",
          name: "Winner",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["judge winner"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["function-not-object"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("info");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("function-not-object skips Interfacer (adapters may have no knowing)", () => {
    const d = design({
      classes: [
        {
          id: "v",
          name: "ConsoleView",
          stereotype: "Interfacer",
          responsibilities: { knowing: [], doing: ["print line"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["function-not-object"] });
    expect(findings.length).toBe(0);
  });

  it("side-effect-in-holder detects UI literal in knowing", () => {
    const d = design({
      classes: [
        {
          id: "dd",
          name: "DriverDecision",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["distance: \"-\""],
            doing: [],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["side-effect-in-holder"] });
    expect(findings.length).toBe(1);
    expect((findings[0]!.evidence as { ui_literals: string[] }).ui_literals.length).toBe(1);
  });

  it("empty-object-external-fill fires on Holder with empty knowing + mutation-only doing", () => {
    const d = design({
      classes: [
        {
          id: "wr",
          name: "WinningResult",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: [],
            doing: ["당첨 등수를 추가한다", "보너스 결과를 누적한다"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["empty-object-external-fill"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("warn");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
    const ev = findings[0]!.evidence as { mutation_verbs_matched: string[] };
    expect(ev.mutation_verbs_matched).toContain("추가");
    expect(ev.mutation_verbs_matched).toContain("누적");
  });

  it("empty-object-external-fill suppressed when Holder has knowing", () => {
    const d = design({
      classes: [
        {
          id: "wr",
          name: "WinningResult",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["등수별 당첨 개수"],
            doing: ["당첨 등수를 추가한다"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["empty-object-external-fill"] });
    expect(findings.length).toBe(0);
  });

  it("empty-object-external-fill suppressed when doing has non-mutation verb", () => {
    const d = design({
      classes: [
        {
          id: "wr",
          name: "WinningResult",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: [],
            doing: ["당첨 등수를 추가한다", "총 상금을 계산한다"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["empty-object-external-fill"] });
    expect(findings.length).toBe(0);
  });

  it("empty-object-external-fill skips non-Holder stereotypes", () => {
    const d = design({
      classes: [
        {
          id: "c",
          name: "Coord",
          stereotype: "Coordinator",
          responsibilities: { knowing: [], doing: ["작업을 추가한다"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["empty-object-external-fill"] });
    expect(findings.length).toBe(0);
  });

  it("collection-wrapper-without-behavior fires on Structurer with single collection knowing + only pass-through doing", () => {
    const d = design({
      classes: [
        {
          id: "lottos",
          name: "Lottos",
          stereotype: "Structurer",
          responsibilities: {
            knowing: ["List<Lotto>"],
            doing: ["toString 출력", "size 반환"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["collection-wrapper-without-behavior"],
    });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("info");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("collection-wrapper-without-behavior suppressed when Structurer has domain behavior", () => {
    const d = design({
      classes: [
        {
          id: "lottos",
          name: "Lottos",
          stereotype: "Structurer",
          responsibilities: {
            knowing: ["로또들 list"],
            doing: ["당첨 등수를 계산한다", "총 수익률을 계산한다"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["collection-wrapper-without-behavior"],
    });
    expect(findings.length).toBe(0);
  });

  it("collection-wrapper-without-behavior skips non-Structurer stereotypes", () => {
    const d = design({
      classes: [
        {
          id: "x",
          name: "X",
          stereotype: "InformationHolder",
          responsibilities: { knowing: ["items list"], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["collection-wrapper-without-behavior"],
    });
    expect(findings.length).toBe(0);
  });

  it("all rules pass the >=2 remedies contract when triggered", () => {
    const d = design({
      classes: [
        {
          id: "huge",
          name: "Huge",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["irrelevant"],
            doing: ["save data", "send notification", "log results", "delete entry", "fetch external"],
          },
          collaborators: [
            { name: "UserRepository", message: "x()" },
            { name: "HttpClient", message: "x()" },
            { name: "DbConnection", message: "x()" },
            { name: "Random", message: "x()" },
            { name: "Clock", message: "x()" },
          ],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ALL_RULE_IDS as unknown as Parameters<typeof validateDesign>[1] extends infer P ? P extends { rules?: infer R } ? R : never : never });
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      expect(f.remedies.length).toBeGreaterThanOrEqual(2);
    }
  });
});
