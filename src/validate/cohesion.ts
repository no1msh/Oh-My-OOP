import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

const STOPWORDS = new Set([
  "을",
  "를",
  "이",
  "가",
  "은",
  "는",
  "에",
  "와",
  "과",
  "의",
  "한다",
  "안다",
  "한",
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "to",
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[()\[\]{}.,;:!?]/g, " ")
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1 && !STOPWORDS.has(t)),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / Math.min(a.size, b.size);
}

export function checkCohesion(
  design: Design,
  threshold: number,
): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    const knowingText = card.responsibilities.knowing.join(" ");
    const doingText = card.responsibilities.doing.join(" ");
    if (!knowingText || !doingText) continue;
    const score = overlap(tokens(knowingText), tokens(doingText));
    if (score >= threshold) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "low-cohesion",
        severity: "info",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}의 knowing과 doing 책임 간 어휘 중복도가 ${(score * 100).toFixed(0)}%로 낮아 ` +
          `책임들이 같은 클래스에 모인 근거가 약합니다.`,
        evidence: { overlap: score, threshold },
        remedies: [
          {
            label: "고립된 knowing을 별개 클래스로 분리",
            summary: "doing에서 사용되지 않는 knowing을 별개 InformationHolder로 옮긴다.",
            tradeoffs: {
              pros: ["응집도가 명확해진다", "각 클래스가 한 가지 이유로만 변경된다"],
              cons: ["클래스 수가 늘어난다"],
            },
          },
          {
            label: "doing 책임을 추가하여 knowing 사용처를 확보",
            summary: "knowing이 의도된 것이라면 그것을 활용하는 doing을 명시한다.",
            tradeoffs: {
              pros: ["기존 구조 유지", "도메인 의도가 코드로 드러남"],
              cons: ["의미 없는 책임을 억지로 만들 위험"],
            },
          },
          {
            label: "사용되지 않는 knowing을 제거",
            summary: "정말로 쓰이지 않는 데이터라면 삭제한다.",
            tradeoffs: {
              pros: ["YAGNI 위배 해소", "단순해짐"],
              cons: ["미래 요구를 잘못 추측한 경우 재추가 비용"],
            },
          },
        ],
      }),
    );
  }
  return out;
}
