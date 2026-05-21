import * as path from "node:path";
import { workspacePaths, type OopConfig } from "../config.js";
import { readDocument, writeDocument } from "./frontmatter.js";
import { CrcCardSchema } from "../domain/schemas.js";
import type { CrcCard } from "../domain/model.js";
import { listMarkdown, pathExists } from "./workspace.js";
import { addToIndexList } from "./designIndex.js";

function fileFor(config: OopConfig, id: string): string {
  return path.join(workspacePaths(config).classesDir, `${id}.md`);
}

export async function upsertClass(
  config: OopConfig,
  card: CrcCard,
  body?: string,
): Promise<{ path: string; created: boolean }> {
  const file = fileFor(config, card.id);
  const exists = await pathExists(file);
  await writeDocument(file, card, body ?? defaultBody(card));
  await addToIndexList(config, "classes", card.id);
  return { path: file, created: !exists };
}

export async function readClass(
  config: OopConfig,
  id: string,
): Promise<CrcCard> {
  const doc = await readDocument(fileFor(config, id), CrcCardSchema);
  return doc.data;
}

export async function listClasses(config: OopConfig): Promise<CrcCard[]> {
  const files = await listMarkdown(workspacePaths(config).classesDir);
  const out: CrcCard[] = [];
  for (const f of files) {
    const doc = await readDocument(f, CrcCardSchema);
    out.push(doc.data);
  }
  return out;
}

export async function classExists(
  config: OopConfig,
  id: string,
): Promise<boolean> {
  return pathExists(fileFor(config, id));
}

function defaultBody(card: CrcCard): string {
  return `# ${card.name}

${card.notes ?? "워크숍 노트, 채택 이유, 폐기된 대안 등을 자유롭게 적어주세요."}
`;
}
