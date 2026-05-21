#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { logErr } from "./util/log.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logErr("oh-my-oop ready on stdio");
}

main().catch((err) => {
  logErr("fatal:", err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
