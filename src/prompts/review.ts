import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsShape = {
  scope: z.enum(["all", "class"]).optional(),
  target_id: z.string().optional(),
};

export function registerReview(server: McpServer): void {
  server.registerPrompt(
    "design-review-cho-younghos-lens",
    {
      title: "Design Review (조영호 렌즈)",
      description: "현재 설계를 조영호님의 렌즈(Tell-Don't-Ask, new-ability, 사이드이펙트 격리, 응집/결합/테스터빌리티)로 리뷰합니다.",
      argsSchema: argsShape,
    },
    ({ scope, target_id }) => {
      const target = scope === "class" && target_id ? `\`${target_id}\` 클래스에 집중` : "전체 설계 대상";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `# 설계 리뷰 — 조영호 렌즈 (${target})`,
                ``,
                `다음 절차를 수행하세요:`,
                ``,
                `1. \`oop_design_validate\`를 호출하여 findings를 수집합니다.`,
                `2. 각 finding에 대해:`,
                `   - \`message\`와 \`evidence\`를 사용자에게 친절하게 설명합니다.`,
                `   - \`remedies\` 배열을 **모두** 제시합니다 (≥2개). 단일 해결책만 추천하지 마세요.`,
                `   - 다음 조영호 렌즈를 한 줄로 적용해 평가하세요:`,
                `     - **Tell-Don't-Ask**: 조회 메시지가 줄어드는가?`,
                `     - **new-ability**: 단위테스트에서 \`new\`로 생성 가능한가?`,
                `     - **사이드이펙트 격리**: 외부 자원 의존이 경계로 모이는가?`,
                `     - **응집/결합/테스터빌리티 변화**`,
                `3. 사용자가 특정 finding을 깊게 보고 싶다면 \`oop_propose_alternatives\`로 추가 대안을 받으세요.`,
                `4. 사용자가 변경을 결정하면, 변경 직전에 의미 있는 \`snapshot_label\`을 붙여 mutating 도구를 호출하세요.`,
                `5. 변경 후 \`oop_design_compare({ before: { kind: "history", file: <스냅샷> }, after: { kind: "current" } })\`로 Before/After를 보여주세요.`,
                ``,
                `**철칙:** 결정은 사용자에게 있고, 검증 결과는 항상 권고입니다. 차단하거나 강요하지 마세요. (조영호님: "코드 통제권은 개발자에게")`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
