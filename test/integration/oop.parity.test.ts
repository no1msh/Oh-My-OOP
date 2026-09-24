import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import type { OopConfig } from "../../src/config.js";
import { OOP_OPERATIONS, type OopOperationName } from "../../src/oop/commands.js";
import { createServer } from "../../src/server.js";

let temporary: string;
let coreConfig: OopConfig;
let mcpRoot: string;
let client: Client;
let server: McpServer;

beforeEach(async () => {
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), "oop-parity-"));
  const coreRoot = path.join(temporary, "core");
  mcpRoot = path.join(temporary, "mcp");
  await Promise.all([fs.mkdir(coreRoot), fs.mkdir(mcpRoot)]);
  coreConfig = { projectRoot: coreRoot, oopDir: path.join(coreRoot, ".oop") };
  vi.stubEnv("ARCH_PROJECT_ROOT", mcpRoot);
  vi.stubEnv("OOP_PROJECT_ROOT", mcpRoot);
  vi.stubEnv("ARCH_OOP_RULES", "on");
  server = createServer();
  client = new Client({ name: "oop-parity", version: "1.0.0" }, { capabilities: {} });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  try {
    await client?.close();
    await server?.close();
  } finally {
    vi.unstubAllEnvs();
    await fs.rm(temporary, { recursive: true, force: true });
  }
});

/** Only locations and independently generated timestamps differ across workspaces. */
function normalize(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value)
    .replaceAll(coreConfig.projectRoot, "<project>")
    .replaceAll(mcpRoot, "<project>")
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}[:-]\d{2}[:-]\d{2}[.-]\d{3}Z/g, "<timestamp>"));
}

async function compareSuccess(name: OopOperationName, args: Record<string, unknown>) {
  const direct = await OOP_OPERATIONS[name].execute(coreConfig, args);
  const mcp = await client.callTool({ name, arguments: args });
  expect(mcp.isError).not.toBe(true);
  expect(normalize(mcp.structuredContent)).toEqual(normalize(direct.data));
  const blocks = direct.text ? [{ type: "text", text: direct.text }] : [];
  blocks.push({ type: "text", text: "```json\n" + JSON.stringify(direct.data, null, 2) + "\n```" });
  expect(normalize(mcp.content)).toEqual(normalize(blocks));
  return direct.data;
}

async function documents(root: string, relative = ""): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    const file = path.join(relative, entry.name);
    if (entry.isDirectory()) Object.assign(result, await documents(root, file));
    else result[file] = await fs.readFile(path.join(root, file), "utf8");
  }
  return result;
}

describe("OOP core and MCP compatibility", () => {
  it("keeps all legacy tools, defaults, output presentation, and persisted state in parity", async () => {
    const listed = await client.listTools();
    const names = listed.tools.filter(tool => tool.name in OOP_OPERATIONS).map(tool => tool.name).sort();
    expect(names).toEqual(Object.keys(OOP_OPERATIONS).sort());
    const addSchema = listed.tools.find(tool => tool.name === "oop_use_case_add")!;
    expect(addSchema.outputSchema?.required).toEqual(["id", "path", "created"]);
    expect(listed.tools.find(tool => tool.name === "oop_diagram_generate")!.inputSchema.properties)
      .toMatchObject({ write_current: { type: "boolean", default: true } });

    const workflow: Array<[OopOperationName, Record<string, unknown>]> = [
      ["oop_init", { project: "race" }],
      ["oop_use_case_add", { id: "race", title: "자동차 경주", actor: "참가자", main_flow: ["자동차가 전진한다", "우승자를 구한다"] }],
      ["oop_use_case_list", {}],
      ["oop_propose_responsibilities", { use_case_id: "race" }],
      ["oop_class_upsert", { name: "Car", stereotype: "InformationHolder", responsibilities: { knowing: ["위치"] }, from_use_cases: ["race"] }],
      ["oop_class_upsert", { name: "Race", stereotype: "Coordinator", responsibilities: { doing: ["경주를 진행한다"] } }],
      ["oop_assign_responsibility", { class_id: "car", kind: "doing", text: "전진한다", from_use_case: "race" }],
      ["oop_assign_responsibility", { class_id: "car", kind: "doing", text: "전진한다", from_use_case: "race" }],
      ["oop_collaboration_define", { from: "Race", to: "Car", message: "advance()", snapshot_label: "before-messages" }],
      ["oop_class_list", {}],
      ["oop_propose_alternatives", { question: "collaboration_shape", context: { description: "경주가 자동차를 전진시킨다", involved: ["Race", "Car"] } }],
      ["oop_diagram_generate", {}],
      ["oop_diagram_generate", { write_current: false }],
      ["oop_design_compare", { before: { kind: "inline", mermaid: "classDiagram\n  class Car\n" } }],
      ["oop_collaboration_define", { from: "Car", to: "Race", message: "race()" }],
      ["oop_design_validate", { rules: ["cycle"], severity_min: "error" }],
      ["oop_conformance_check", {}],
      ["oop_conformance_check", { class_ids: ["Car"] }],
      ["oop_state_read", {}],
      ["oop_state_read", { include: ["classes", "collaborations"] }],
    ];
    const visited = new Set<OopOperationName>();
    for (const [name, args] of workflow) {
      await compareSuccess(name, args);
      visited.add(name);
    }
    expect([...visited].sort()).toEqual(Object.keys(OOP_OPERATIONS).sort());
    expect(normalize(await documents(coreConfig.oopDir)))
      .toEqual(normalize(await documents(path.join(mcpRoot, ".oop"))));
  });

  it("preserves MCP error results for storage and conformance failures", async () => {
    async function compareError(name: OopOperationName, args: Record<string, unknown>, prefix = "Error: ") {
      let message = "";
      try {
        await OOP_OPERATIONS[name].execute(coreConfig, args);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).not.toBe("");
      const mcp = await client.callTool({ name, arguments: args });
      expect(mcp.isError).toBe(true);
      expect(normalize(mcp.content)).toEqual(normalize([{ type: "text", text: `${prefix}${message}` }]));
      expect(mcp.structuredContent).toBeUndefined();
    }
    await compareError("oop_state_read", {});
    // The original class-list handler delegated error formatting to the SDK.
    await compareError("oop_class_list", {}, "");
    await compareSuccess("oop_init", { project: "race" });
    await compareError("oop_conformance_check", {});
    await compareError("oop_conformance_check", { class_ids: ["absent"] });
    await compareError("oop_assign_responsibility", { class_id: "absent", kind: "doing", text: "전진한다" });
    await compareError("oop_propose_responsibilities", { use_case_id: "absent" });
    await compareError("oop_design_compare", { before: { kind: "history", file: "absent.mmd" } });
  });

  it("rejects invalid MCP inputs before any persistent write", async () => {
    const result = await client.callTool({
      name: "oop_class_upsert", arguments: { name: "Car", stereotype: "UnknownRole" },
    });
    expect(result.isError).toBe(true);
    await expect(fs.stat(path.join(mcpRoot, ".oop"))).rejects.toMatchObject({ code: "ENOENT" });
  });
});
