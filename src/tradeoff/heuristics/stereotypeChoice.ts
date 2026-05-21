import type { AlternativeSeed } from "../engine.js";
import { STEREOTYPES, STEREOTYPE_HINTS } from "../../domain/stereotypes.js";

export function stereotypeChoiceSeeds(targetName: string): AlternativeSeed[] {
  return STEREOTYPES.map((s) => {
    const hints = STEREOTYPE_HINTS[s];
    return {
      id: `stereotype-${s.toLowerCase()}`,
      label: s,
      summary: `${targetName}을 ${s}로 분류한다.`,
      design_delta: {},
      tradeoffs: {
        pros: hints.fits.map((f) => `적합: ${f}`),
        cons: hints.misfits.map((m) => `부적합 가능성: ${m}`),
      },
      cho_younghos_lens: {
        cohesion: "neutral" as const,
        coupling: "neutral" as const,
        testability: s === "ServiceProvider" || s === "InformationHolder" ? "improves" as const : "neutral" as const,
        notes: `${s}는 ${hints.fits[0] ?? "특정 상황"}에 가장 어울린다.`,
      },
    };
  });
}
