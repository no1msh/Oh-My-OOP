import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRddIntro } from "./rddIntro.js";
import { registerDiscovery } from "./discovery.js";
import { registerReview } from "./review.js";
import { registerTellDontAskRephrase } from "./tellDontAskRephrase.js";
import { registerStateMachineIntrospect } from "./stateMachineIntrospect.js";
import { registerPhasePressureTest } from "./phasePressureTest.js";
import { registerImagineWithoutController } from "./imagineWithoutController.js";

export function registerAllPrompts(server: McpServer): void {
  registerRddIntro(server);
  registerDiscovery(server);
  registerReview(server);
  registerTellDontAskRephrase(server);
  registerStateMachineIntrospect(server);
  registerPhasePressureTest(server);
  registerImagineWithoutController(server);
}
