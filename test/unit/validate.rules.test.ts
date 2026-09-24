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

  it("vague-class-name fires on virtual-object vocabulary (Judge/Picker/Distributor/Calculator/Rule) and respects domain prefixes", () => {
    const d = design({
      classes: [
        {
          id: "j",
          name: "Judge",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["judge"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "p",
          name: "Picker",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["pick"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "d",
          name: "Distributor",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["distribute"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "c",
          name: "Calculator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["calculate"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "r",
          name: "Rule",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["enforce rule"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        // 도메인 prefix가 3자 이상이면 통과 (의도된 도메인 어휘).
        {
          id: "lp",
          name: "LottoNumberPicker",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["pick lotto number"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "bc",
          name: "BettingCalculator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["calc bet"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["vague-class-name"] });
    expect(findings.length).toBe(5);
    const names = findings.map((f) => (f.evidence as { name: string }).name).sort();
    expect(names).toEqual([
      "Calculator",
      "Distributor",
      "Judge",
      "Picker",
      "Rule",
    ]);
    for (const f of findings) expect(f.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("singleton-stateful-holder fires on singleton-marked holder with mutable state", () => {
    const d = design({
      classes: [
        // notes 에 singleton 표식 + 가변 상태 knowing — fire
        {
          id: "deck",
          name: "Deck",
          stereotype: "Structurer",
          responsibilities: {
            knowing: ["mutableListOf cards"],
            doing: ["draw card"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
          notes: "Kotlin object 키워드로 선언된 Singleton",
        },
        // name 에 Singleton + 가변 상태 — fire
        {
          id: "gs",
          name: "GlobalSession",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["가변 사용자 목록"],
            doing: ["add user"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        // 가변 상태 없음 (notes 만 singleton) — pass
        {
          id: "config",
          name: "Config",
          stereotype: "InformationHolder",
          responsibilities: { knowing: ["api url"], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
          notes: "Singleton",
        },
        // 가변 상태 있지만 singleton 표식 없음 — pass (일반 일급 컬렉션)
        {
          id: "hand",
          name: "Hand",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["mutable cards"],
            doing: ["add card"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        // ServiceProvider 이라 pass (stereotype 제한)
        {
          id: "svc",
          name: "SingletonService",
          stereotype: "ServiceProvider",
          responsibilities: {
            knowing: ["mutable cache"],
            doing: ["lookup"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["singleton-stateful-holder"],
    });
    expect(findings.length).toBe(2);
    for (const f of findings) {
      expect(f.remedies.length).toBeGreaterThanOrEqual(2);
      const ev = f.evidence as {
        singleton_signal: string;
        mutable_knowing: string;
        guideline: string;
      };
      expect(["name", "notes"]).toContain(ev.singleton_signal);
      expect(ev.mutable_knowing.length).toBeGreaterThan(0);
      expect(ev.guideline).toContain("malibinYun");
    }
  });

  it("dual-purpose-knowing fires when a holder has both display and compare doings", () => {
    const d = design({
      classes: [
        // 표현 + 비교 doing 둘 다 있는 InformationHolder — fire
        {
          id: "hand",
          name: "Hand",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["score"],
            doing: ["display score", "compare strength with other hand"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        // 표현만 있음 — pass
        {
          id: "view",
          name: "ScoreView",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["score"],
            doing: ["render score", "format text"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        // 비교만 있음 — pass
        {
          id: "judgeholder",
          name: "ComparisonState",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["a", "b"],
            doing: ["compare a and b", "judge winner"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        // ServiceProvider 이라 pass (stereotype 제한 — 표현·비교 모두 호출하는 Coordinator/Service 는 정상)
        {
          id: "svc",
          name: "DisplayCompareService",
          stereotype: "ServiceProvider",
          responsibilities: {
            knowing: [],
            doing: ["render score", "compare scores"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, { rules: ["dual-purpose-knowing"] });
    expect(findings.length).toBe(1);
    const f = findings[0]!;
    const ev = f.evidence as {
      display_doing: string;
      compare_doing: string;
      guideline: string;
    };
    expect(ev.display_doing).toContain("display");
    expect(ev.compare_doing).toContain("compare");
    expect(ev.guideline).toContain("laco-dev");
    expect(f.remedies.length).toBeGreaterThanOrEqual(2);
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

  it("primitive-wrapper-without-invariant fires on LottoNumber-shape Holder without invariant", () => {
    const d = design({
      classes: [
        {
          id: "ln",
          name: "LottoNumber",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["번호 value: Int"],
            doing: [],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["primitive-wrapper-without-invariant"],
    });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("warn");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("primitive-wrapper-without-invariant suppressed when require/검증 intent is stated", () => {
    const d = design({
      classes: [
        {
          id: "ln",
          name: "LottoNumber",
          stereotype: "InformationHolder",
          responsibilities: {
            knowing: ["번호 value: Int"],
            doing: ["init에서 1..45 범위 검증"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["primitive-wrapper-without-invariant"],
    });
    expect(findings.length).toBe(0);
  });

  it("primitive-wrapper-without-invariant skips names that aren't wrapper-shape", () => {
    const d = design({
      classes: [
        {
          id: "c",
          name: "Car",
          stereotype: "InformationHolder",
          responsibilities: { knowing: ["name: String", "position: Int"], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["primitive-wrapper-without-invariant"],
    });
    expect(findings.length).toBe(0);
  });

  it("primitive-wrapper-without-invariant skips multi-knowing holders", () => {
    const d = design({
      classes: [
        {
          id: "m",
          name: "Money",
          stereotype: "InformationHolder",
          responsibilities: { knowing: ["value: Int", "currency: String"], doing: [] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["primitive-wrapper-without-invariant"],
    });
    expect(findings.length).toBe(0);
  });

  it("strategy-default-param-pollution fires on Manual/Automatic Machine group with asymmetric knowing", () => {
    const d = design({
      classes: [
        {
          id: "amm",
          name: "AutomaticLottoMachine",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["로또를 생성한다"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "mlm",
          name: "ManualLottoMachine",
          stereotype: "ServiceProvider",
          responsibilities: {
            knowing: ["수동 입력 번호들 List<List<Int>>"],
            doing: ["로또를 생성한다"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["strategy-default-param-pollution"],
    });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("warn");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("strategy-default-param-pollution suppressed when knowing is symmetric", () => {
    const d = design({
      classes: [
        {
          id: "a",
          name: "FastGenerator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: ["seed: Long"], doing: ["빠르게 생성"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
        {
          id: "b",
          name: "SlowGenerator",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: ["delay: Long"], doing: ["느리게 생성"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["strategy-default-param-pollution"],
    });
    expect(findings.length).toBe(0);
  });

  it("strategy-default-param-pollution skips when only one strategy variant exists", () => {
    const d = design({
      classes: [
        {
          id: "a",
          name: "SoloMachine",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["뭔가 한다"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["strategy-default-param-pollution"],
    });
    expect(findings.length).toBe(0);
  });

  it("function-decomposition-excess fires on 4+ short verb-only doings without domain nouns", () => {
    const d = design({
      classes: [
        {
          id: "wd",
          name: "WinningDiscriminator",
          stereotype: "ServiceProvider",
          responsibilities: {
            knowing: ["당첨 정보"],
            doing: ["추출", "조립", "검증", "포맷", "정리"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["function-decomposition-excess"],
    });
    expect(findings.length).toBe(1);
    expect(findings[0]!.severity).toBe("info");
    expect(findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it("function-decomposition-excess suppressed when doings carry domain nouns", () => {
    const d = design({
      classes: [
        {
          id: "wd",
          name: "WinningDiscriminator",
          stereotype: "ServiceProvider",
          responsibilities: {
            knowing: ["당첨 정보"],
            doing: [
              "당첨 등수를 계산한다",
              "보너스 일치 여부를 판정한다",
              "총 수익률을 계산한다",
              "결과 요약을 만든다",
            ],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["function-decomposition-excess"],
    });
    expect(findings.length).toBe(0);
  });

  it("function-decomposition-excess skips Interfacer (adapters legitimately have many short methods)", () => {
    const d = design({
      classes: [
        {
          id: "ov",
          name: "OutputView",
          stereotype: "Interfacer",
          responsibilities: {
            knowing: [],
            doing: ["출력", "표시", "포맷", "줄바꿈", "헤더"],
          },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["function-decomposition-excess"],
    });
    expect(findings.length).toBe(0);
  });

  it("function-decomposition-excess skips classes with <4 doings", () => {
    const d = design({
      classes: [
        {
          id: "a",
          name: "Tiny",
          stereotype: "ServiceProvider",
          responsibilities: { knowing: [], doing: ["추출", "조립", "검증"] },
          collaborators: [],
          provenance: { derived_from_use_cases: [], created_at: "x" },
        },
      ],
    });
    const findings = validateDesign(d, {
      rules: ["function-decomposition-excess"],
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
