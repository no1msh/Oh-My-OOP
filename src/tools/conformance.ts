import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CrcCard } from "../domain/model.js";
import { resolveConfig } from "../config.js";
import { loadDesign } from "../io/design.js";
import { STEREOTYPE_DESCRIPTIONS, STEREOTYPE_HINTS } from "../domain/stereotypes.js";
import { jsonResult, errorResult } from "../util/mcp.js";

// 적합성 검토는 코드의 *의미*를 판단해야 하므로 결정론으로 계산할 수 없다.
// 그래서 MCP는 코드를 파싱하지 않는다. 대신 저장된 설계를 *명세(contract)*로 꺼내고,
// 적대적 체크리스트 + 검토 지시를 반환한다. 실제 대조(코드 vs 명세)는 호출 모델이 한다.
// (MCP의 고유 자산 = 의도된 설계를 안다는 것. 일반 린터는 이 명세가 없다.)

export const CONFORMANCE_CHECKLIST: string[] = [
  "코드의 각 public 메서드/행위가 design의 책임(knowing/doing) 중 하나로 *추적*되는가? 추적되지 않으면 → 미설계 행위(undesigned-behavior).",
  "각 클래스가 자기 stereotype의 misfit을 코드에서 수행하는가? (예: InformationHolder가 표현 문자열 생성·I/O·흐름 조율) → stereotype-violation.",
  "design에 적힌 각 책임이 코드에 실제로 구현되어 있는가? 빠졌으면 → missing-responsibility.",
  "코드가 실제로 호출/생성하는 의존이 design의 collaborators와 일치하는가? design에 없는 의존 → undeclared-collaboration.",
  "특히 도메인 객체(InformationHolder/Structurer)가 자기 필드를 표시 문자열로 포맷(toString/getStatus류)하는가? → 표현 책임은 Interfacer로 옮긴다.",
];

export const CONFORMANCE_INSTRUCTION: string =
  "당신은 *설계 적합성(conformance)* 검토자다. 아래 design_contract가 **의도된 명세**다. " +
  "지금 대화 컨텍스트에 있는 **실제 코드**를 이 명세와 대조하라. " +
  "적대적으로 — 위반이 *있다고 가정*하고 찾는다. " +
  "발견한 각 이탈을 finding으로 보고하라: " +
  "{ category: 'undesigned-behavior' | 'stereotype-violation' | 'missing-responsibility' | 'undeclared-collaboration', " +
  "target(클래스/메서드), message(무엇이 왜 명세와 어긋나는지 — 이 도메인 어휘로), remedies(≥2개 대안, 각각 pros/cons) }. " +
  "remedies는 항상 2개 이상 — 단일 답을 주지 말 것(코드 통제권은 개발자에게). " +
  "이탈이 없으면 '명세 부합'으로 보고하고, 판단이 불확실하면 그 불확실성을 명시하라.";

export function buildDesignContract(classes: CrcCard[]) {
  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    stereotype: c.stereotype,
    stereotype_means: STEREOTYPE_DESCRIPTIONS[c.stereotype],
    fits: STEREOTYPE_HINTS[c.stereotype].fits,
    misfits: STEREOTYPE_HINTS[c.stereotype].misfits,
    designed_responsibilities: c.responsibilities,
    designed_collaborators: c.collaborators,
  }));
}

export function registerConformance(server: McpServer): void {
  server.registerTool(
    "oop_conformance_check",
    {
      title: "Review whether implementation conforms to the design (설계 적합성 검토)",
      description:
        "[USE WHEN] 사용자가 '설계대로 잘 짰는지 봐줘', '이 코드가 설계에 맞아?', '구현이 CRC/책임과 일치해?', '도메인에 표현 로직(getStatus 등) 섞이지 않았어?'를 묻거나, 설계 후 구현한 코드를 리뷰할 때. " +
        "저장된 .oop 설계를 *명세(contract)*로 꺼내고 적대적 체크리스트를 반환한다. 코드는 직접 파싱하지 않으며 — 호출 모델이 컨텍스트의 코드를 이 명세와 대조해 이탈(미설계 행위·stereotype 위반·미구현·미선언 협력)을 finding으로 보고한다. 모든 finding은 ≥2 remedy. 권고이며 차단하지 않음.",
      inputSchema: {
        class_ids: z.array(z.string()).optional(),
      },
    },
    async ({ class_ids }) => {
      const config = resolveConfig();
      try {
        const design = await loadDesign(config);
        const selected =
          class_ids && class_ids.length > 0
            ? design.classes.filter(
                (c) => class_ids.includes(c.id) || class_ids.includes(c.name),
              )
            : design.classes;
        if (selected.length === 0) {
          return errorResult(
            class_ids && class_ids.length > 0
              ? "지정한 class_ids에 해당하는 클래스가 없습니다."
              : "설계에 클래스가 없습니다. 먼저 oop_class_upsert로 CRC를 정의하세요.",
          );
        }
        return jsonResult({
          instruction: CONFORMANCE_INSTRUCTION,
          checklist: CONFORMANCE_CHECKLIST,
          design_contract: buildDesignContract(selected),
        });
      } catch (e) {
        return errorResult((e as Error).message);
      }
    },
  );
}
