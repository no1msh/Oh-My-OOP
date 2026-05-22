import type { Design, CrcCard } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// "진실의 출처" 분산 검사.
// 두 카드의 knowing이 같은 도메인 개념을 공유하면 데이터 동기화 부담 발생.
// 예: Cars가 names를 갖는데 Race도 names를 따로 갖는 경우 (PR #128).

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
  "list",
  "리스트",
  "목록",
  "수",
  "값",
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

function jaccard(a: Set<string>, b: Set<string>): { score: number; shared: string[] } {
  if (a.size === 0 || b.size === 0) return { score: 0, shared: [] };
  const shared: string[] = [];
  for (const t of a) if (b.has(t)) shared.push(t);
  const union = new Set([...a, ...b]).size;
  return { score: shared.length / union, shared };
}

export function checkDataSourceDuplication(
  design: Design,
  threshold = 0.5,
): Finding[] {
  const out: Finding[] = [];

  // 두 카드가 협력자 관계 (직접 또는 collaborations 양방향)에 있는지
  const collabSet = new Set<string>();
  for (const c of design.collaborations) {
    collabSet.add(`${c.from}::${c.to}`);
    collabSet.add(`${c.to}::${c.from}`);
  }

  const cards = design.classes;
  const seen = new Set<string>();

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i]!;
      const b = cards[j]!;

      // 협력자 관계 있는지 확인 (없으면 데이터 중복 보유의 위험이 낮다)
      const aKnowsB = a.collaborators.some((c) => c.name === b.name);
      const bKnowsA = b.collaborators.some((c) => c.name === a.name);
      const linked = aKnowsB || bKnowsA || collabSet.has(`${a.id}::${b.id}`);
      if (!linked) continue;

      const aKnow = a.responsibilities.knowing.join(" ");
      const bKnow = b.responsibilities.knowing.join(" ");
      if (!aKnow || !bKnow) continue;

      const { score, shared } = jaccard(tokens(aKnow), tokens(bKnow));
      if (score < threshold) continue;
      if (shared.length < 2) continue;

      const key = `${a.id}+${b.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      out.push(
        assertHasMultipleRemedies({
          rule_id: "data-source-duplication",
          severity: "warn",
          target: { kind: "class", id: a.id },
          message:
            `${a.name}과(와) ${b.name}이(가) 같은 도메인 정보(${shared
              .slice(0, 3)
              .join(", ")})를 양쪽 knowing에 보유합니다. ` +
            `진실의 출처가 분산되어 한쪽이 변경되면 다른 쪽과 어긋날 위험이 있습니다.`,
          evidence: {
            paired_with: b.name,
            overlap: score,
            threshold,
            shared_tokens: shared,
            guideline:
              "@ghojeong (PR #128): \"같은 names를 두 클래스가 가지고 있는 의도가 궁금합니다.\"",
          },
          remedies: [
            {
              label: "한쪽이 소유자, 다른 쪽은 참조만 (Tell-Don't-Ask)",
              summary:
                `${a.name}과 ${b.name} 중 도메인적으로 더 자연스러운 소유자 한 곳에 ` +
                `데이터를 두고, 다른 쪽은 소유자에게 메시지를 보낸다.`,
              tradeoffs: {
                pros: [
                  "진실의 출처가 하나로 통일",
                  "변경 비용 = O(1)",
                ],
                cons: [
                  "소유자가 비대해질 수 있음 (god-object 주의)",
                ],
              },
            },
            {
              label: "별개 InformationHolder로 추출 후 둘 다 보유",
              summary:
                `공유된 개념(${shared
                  .slice(0, 3)
                  .join(", ")})을 별도 값 객체로 만들어 양쪽이 *동일 인스턴스*를 참조하도록 한다.`,
              tradeoffs: {
                pros: [
                  "도메인 개념이 1급으로 드러남",
                  "동치성/불변성을 한 곳에서 보장",
                ],
                cons: [
                  "객체 수 1개 추가",
                  "공유 인스턴스의 식별성을 호출 측이 의식해야 함",
                ],
              },
            },
            {
              label: "둘을 합쳐 한 클래스로",
              summary:
                `${a.name}과 ${b.name}이 같은 책임의 두 단면이라면 통합한다. ` +
                `(상위가 하위를 포함하는 관계가 자연스러운 경우)`,
              tradeoffs: {
                pros: [
                  "관리 대상 줄어듦",
                  "데이터 동기화 부담 0",
                ],
                cons: [
                  "통합 클래스가 god-object가 될 수 있음",
                  "두 책임이 진짜 별개라면 응집도 훼손",
                ],
              },
            },
          ],
        }),
      );
    }
  }
  return out;
}
