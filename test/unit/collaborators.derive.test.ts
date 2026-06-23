import { describe, it, expect } from "vitest";
import { deriveCollaborators } from "../../src/domain/collaborators.js";
import type { CrcCard, Stereotype } from "../../src/domain/model.js";

const card = (id: string, name: string, stereotype: Stereotype): CrcCard => ({
  id,
  name,
  stereotype,
  responsibilities: { knowing: [], doing: [] },
  // 저장된 잘못된 값 — 파생 시 무시되어야 한다 (단일 진실 출처)
  collaborators: [{ name: "STALE", message: "stale()" }],
  provenance: { derived_from_use_cases: [], created_at: "x" },
});

describe("deriveCollaborators — 단일 진실 출처(collaborations)", () => {
  it("collaborations에서 파생하고, 저장된 stale collaborators는 무시한다", () => {
    const classes = [card("rg", "RacingGame", "Coordinator"), card("car", "Car", "InformationHolder")];
    const out = deriveCollaborators(classes, [
      { from: "rg", to: "car", message: "moveForward(power)" },
    ]);
    expect(out.find((c) => c.id === "rg")?.collaborators).toEqual([
      { name: "Car", message: "moveForward(power)" },
    ]);
    // 협력이 없는 클래스는 stale 값이 사라지고 빈 배열
    expect(out.find((c) => c.id === "car")?.collaborators).toEqual([]);
  });

  it("대상 id를 클래스 name으로 해석한다", () => {
    const classes = [card("a", "Alpha", "Coordinator"), card("b", "Beta", "InformationHolder")];
    const out = deriveCollaborators(classes, [{ from: "a", to: "b", message: "ask()" }]);
    expect(out[0]!.collaborators[0]!.name).toBe("Beta");
  });

  it("collaboration이 name으로 참조해도 매칭한다", () => {
    const classes = [card("a", "Alpha", "Coordinator")];
    const out = deriveCollaborators(classes, [{ from: "Alpha", to: "Gamma", message: "go()" }]);
    expect(out[0]!.collaborators).toEqual([{ name: "Gamma", message: "go()" }]);
  });

  it("다이어그램(collaborations)과 collaborators가 같은 그래프를 가리킨다", () => {
    const classes = [card("a", "A", "Coordinator"), card("b", "B", "InformationHolder")];
    const collaborations = [{ from: "a", to: "b", message: "send()" }];
    const out = deriveCollaborators(classes, collaborations);
    // collaborators에서 본 엣지 == collaborations 엣지
    const fromCollaborators = out.flatMap((c) =>
      c.collaborators.map((x) => `${c.name}->${x.name}`),
    );
    const fromCollaborations = collaborations.map(
      (e) => `${classes.find((c) => c.id === e.from)!.name}->${classes.find((c) => c.id === e.to)!.name}`,
    );
    expect(fromCollaborators).toEqual(fromCollaborations);
  });
});
