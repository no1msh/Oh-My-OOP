import { describe, it, expect } from "vitest";
import { validateDesign } from "../../src/validate/rules.js";
import type { Design, Stereotype } from "../../src/domain/model.js";

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

const card = (
  id: string,
  name: string,
  stereotype: Stereotype,
  doing: string[] = [],
) => ({
  id,
  name,
  stereotype,
  responsibilities: { knowing: [], doing },
  collaborators: [],
  provenance: { derived_from_use_cases: [], created_at: "x" },
});

const collab = (from: string, to: string, message: string) => ({
  id: `${from}-${to}`,
  from,
  to,
  message,
  direction: "send" as const,
});

describe("orphan-class: collaboration이 name으로 정의돼도 오탐 안 남 (id/name 매칭)", () => {
  it("협력 대상(to)인 클래스는 name으로 참조돼도 orphan이 아니다", () => {
    const d = design({
      classes: [card("car", "Car", "InformationHolder"), card("movingstrategy", "MovingStrategy", "ServiceProvider")],
      // 모델이 흔히 하듯 from/to를 *이름*으로 정의 (id 아님)
      collaborations: [collab("Car", "MovingStrategy", "전진 가능 여부를 묻는다")],
    });
    const findings = validateDesign(d, { rules: ["orphan-class"] });
    const orphans = findings.map((f) => f.target.id);
    expect(orphans).not.toContain("car"); // from 으로 참조됨
    expect(orphans).not.toContain("movingstrategy"); // to 로 참조됨 (예전엔 오탐)
  });

  it("정말로 아무 데서도 참조 안 되는 클래스는 여전히 orphan", () => {
    const d = design({
      classes: [card("lonely", "Lonely", "ServiceProvider")],
      collaborations: [],
    });
    const findings = validateDesign(d, { rules: ["orphan-class"] });
    expect(findings.map((f) => f.target.id)).toContain("lonely");
  });
});

describe("presentation-in-domain: 도메인 객체의 표현/출력 책임 적발", () => {
  it("InformationHolder가 '문자열로 표현' 책임을 가지면 적발 (getStatus/toString 누수)", () => {
    const d = design({
      classes: [
        card("car", "Car", "InformationHolder", [
          "전략에 따라 전진한다",
          "현재 상태(이름+위치)를 문자열로 표현한다",
        ]),
      ],
    });
    const findings = validateDesign(d, { rules: ["presentation-in-domain"] });
    expect(findings.length).toBe(1);
    expect(findings[0]!.target.id).toBe("car");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("Interfacer의 출력 책임은 정당하므로 적발 안 함", () => {
    const d = design({
      classes: [
        card("resultview", "ResultView", "Interfacer", ["각 Car의 상태를 출력한다", "우승자를 출력한다"]),
      ],
    });
    const findings = validateDesign(d, { rules: ["presentation-in-domain"] });
    expect(findings.length).toBe(0);
  });

  it("표현 어휘가 없는 도메인 책임은 적발 안 함", () => {
    const d = design({
      classes: [card("cars", "Cars", "Structurer", ["모든 Car를 전진시킨다", "우승자를 반환한다"])],
    });
    const findings = validateDesign(d, { rules: ["presentation-in-domain"] });
    expect(findings.length).toBe(0);
  });
});
