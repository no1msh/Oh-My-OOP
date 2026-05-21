import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerInit } from "./init.js";
import { registerUseCases } from "./useCases.js";
import { registerResponsibilities } from "./responsibilities.js";
import { registerClasses } from "./classes.js";
import { registerCollaborations } from "./collaborations.js";
import { registerAlternatives } from "./alternatives.js";
import { registerDiagram } from "./diagram.js";
import { registerCompare } from "./compare.js";
import { registerValidate } from "./validate.js";
import { registerState } from "./state.js";

export function registerAllTools(server: McpServer): void {
  registerInit(server);
  registerUseCases(server);
  registerResponsibilities(server);
  registerClasses(server);
  registerCollaborations(server);
  registerAlternatives(server);
  registerDiagram(server);
  registerCompare(server);
  registerValidate(server);
  registerState(server);
}
