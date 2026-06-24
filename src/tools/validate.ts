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
      title: "Validate current OOP design (책임/결합도/테스터빌리티 권고)",
      description:
        "[USE WHEN] 사용자가 객체지향 설계를 '리뷰'/'검토'/'평가'해달라거나, '이거 좋은 설계인가', 'god object 같지 않아?', '결합도/응집도 어때', '테스트하기 어렵지 않을까', 'Tell-Don't-Ask 위배 아냐?'를 물을 때. " +
        "현재 .oop/ 설계를 20여 개 룰(god-object, mixed-stereotype, low-cohesion, too-many-collaborators, feature-envy, non-newable, side-effect-in-holder, mocking-pressure, cycle, orphan-class, dependency-direction, presentation-in-domain 등)로 검사. 모든 finding은 항상 ≥2개의 대안 remedies를 포함. 결과는 권고일 뿐 차단하지 않음 — 코드 통제권은 개발자에게.",
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
