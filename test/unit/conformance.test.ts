import { describe, it, expect } from "vitest";
import {
  buildDesignContract,
  CONFORMANCE_CHECKLIST,
  CONFORMANCE_INSTRUCTION,
} from "../../src/tools/conformance.js";
import type { CrcCard, Stereotype } from "../../src/domain/model.js";

const card = (name: string, stereotype: Stereotype, doing: string[] = []): CrcCard => ({
  id: name.toLowerCase(),
  name,
  stereotype,
  responsibilities: { knowing: [], doing },
  collaborators: [],
  provenance: { derived_from_use_cases: [], created_at: "x" },
});

describe("oop_conformance_check — 설계 명세(contract) 생성", () => {
  it("각 클래스의 stereotype·책임·misfit을 명세로 노출한다", () => {
    const contract = buildDesignContract([card("Car", "InformationHolder", ["전진한다"])]);
    expect(contract).toHaveLength(1);
    const car = contract[0]!;
    expect(car.name).toBe("Car");
    expect(car.stereotype).toBe("InformationHolder");
    expect(car.designed_responsibilities.doing).toContain("전진한다");
    // misfit이 명세에 실려야 모델이 위반을 판단할 근거가 생긴다
    expect(car.misfits.length).toBeGreaterThan(0);
  });

  it("InformationHolder 명세는 '표현 문자열 보유'를 misfit으로 포함한다 (getStatus 검출 근거)", () => {
    const [car] = buildDesignContract([card("Car", "InformationHolder")]);
    const hasPresentationMisfit = car!.misfits.some((m) => m.includes("표현"));
    expect(hasPresentationMisfit).toBe(true);
  });

  it("적대적 검토 지시와 체크리스트를 제공한다", () => {
    expect(CONFORMANCE_INSTRUCTION).toContain("적대적");
    expect(CONFORMANCE_INSTRUCTION).toContain("remedies");
    // 핵심 카테고리가 체크리스트에 있어야 한다
    const joined = CONFORMANCE_CHECKLIST.join(" ");
    expect(joined).toContain("미설계");
    expect(joined).toContain("stereotype");
    expect(joined).toContain("toString/getStatus");
  });
});
