#!/usr/bin/env node
import { logErr } from "./util/log.js";
import { runCli } from "./cli.js";

async function main(): Promise<void> {
  if (await runCli(process.argv.slice(2))) return;
  // Standalone CLI callers do not initialize or load an MCP host/transport.
  const [{ createServer }, { StdioServerTransport }] = await Promise.all([
    import("./server.js"),
    import("@modelcontextprotocol/sdk/server/stdio.js"),
  ]);
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logErr("oh-my-oop ready on stdio");
}

main().catch((err) => {
  logErr("fatal:", err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
