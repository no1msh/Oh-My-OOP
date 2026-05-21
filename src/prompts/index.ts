import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRddIntro } from "./rddIntro.js";
import { registerDiscovery } from "./discovery.js";
import { registerReview } from "./review.js";

export function registerAllPrompts(server: McpServer): void {
  registerRddIntro(server);
  registerDiscovery(server);
  registerReview(server);
}
