import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsShape = {
  controller_class_or_name: z.string().optional(),
};

export function registerImagineWithoutController(server: McpServer): void {
  server.registerPrompt(
    "imagine-without-controller",
    {
      title: "Controller 없이 진행 가능한가",
      description:
        "Coordinator/Controller 가상 제거 시 도메인 자율성 점검. *자기 행동이 없는 명사*가 god-object 로 성장하는 것을 회피하는 사고 실험.",
      argsSchema: argsShape,
    },
    ({ controller_class_or_name }) => {
      const target = controller_class_or_name ?? "(Controller/Coordinator 미입력 — oop_class_list 등으로 식별)";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `# Controller 없이 진행 가능한가 — 사고 실험`,
                ``,
                `다음 Controller/Coordinator 클래스가 *사라진다*고 가정합니다:`,
                ``,
                `\`\`\``,
                target,
                `\`\`\``,
                ``,
                `## 진단 질문 (학생이 직접 답하도록)`,
                ``,
                `1. 이 클래스에 *자기 행동*과 *자기 데이터*가 있습니까? 둘 다 없다면 가상 객체일 가능성.`,
                `2. 이 클래스가 *없어도* 도메인 객체들이 *자가 진행* 가능합니까?`,
                `3. 현실에서 *같은 역할의 사람*이 따로 필요합니까? 아니면 *기존 사람*이 할 수 있습니까?`,
                `4. 이 클래스의 *각 메서드*는 *어느 도메인 객체*의 책임으로 옮길 수 있습니까?`,
                `5. 옮긴 후 *기존 도메인 객체*가 god-object 가 되지 않습니까?`,
                ``,
                `## 4안 비교 (학생 답변 후 함께 본다)`,
                ``,
                `### 0. 만들지 않는다 — Controller 유지 + 통증 관찰`,
                `- pros: 변경 비용 0. 외부와의 경계 책임이 명확.`,
                `- cons: Controller 가 god-object 로 성장할 위험. 도메인 객체들이 *데이터만 노출*하는 빈약 모델 위험.`,
                ``,
                `### A. Controller 완전 제거 — 책임을 *데이터 소유자*에게 모두 이전`,
                `- pros: 도메인 객체가 *자기 책임을 가짐*. Tell-Don't-Ask 충실. 가상 객체 회피.`,
                `- cons: *외부 시스템 경계* (input/output, persistence) 책임 위치 모호. 한 도메인 객체가 비대해질 위험.`,
                ``,
                `### B. Controller 는 *경계 어댑터만* — 도메인 로직은 *도메인이*`,
                `- pros: 입출력 / persistence 같은 *기술 경계*는 Controller, *도메인 결정*은 도메인. 책임이 *역할 별*로 분리.`,
                `- cons: Controller 가 *얇아 보이는* 불편 — 학생이 *Controller 가 일을 안 한다*고 느낄 수 있음.`,
                ``,
                `### C. Controller 책임을 *N개 작은 Coordinator* 로 분산`,
                `- pros: 각 흐름이 *명시적 Coordinator* 를 가짐 (예: GameProgress / ResultAggregation 등 분리).`,
                `- cons: 객체 수 증가. *Coordinator 자체가 god-object* 가 될 위험은 여전.`,
                ``,
                `## 가상 객체 회피 판정 기준`,
                ``,
                `다음 셋 중 하나라도 *Yes* 이면 가상 객체일 가능성 — 제거 후보:`,
                ``,
                `- 이 객체에 *자기 행동*이 없다 (다른 객체에게 *위임만* 한다)`,
                `- 현실에서 *없어도* 같은 결과가 나온다`,
                `- *같은 사람*이 할 수 있는 일을 *별도 사람*으로 분리하고 있다`,
                ``,
                `## 진행 원칙`,
                ``,
                `- 학생이 *Controller 가 정말 필요한가*를 먼저 자가 진단하게.`,
                `- *모든 Controller 가 가상 객체*는 아닙니다 — *경계 어댑터* 역할은 가치 있음.`,
                `- 제거 결정은 학생에게. 도구는 *질문*만 던집니다.`,
                ``,
                `**가르침**: 메타포는 *생각의 출발점*이지 *모델의 정답*이 아닙니다. 객체지향 세계의 객체는 *현실에 있는 것*이 아니라 *책임을 가진 것*입니다. *행동 없는 명사*는 거의 항상 god-object 의 시작입니다.`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
