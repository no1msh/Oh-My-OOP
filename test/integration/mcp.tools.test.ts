import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

let tmp: string;
let client: Client;
let transport: StdioClientTransport;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "oop-it-"));
});

afterEach(async () => {
  if (client) await client.close();
  await fs.rm(tmp, { recursive: true, force: true });
});

async function startClient(): Promise<void> {
  const here = path.dirname(new URL(import.meta.url).pathname);
  const serverPath = path.resolve(here, "../../dist/index.js");
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: { ...process.env, OOP_PROJECT_ROOT: tmp },
  });
  client = new Client({ name: "it", version: "0.0.1" }, { capabilities: {} });
  await client.connect(transport);
}

async function callJson(name: string, args: Record<string, unknown>): Promise<unknown> {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) throw new Error(JSON.stringify(r.content));
  return r.structuredContent ?? r.content;
}

describe("MCP server stdio integration", () => {
  it("lists 13 tools", async () => {
    await startClient();
    const list = await client.listTools();
    const names = list.tools.map((t) => t.name);
    expect(names.length).toBeGreaterThanOrEqual(13);
    for (const expected of [
      "oop_init",
      "oop_use_case_add",
      "oop_use_case_list",
      "oop_propose_responsibilities",
      "oop_assign_responsibility",
      "oop_class_upsert",
      "oop_class_list",
      "oop_collaboration_define",
      "oop_propose_alternatives",
      "oop_diagram_generate",
      "oop_design_compare",
      "oop_design_validate",
      "oop_conformance_check",
      "oop_state_read",
    ]) {
      expect(names).toContain(expected);
    }
  });

  it("oop_init creates .oop/ in OOP_PROJECT_ROOT", async () => {
    await startClient();
    const out = (await callJson("oop_init", { project: "demo" })) as { oop_dir: string };
    expect(out.oop_dir).toBe(path.join(tmp, ".oop"));
    const st = await fs.stat(out.oop_dir);
    expect(st.isDirectory()).toBe(true);
  });

  it("oop_propose_responsibilities returns >=2 alternatives", async () => {
    await startClient();
    await callJson("oop_init", { project: "demo" });
    await callJson("oop_use_case_add", {
      title: "N대의 자동차로 M번 경주",
      actor: "Player",
      main_flow: ["자동차 이름 입력", "라운드 진행", "우승자 출력"],
    });
    const out = (await callJson("oop_propose_responsibilities", {
      use_case_id: "n대의-자동차로-m번-경주",
      n: 3,
    })) as { alternatives: unknown[] };
    expect(out.alternatives.length).toBeGreaterThanOrEqual(2);
  });

  it("oop_propose_alternatives includes Tell-Don't-Ask for collaboration_shape", async () => {
    await startClient();
    await callJson("oop_init", { project: "demo" });
    const out = (await callJson("oop_propose_alternatives", {
      question: "collaboration_shape",
      context: { description: "How should A talk to B?", involved: ["A", "B"] },
      n: 4,
    })) as { alternatives: Array<{ label: string }> };
    expect(out.alternatives.map((a) => a.label)).toContain("Tell-Don't-Ask");
  });
});
