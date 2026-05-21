import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsShape = {
  use_case_id: z.string(),
  n_alternatives: z.string().optional(),
};

export function registerDiscovery(server: McpServer): void {
  server.registerPrompt(
    "responsibility-discovery",
    {
      title: "Responsibility Discovery",
      description: "특정 유스케이스에서 책임을 도출하고 CRC 스케치를 N안으로 제시합니다.",
      argsSchema: argsShape,
    },
    ({ use_case_id, n_alternatives }) => {
      const n = n_alternatives ?? "3";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `# 책임 도출 워크숍 — \`${use_case_id}\``,
                ``,
                `다음 단계를 수행하세요:`,
                ``,
                `1. 리소스 \`oop://design/use-cases/${use_case_id}\`을 읽어 유스케이스 내용을 파악합니다.`,
                `2. 도구 \`oop_propose_responsibilities({ use_case_id: "${use_case_id}", n: ${n} })\`를 호출합니다.`,
                `3. 반환된 모든 대안을 사용자에게 보여줍니다. **단일 답을 추천하지 마세요.** 각각의 다음을 분명히 하세요:`,
                `   - 어떤 책임이 어디로 가는가 (\`assignments\`)`,
                `   - 장단점 (\`tradeoffs\`)`,
                `   - 어떤 상황에서 이 대안이 적합한가`,
                `4. 사용자가 하나를 선택하거나 혼합하면 \`oop_class_upsert\`와 \`oop_assign_responsibility\`로 반영합니다.`,
                `5. 반영 후 \`oop_diagram_generate\`로 현재 다이어그램을 보여주세요.`,
                ``,
                `**중요:** \`tradeoffs.pros\`/\`cons\`를 그대로 출력하지 말고, 이 도메인의 어휘로 다시 표현해주세요. 추상적 문장은 학습 가치가 떨어집니다.`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
