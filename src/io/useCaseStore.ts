import * as path from "node:path";
import { workspacePaths, type OopConfig } from "../config.js";
import { readDocument, writeDocument } from "./frontmatter.js";
import { UseCaseSchema } from "../domain/schemas.js";
import type { UseCase } from "../domain/model.js";
import { listMarkdown, pathExists } from "./workspace.js";
import { addToIndexList } from "./designIndex.js";

function fileFor(config: OopConfig, id: string): string {
  return path.join(workspacePaths(config).useCasesDir, `${id}.md`);
}

export async function upsertUseCase(
  config: OopConfig,
  useCase: UseCase,
  body?: string,
): Promise<{ path: string; created: boolean }> {
  const file = fileFor(config, useCase.id);
  const exists = await pathExists(file);
  await writeDocument(file, useCase, body ?? defaultBody(useCase));
  await addToIndexList(config, "use_cases", useCase.id);
  return { path: file, created: !exists };
}

export async function readUseCase(
  config: OopConfig,
  id: string,
): Promise<UseCase> {
  const doc = await readDocument(fileFor(config, id), UseCaseSchema);
  return doc.data;
}

export async function listUseCases(config: OopConfig): Promise<UseCase[]> {
  const files = await listMarkdown(workspacePaths(config).useCasesDir);
  const out: UseCase[] = [];
  for (const f of files) {
    const doc = await readDocument(f, UseCaseSchema);
    out.push(doc.data);
  }
  return out;
}

function defaultBody(uc: UseCase): string {
  return `# Use case: ${uc.title}

${uc.notes ?? "워크숍 노트, 엣지 케이스, 예시 등을 자유롭게 적어주세요."}
`;
}
