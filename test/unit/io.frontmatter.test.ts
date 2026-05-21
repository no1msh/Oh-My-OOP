import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { ensureWorkspace } from "../../src/io/workspace.js";
import { createDefaultIndex } from "../../src/io/designIndex.js";
import { upsertClass, readClass } from "../../src/io/classStore.js";
import { upsertUseCase, readUseCase } from "../../src/io/useCaseStore.js";

let tmp: string;
beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "oop-fm-"));
});
afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});
function cfg() {
  return { projectRoot: tmp, oopDir: path.join(tmp, ".oop") };
}

describe("frontmatter round-trip", () => {
  it("CRC card writes and reads back identically", async () => {
    await ensureWorkspace(cfg());
    await createDefaultIndex(cfg(), "demo");
    await upsertClass(cfg(), {
      id: "racing-game",
      name: "RacingGame",
      stereotype: "Coordinator",
      responsibilities: {
        knowing: ["참가하는 자동차들을 안다"],
        doing: ["한 라운드를 진행한다"],
      },
      collaborators: [{ name: "Cars", message: "moveAll(strategy)" }],
      provenance: { derived_from_use_cases: ["race-cars"], created_at: "2026-05-21T10:00:00Z" },
    });
    const back = await readClass(cfg(), "racing-game");
    expect(back.name).toBe("RacingGame");
    expect(back.stereotype).toBe("Coordinator");
    expect(back.responsibilities.knowing).toContain("참가하는 자동차들을 안다");
    expect(back.collaborators[0]?.message).toBe("moveAll(strategy)");
  });

  it("use case writes and reads back", async () => {
    await ensureWorkspace(cfg());
    await createDefaultIndex(cfg(), "demo");
    await upsertUseCase(cfg(), {
      id: "race-cars",
      title: "N대의 자동차로 M번 경주한다",
      actor: "Player",
      preconditions: ["자동차 이름이 주어진다"],
      main_flow: ["라운드를 진행한다", "우승자를 출력한다"],
      postconditions: ["우승자가 출력된다"],
      related_classes: ["racing-game"],
    });
    const uc = await readUseCase(cfg(), "race-cars");
    expect(uc.actor).toBe("Player");
    expect(uc.main_flow.length).toBe(2);
  });

  it("rejects malformed frontmatter via zod", async () => {
    await ensureWorkspace(cfg());
    await createDefaultIndex(cfg(), "demo");
    const badPath = path.join(tmp, ".oop", "classes", "bad.md");
    await fs.writeFile(
      badPath,
      "---\nid: bad\nname: Bad\nstereotype: NotARealOne\n---\n",
      "utf8",
    );
    await expect(readClass(cfg(), "bad")).rejects.toThrow();
  });
});
