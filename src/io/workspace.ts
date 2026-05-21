import * as fs from "node:fs/promises";
import * as path from "node:path";
import { type OopConfig, workspacePaths } from "../config.js";

export interface WorkspaceInitResult {
  created: string[];
  existed: string[];
}

export async function ensureWorkspace(
  config: OopConfig,
  options: { force?: boolean } = {},
): Promise<WorkspaceInitResult> {
  const paths = workspacePaths(config);
  const created: string[] = [];
  const existed: string[] = [];

  const dirs = [
    paths.root,
    paths.useCasesDir,
    paths.classesDir,
    paths.collaborationsDir,
    paths.diagramsDir,
    paths.historyDir,
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
      existed.push(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      created.push(dir);
    }
  }

  if (!options.force) {
    return { created, existed };
  }

  return { created, existed };
}

export async function workspaceExists(config: OopConfig): Promise<boolean> {
  try {
    await fs.access(workspacePaths(config).root);
    return true;
  } catch {
    return false;
  }
}

export async function atomicWriteFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, filePath);
}

export async function readUtf8(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

export async function listMarkdown(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((e) => e.endsWith(".md"))
      .map((e) => path.join(dir, e))
      .sort();
  } catch {
    return [];
  }
}

export async function listMermaid(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((e) => e.endsWith(".mmd"))
      .map((e) => path.join(dir, e))
      .sort();
  } catch {
    return [];
  }
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
