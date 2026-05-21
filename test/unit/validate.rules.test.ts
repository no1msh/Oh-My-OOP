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
