import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { ensureWorkspace, workspaceExists, atomicWriteFile, readUtf8 } from "../../src/io/workspace.js";
import { createDefaultIndex, readDesignIndex, addToIndexList } from "../../src/io/designIndex.js";

let tmp: string;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "oop-test-"));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function cfg() {
  return { projectRoot: tmp, oopDir: path.join(tmp, ".oop") };
}

describe("workspace", () => {
  it("creates all required directories on init", async () => {
    const res = await ensureWorkspace(cfg());
    expect(res.created.length).toBeGreaterThan(0);
    expect(await workspaceExists(cfg())).toBe(true);
    for (const sub of ["use-cases", "classes", "collaborations", "diagrams", "history"]) {
      const st = await fs.stat(path.join(tmp, ".oop", sub));
      expect(st.isDirectory()).toBe(true);
    }
  });

  it("is idempotent — second init reports them as existing", async () => {
    await ensureWorkspace(cfg());
    const second = await ensureWorkspace(cfg());
    expect(second.created.length).toBe(0);
    expect(second.existed.length).toBeGreaterThan(0);
  });

  it("atomicWriteFile writes via tmp rename", async () => {
    const target = path.join(tmp, "nested", "file.txt");
    await atomicWriteFile(target, "hello");
    expect(await readUtf8(target)).toBe("hello");
  });
});

describe("designIndex", () => {
  it("creates default index and reads it back", async () => {
    await ensureWorkspace(cfg());
    const idx = await createDefaultIndex(cfg(), "demo");
    expect(idx.project).toBe("demo");
    const re = await readDesignIndex(cfg());
    expect(re.project).toBe("demo");
    expect(re.target_language).toBe("kotlin");
  });

  it("addToIndexList appends and sorts uniquely", async () => {
    await ensureWorkspace(cfg());
    await createDefaultIndex(cfg(), "demo");
    await addToIndexList(cfg(), "classes", "racing-game");
    await addToIndexList(cfg(), "classes", "car");
    await addToIndexList(cfg(), "classes", "racing-game");
    const idx = await readDesignIndex(cfg());
    expect(idx.classes).toEqual(["car", "racing-game"]);
  });
});
