import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveConfig } from "../config.js";
import { loadDesign } from "../io/design.js";
import { validateDesign, summarize, ALL_RULE_IDS } from "../validate/rules.js";
import { jsonResult, errorResult } from "../util/mcp.js";

export function registerValidate(server: McpServer): void {
  server.registerTool(
    "oop_design_validate",
    {
      title: "Validate the current design (always advisory)",
      description:
        "현재 설계를 책임 적절성/결합도/테스터빌리티 등의 룰로 검사합니다. 모든 finding은 ≥2개의 대안 remedies를 포함합니다. 결과는 항상 권고이며 차단하지 않습니다.",
      inputSchema: {
        rules: z.array(z.enum(ALL_RULE_IDS)).optional(),
        severity_min: z.enum(["info", "warn", "error"]).default("info"),
      },
    },
    async ({ rules, severity_min }) => {
      const config = resolveConfig();
      try {
        const design = await loadDesign(config);
        const findings = validateDesign(design, {
          rules,
          severityMin: severity_min,
          thresholds: design.index.thresholds,
        });
        return jsonResult({
          findings,
          summary: summarize(findings),
        });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
