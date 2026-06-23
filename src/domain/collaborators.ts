import type { CrcCard, Collaboration, CollaboratorRef } from "./model.js";

// 단일 진실 출처(single source of truth):
// 의존 관계의 정본은 design.collaborations 다.
// 각 클래스의 collaborators 는 저장값을 신뢰하지 않고 collaborations 에서 *파생*한다.
// 이렇게 해야 다이어그램(collaborations 사용)과 검증 룰(collaborators 사용)이
// 항상 동일한 의존 그래프를 본다. (이전: 두 곳을 조건부·단방향으로 동기화 → 드리프트)
export function deriveCollaborators(
  classes: CrcCard[],
  collaborations: ReadonlyArray<Pick<Collaboration, "from" | "to" | "message">>,
): CrcCard[] {
  const idToName = new Map(classes.map((c) => [c.id, c.name] as const));
  const resolveName = (ref: string): string => idToName.get(ref) ?? ref;

  return classes.map((card) => {
    const seen = new Set<string>();
    const collaborators: CollaboratorRef[] = [];
    for (const col of collaborations) {
      // collaboration.from 이 이 카드(id 또는 name)와 일치하면 이 카드의 협력
      if (col.from !== card.id && col.from !== card.name) continue;
      const name = resolveName(col.to);
      const key = `${name}::${col.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      collaborators.push({ name, message: col.message });
    }
    return { ...card, collaborators };
  });
}
