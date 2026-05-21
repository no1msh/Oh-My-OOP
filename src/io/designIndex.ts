import * as path from "node:path";
import { workspacePaths, type OopConfig } from "../config.js";
import { readDocument, writeDocument, nowIso } from "./frontmatter.js";
import { DesignIndexSchema } from "../domain/schemas.js";
import type { DesignIndex } from "../domain/model.js";
import { pathExists } from "./workspace.js";

const DEFAULT_BODY = `# Design Index

이 문서는 \`.oop/\` 워크스페이스의 인덱스입니다. 직접 수정하기보다는 MCP 도구를 통해 변경하세요.
`;

export async function readDesignIndex(config: OopConfig): Promise<DesignIndex> {
  const file = workspacePaths(config).designIndex;
  if (!(await pathExists(file))) {
    throw new Error(
      `Design index not found at ${file}. Call oop_init first.`,
    );
  }
  const doc = await readDocument(file, DesignIndexSchema);
  return doc.data;
}

export async function writeDesignIndex(
  config: OopConfig,
  index: DesignIndex,
  body?: string,
): Promise<void> {
  const file = workspacePaths(config).designIndex;
  const next = { ...index, updated_at: nowIso() };
  await writeDocument(file, next, body ?? DEFAULT_BODY);
}

export async function createDefaultIndex(
  config: OopConfig,
  project: string,
): Promise<DesignIndex> {
  const file = workspacePaths(config).designIndex;
  const exists = await pathExists(file);
  if (exists) {
    return readDesignIndex(config);
  }
  const idx: DesignIndex = {
    oop_version: 1,
    project,
    target_language: "kotlin",
    updated_at: nowIso(),
    use_cases: [],
    classes: [],
    collaborations: [],
    current_diagram: path.posix.join("diagrams", "current.mmd"),
  };
  await writeDesignIndex(config, idx, DEFAULT_BODY);
  return idx;
}

export async function addToIndexList(
  config: OopConfig,
  key: "use_cases" | "classes" | "collaborations",
  id: string,
): Promise<void> {
  const idx = await readDesignIndex(config);
  if (!idx[key].includes(id)) {
    idx[key] = [...idx[key], id].sort();
    await writeDesignIndex(config, idx);
  }
}
