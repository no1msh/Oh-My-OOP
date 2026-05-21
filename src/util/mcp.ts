import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function jsonResult(data: unknown, text?: string): CallToolResult {
  const json = JSON.stringify(data, null, 2);
  const blocks: CallToolResult["content"] = [];
  if (text) blocks.push({ type: "text", text });
  blocks.push({ type: "text", text: "```json\n" + json + "\n```" });
  return { content: blocks, structuredContent: data as Record<string, unknown> };
}

export function textResult(text: string): CallToolResult {
  return { content: [{ type: "text", text }] };
}

export function errorResult(message: string): CallToolResult {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}
