import { describe, it, expect } from "vitest";
import { parseMermaid, diffDiagrams } from "../../src/render/diff.js";
import { buildSideBySide } from "../../src/render/sideBySide.js";

const before = `classDiagram
  class RacingGame
  class Cars
  class Car
  RacingGame --> Cars : moveAll()
  Cars o-- Car
`;

const after = `classDiagram
  class RacingGame
  class Cars
  class Car
  class MoveStrategy
  RacingGame --> Cars : moveAll(strategy)
  Car --> MoveStrategy : shouldMove()
`;

describe("diff & side-by-side", () => {
  it("parses class names and relations", () => {
    const p = parseMermaid(after);
    expect(p.classes.has("MoveStrategy")).toBe(true);
    expect(p.relations.find((r) => r.from === "Car" && r.to === "MoveStrategy")).toBeTruthy();
  });

  it("detects added classes, added relations, changed message", () => {
    const d = diffDiagrams(parseMermaid(before), parseMermaid(after));
    expect(d.added_classes).toContain("MoveStrategy");
    expect(d.added_relations.some((r) => r.from === "Car" && r.to === "MoveStrategy")).toBe(true);
    expect(d.changed_relations.some((r) => r.from === "RacingGame" && r.before === "moveAll()" && r.after === "moveAll(strategy)")).toBe(true);
  });

  it("annotates added class with <<added>>, emits two blocks, and stays v9-compatible", () => {
    const d = diffDiagrams(parseMermaid(before), parseMermaid(after));
    const res = buildSideBySide(before, after, d);
    // 추가된 클래스는 v10 전용 :::가 아니라 모든 버전 지원 <<added>> 블록으로 표기
    expect(res.after_mermaid).toContain("class MoveStrategy {");
    expect(res.after_mermaid).toContain("<<added>>");
    expect(res.after_mermaid).not.toContain("classDef");
    expect(res.after_mermaid).not.toContain(":::");
    expect(res.before_mermaid).not.toContain("classDef");
    expect(res.side_by_side_markdown.match(/```mermaid/g)?.length).toBe(2);
    expect(res.side_by_side_markdown).toContain("## Before");
    expect(res.side_by_side_markdown).toContain("## After");
  });
});
