import * as path from "node:path";
import { workspacePaths, type OopConfig } from "../config.js";
import { readDocument, writeDocument } from "./frontmatter.js";
import { CollaborationSchema } from "../domain/schemas.js";
import type { Collaboration } from "../domain/model.js";
import { listMarkdown, pathExists } from "./workspace.js";
import { addToIndexList } from "./designIndex.js";

function fileFor(config: OopConfig, id: string): string {
  return path.join(workspacePaths(config).collaborationsDir, `${id}.md`);
}

export async function upsertCollaboration(
  config: OopConfig,
  collab: Collaboration,
  body?: string,
): Promise<{ path: string; created: boolean }> {
  const file = fileFor(config, collab.id);
  const exists = await pathExists(file);
  await writeDocument(file, collab, body ?? defaultBody(collab));
  await addToIndexList(config, "collaborations", collab.id);
  return { path: file, created: !exists };
}

export async function listCollaborations(
  config: OopConfig,
): Promise<Collaboration[]> {
  const files = await listMarkdown(workspacePaths(config).collaborationsDir);
  const out: Collaboration[] = [];
  for (const f of files) {
    const doc = await readDocument(f, CollaborationSchema);
    out.push(doc.data);
  }
  return out;
}

function defaultBody(c: Collaboration): string {
  return `# ${c.from} → ${c.to} : ${c.message}

${c.rationale ?? "이 협력을 둔 이유를 기록하세요."}
`;
}
