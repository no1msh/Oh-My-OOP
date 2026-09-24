import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import type { OopConfig } from "../../src/config.js";
import { workspacePaths } from "../../src/config.js";
import { loadDesign } from "../../src/io/design.js";
import { listHistory } from "../../src/io/history.js";
import { OOP_OPERATIONS, oopCommand } from "../../src/oop/commands.js";

let temporary: string;
let config: OopConfig;

beforeEach(async () => {
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), "oop-commands-"));
  const projectRoot = path.join(temporary, "project");
  await fs.mkdir(projectRoot);
  config = { projectRoot, oopDir: path.join(projectRoot, ".oop") };
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await fs.rm(temporary, { recursive: true, force: true });
});

describe("portable OOP commands", () => {
  it("uses the explicitly supplied workspace and applies defaults without MCP", async () => {
    const unrelated = path.join(temporary, "environment-project");
    vi.stubEnv("ARCH_PROJECT_ROOT", unrelated);
    vi.stubEnv("OOP_PROJECT_ROOT", unrelated);
    config.oopDir = path.join(temporary, "custom-model");

    expect(await oopCommand(config, { action: "oop_init" })).toMatchObject({
      project_root: config.projectRoot,
      oop_dir: config.oopDir,
      index: { project: "project" },
    });
    expect(await oopCommand(config, {
      action: "oop_use_case_add", title: "자동차 경주", actor: "참가자", main_flow: ["자동차가 전진한다"],
    })).toMatchObject({ id: "자동차-경주", created: true });
    await oopCommand(config, { action: "oop_class_upsert", name: "Car", stereotype: "InformationHolder" });

    const design = await loadDesign(config);
    expect(design.use_cases[0]).toMatchObject({ preconditions: [], postconditions: [], related_classes: [] });
    expect(design.classes[0]).toMatchObject({
      id: "car", responsibilities: { knowing: [], doing: [] },
      provenance: { derived_from_use_cases: [] },
    });
    await expect(fs.stat(unrelated)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(fs.stat(path.join(config.projectRoot, ".oop"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("rejects unknown operations and invalid arguments before creating a workspace", async () => {
    await expect(oopCommand(config, { action: "oop_missing" })).rejects.toThrow();
    await expect(oopCommand(config, { action: "oop_init", force: "yes" })).rejects.toThrow();
    await expect(OOP_OPERATIONS.oop_class_upsert.execute(config, {
      name: "Car", stereotype: "UnknownRole",
    })).rejects.toThrow();
    await expect(oopCommand(config, {
      action: "oop_use_case_add", title: "경주", actor: "참가자", main_flow: [],
    })).rejects.toThrow();
    await expect(fs.stat(config.oopDir)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("preserves idempotent responsibility assignments and derives collaborators from messages", async () => {
    await oopCommand(config, { action: "oop_init" });
    await oopCommand(config, { action: "oop_class_upsert", name: "Car", stereotype: "InformationHolder" });
    await oopCommand(config, { action: "oop_class_upsert", name: "Race", stereotype: "Coordinator" });
    const assignment = {
      action: "oop_assign_responsibility", class_id: "car", kind: "doing", text: "전진한다", from_use_case: "race",
    };
    await oopCommand(config, assignment);
    await oopCommand(config, assignment);
    await oopCommand(config, { action: "oop_collaboration_define", from: "Race", to: "Car", message: "advance()" });
    const design = await loadDesign(config);
    expect(design.classes.find(card => card.id === "car")).toMatchObject({
      responsibilities: { doing: ["전진한다"] },
      provenance: { derived_from_use_cases: ["race"] },
    });
    expect(await oopCommand(config, { action: "oop_class_list" })).toMatchObject({ classes: [
      { id: "car", responsibility_count: 1, collaborator_count: 0 },
      { id: "race", collaborator_count: 1 },
    ] });
    const contract = await OOP_OPERATIONS.oop_conformance_check.execute(config, { class_ids: ["Race"] });
    expect(contract.data.design_contract).toMatchObject([{
      id: "race", designed_collaborators: [{ name: "Car", message: "advance()" }],
    }]);
  });

  it("returns error-severity findings as advice and keeps subsequent edits available", async () => {
    await oopCommand(config, { action: "oop_init" });
    for (const name of ["Car", "Race"]) {
      await oopCommand(config, { action: "oop_class_upsert", name, stereotype: "InformationHolder" });
    }
    await oopCommand(config, { action: "oop_collaboration_define", from: "Car", to: "Race", message: "race()" });
    await oopCommand(config, { action: "oop_collaboration_define", from: "Race", to: "Car", message: "advance()" });
    const result = await OOP_OPERATIONS.oop_design_validate.execute(config, { rules: ["cycle"], severity_min: "error" });
    expect(result.data.findings).toHaveLength(1);
    expect(result.data.findings[0]).toMatchObject({ rule_id: "cycle", severity: "error" });
    expect(result.data.findings[0]!.remedies.length).toBeGreaterThanOrEqual(2);
    expect(await oopCommand(config, {
      action: "oop_assign_responsibility", class_id: "car", kind: "knowing", text: "현재 위치",
    })).toMatchObject({ class_id: "car" });
  });

  it("preserves snapshots and does not write diagrams when write_current is false", async () => {
    await oopCommand(config, { action: "oop_init" });
    const currentPath = workspacePaths(config).currentDiagram;
    const original = await fs.readFile(currentPath, "utf8");
    await oopCommand(config, {
      action: "oop_class_upsert", name: "Car", stereotype: "InformationHolder", snapshot_label: "before-car",
    });
    const preview = await OOP_OPERATIONS.oop_diagram_generate.execute(config, { write_current: false });
    expect(preview.data.path).toBeUndefined();
    expect(preview.data.mermaid).toContain("Car");
    expect(await fs.readFile(currentPath, "utf8")).toBe(original);
    const [history] = await listHistory(config);
    expect(await fs.readFile(history!.abs_path, "utf8")).toBe(original);
    await oopCommand(config, { action: "oop_diagram_generate" });
    const comparison = await OOP_OPERATIONS.oop_design_compare.execute(config, {
      before: { kind: "history", file: history!.file },
    });
    expect(comparison.data.diff.added_classes).toEqual(["Car"]);
    expect(comparison.text).toContain("Before");
    expect(comparison.text).toContain("After");
    expect(await oopCommand(config, { action: "oop_state_read", include: [] })).toEqual({
      index: (await loadDesign(config)).index,
    });
  });

  it("exposes storage and missing-contract errors to non-MCP callers", async () => {
    await expect(oopCommand(config, { action: "oop_state_read" })).rejects.toThrow("Call oop_init first");
    await oopCommand(config, { action: "oop_init" });
    await expect(oopCommand(config, { action: "oop_conformance_check" })).rejects.toThrow(
      "설계에 클래스가 없습니다. 먼저 oop_class_upsert로 CRC를 정의하세요.",
    );
    await expect(oopCommand(config, { action: "oop_conformance_check", class_ids: ["missing"] })).rejects.toThrow(
      "지정한 class_ids에 해당하는 클래스가 없습니다.",
    );
    await expect(oopCommand(config, {
      action: "oop_assign_responsibility", class_id: "missing", kind: "doing", text: "실행한다",
    })).rejects.toThrow("ENOENT");
  });
});
