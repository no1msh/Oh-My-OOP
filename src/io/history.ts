import * as path from "node:path";
import * as fs from "node:fs/promises";
import { workspacePaths, type OopConfig } from "../config.js";
import { atomicWriteFile, listMermaid, readUtf8 } from "./workspace.js";
import { snapshotFilename } from "../domain/ids.js";

export interface HistoryEntry {
  file: string;
  label: string;
  created_at: string;
  abs_path: string;
}

export async function snapshotMermaid(
  config: OopConfig,
  mermaid: string,
  label: string,
): Promise<HistoryEntry> {
  const now = new Date();
  const name = snapshotFilename(label, now);
  const abs = path.join(workspacePaths(config).historyDir, name);
  await atomicWriteFile(abs, mermaid);
  return {
    file: name,
    label,
    created_at: now.toISOString(),
    abs_path: abs,
  };
}

export async function listHistory(config: OopConfig): Promise<HistoryEntry[]> {
  const files = await listMermaid(workspacePaths(config).historyDir);
  const out: HistoryEntry[] = [];
  for (const abs of files) {
    const base = path.basename(abs);
    const stat = await fs.stat(abs);
    const label = base.replace(/^.*?__/, "").replace(/\.mmd$/, "");
    out.push({
      file: base,
      label,
      created_at: stat.mtime.toISOString(),
      abs_path: abs,
    });
  }
  return out;
}

export async function readHistory(
  config: OopConfig,
  fileName: string,
): Promise<string> {
  const abs = path.join(workspacePaths(config).historyDir, fileName);
  return readUtf8(abs);
}
