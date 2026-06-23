import { describe, it, expect } from "vitest";
import { renderClassDiagram } from "../../src/render/mermaid.js";

describe("renderClassDiagram", () => {
  it("emits classDiagram with stable class ordering", async () => {
    const mermaid = renderClassDiagram({
      classes: [
        {
          id: "z-class",
          name: "Zoo",
          stereotype: "Coordinator",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "a-class",
          name: "Apple",
          stereotype: "InformationHolder",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
      collaborations: [],
    });
    const apple = mermaid.indexOf("class Apple");
    const zoo = mermaid.indexOf("class Zoo");
    expect(apple).toBeGreaterThan(-1);
    expect(zoo).toBeGreaterThan(apple);
  });

  it("omits classDef/::: for broad Mermaid (v9) compatibility", () => {
    // classDef/:::는 Mermaid v10+ 전용 — v9 뷰어(GitHub·Notion 등)에서 전체 렌더가 깨진다.
    const m = renderClassDiagram({ classes: [], collaborations: [] });
    expect(m.startsWith("classDiagram")).toBe(true);
    expect(m).not.toContain("classDef");
    expect(m).not.toContain(":::");
  });

  it("renders relations from collaborations using class names", () => {
    const m = renderClassDiagram({
      classes: [
        {
          id: "rg",
          name: "RacingGame",
          stereotype: "Coordinator",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "cars",
          name: "Cars",
          stereotype: "Structurer",
          responsibilities: { knowing: [], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
      collaborations: [
        {
          id: "rg__moves__cars",
          from: "rg",
          to: "cars",
          message: "moveAll(strategy)",
          direction: "send",
        },
      ],
    });
    expect(m).toContain("RacingGame --> Cars : moveAll(strategy)");
  });
});
