import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

let tmp: string;
let client: Client;
let transport: StdioClientTransport;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "oop-e2e-"));
});

afterEach(async () => {
  if (client) await client.close();
  await fs.rm(tmp, { recursive: true, force: true });
});

async function start(): Promise<void> {
  const here = path.dirname(new URL(import.meta.url).pathname);
  const serverPath = path.resolve(here, "../../dist/index.js");
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: { ...process.env, OOP_PROJECT_ROOT: tmp },
  });
  client = new Client({ name: "e2e", version: "0.0.1" }, { capabilities: {} });
  await client.connect(transport);
}

async function call<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) throw new Error(JSON.stringify(r.content));
  return (r.structuredContent ?? r.content) as T;
}

describe("racingcar workshop E2E", () => {
  it("runs the full RDD loop and validates the design", async () => {
    await start();

    await call("oop_init", { project: "racingcar" });

    await call("oop_use_case_add", {
      id: "race-cars",
      title: "N대의 자동차로 M번 경주",
      actor: "Player",
      main_flow: ["이름 입력", "한 라운드 진행", "우승자 출력"],
      related_classes: ["racing-game", "cars", "car"],
    });

    await call("oop_class_upsert", {
      id: "racing-game",
      name: "RacingGame",
      stereotype: "Coordinator",
      responsibilities: {
        knowing: ["참가하는 자동차들을 안다", "남은 시도 횟수를 안다"],
        doing: ["한 라운드를 진행한다", "우승자를 보고한다"],
      },
      collaborators: [],
      from_use_cases: ["race-cars"],
    });
    await call("oop_class_upsert", {
      id: "cars",
      name: "Cars",
      stereotype: "Structurer",
      responsibilities: { knowing: ["자동차들의 모음을 안다"], doing: ["모든 자동차를 전진시킨다"] },
      collaborators: [],
      from_use_cases: ["race-cars"],
    });
    await call("oop_class_upsert", {
      id: "car",
      name: "Car",
      stereotype: "InformationHolder",
      responsibilities: { knowing: ["이름과 위치를 안다"], doing: ["전진한다"] },
      collaborators: [],
      from_use_cases: ["race-cars"],
    });

    await call("oop_collaboration_define", {
      from: "racing-game",
      to: "cars",
      message: "moveAll()",
      rationale: "Tell-Don't-Ask",
    });
    await call("oop_collaboration_define", {
      from: "cars",
      to: "car",
      message: "move()",
    });

    const beforeDiag = await call<{ mermaid: string }>("oop_diagram_generate", {});
    expect(beforeDiag.mermaid).toContain("RacingGame");
    expect(beforeDiag.mermaid).toContain("Car");

    await call("oop_class_upsert", {
      name: "RacingGame",
      stereotype: "Coordinator",
      responsibilities: {
        knowing: ["참가하는 자동차들을 안다", "남은 시도 횟수를 안다"],
        doing: ["한 라운드를 진행한다", "우승자를 보고한다"],
      },
      collaborators: [{ name: "Cars", message: "moveAll(strategy)" }],
      from_use_cases: ["race-cars"],
      snapshot_label: "before-extract-strategy",
    });
    await call("oop_class_upsert", {
      name: "MoveStrategy",
      stereotype: "ServiceProvider",
      responsibilities: { knowing: [], doing: ["전진 여부를 판단한다"] },
      collaborators: [],
    });
    await call("oop_collaboration_define", {
      from: "car",
      to: "move-strategy",
      message: "shouldMove()",
    });

    await call("oop_diagram_generate", {});

    const cmp = await call<{
      diff: { added_classes: string[] };
      side_by_side_markdown: string;
    }>("oop_design_compare", {
      before: { kind: "history", file: await firstHistoryFile(tmp) },
      after: { kind: "current" },
    });
    expect(cmp.diff.added_classes).toContain("MoveStrategy");
    expect(cmp.side_by_side_markdown).toContain("```mermaid");

    const v = await call<{ findings: Array<{ remedies: unknown[] }> }>(
      "oop_design_validate",
      {},
    );
    for (const f of v.findings) {
      expect(f.remedies.length).toBeGreaterThanOrEqual(2);
    }
  });
});

async function firstHistoryFile(root: string): Promise<string> {
  const dir = path.join(root, ".oop", "history");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mmd")).sort();
  if (files.length === 0) throw new Error("no history snapshot present");
  return files[0]!;
}
