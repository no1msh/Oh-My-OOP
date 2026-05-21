import matter from "gray-matter";
import { z } from "zod";
import { readUtf8, atomicWriteFile } from "./workspace.js";

export interface Document<T> {
  data: T;
  body: string;
}

export async function readDocument<T>(
  filePath: string,
  schema: z.ZodType<T>,
): Promise<Document<T>> {
  const raw = await readUtf8(filePath);
  const parsed = matter(raw);
  const data = schema.parse(parsed.data);
  return { data, body: parsed.content.trimStart() };
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out;
  }
  return value;
}

export async function writeDocument<T>(
  filePath: string,
  data: T,
  body: string = "",
): Promise<void> {
  const cleaned = stripUndefined(data) as object;
  const yaml = matter.stringify(body.endsWith("\n") ? body : body + "\n", cleaned);
  await atomicWriteFile(filePath, yaml);
}

export function nowIso(): string {
  return new Date().toISOString();
}
