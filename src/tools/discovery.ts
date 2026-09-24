import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { capabilities, describeOperation, CapabilitiesInputSchema, DescribeInputSchema } from "../application/discovery.js";
import { errorResult, jsonResult } from "../util/mcp.js";

export function registerDiscovery(server: McpServer): void {
  const annotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
  server.registerTool("oop_capabilities", {
    title: "Discover OOP operations",
    description: "[USE WHEN] Inspect supported OOP CLI/MCP operations and limits. No writes or model calls.",
    inputSchema: CapabilitiesInputSchema, annotations,
  }, async () => jsonResult(capabilities()));
  server.registerTool("oop_describe", {
    title: "Describe an OOP operation",
    description: "[USE WHEN] Read the executable input schema for {command, operation}. Does not execute it.",
    inputSchema: DescribeInputSchema, annotations,
  }, async input => {
    try { return jsonResult(describeOperation(input)); }
    catch (error) { return errorResult((error as Error).message); }
  });
}
