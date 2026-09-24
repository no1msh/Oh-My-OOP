import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { resolveConfig } from "../config.js";
import { OOP_OPERATIONS, type OopOperationName } from "../oop/commands.js";
import { errorResult, jsonResult } from "../util/mcp.js";

// These legacy handlers let the SDK format failures without the custom "Error: " prefix.
const sdkManagedErrors = new Set<OopOperationName>([
  "oop_init", "oop_use_case_add", "oop_use_case_list", "oop_class_list",
]);

/** MCP presentation and environment resolution stay outside the OOP application. */
export function registerOopOperation(
  server: McpServer,
  name: OopOperationName,
  metadata: { title: string; description: string; outputSchema?: z.ZodRawShape },
): void {
  const operation = OOP_OPERATIONS[name];
  server.registerTool(name, {
    ...metadata,
    inputSchema: operation.inputSchema.shape,
  }, async (args: Record<string, unknown>) => {
    try {
      const result = await operation.execute(resolveConfig(), args);
      return jsonResult(result.data, result.text);
    } catch (error) {
      if (sdkManagedErrors.has(name)) throw error;
      return errorResult((error as Error).message);
    }
  });
}
