import type { CrcCard, Collaboration } from "../domain/model.js";

export interface DiagramInput {
  classes: CrcCard[];
  collaborations: Collaboration[];
}

export interface RelationEdge {
  from: string;
  to: string;
  message: string;
}

export type EdgeAnnotation = "added" | "removed" | "changed" | "kept";

export interface AnnotatedClass {
  name: string;
  annotation?: EdgeAnnotation;
}

export interface AnnotatedRelation extends RelationEdge {
  annotation?: EdgeAnnotation;
}

// Mermaid의 classDiagram은 classDef/:::를 v10+에서만 지원한다.
// GitHub·Notion·다수 IDE 뷰어는 v9 이하라, classDef가 한 줄이라도 들어가면
// 다이어그램 전체가 "Parse error"로 죽는다(실측: 9.4.0에서 line 2 파싱 실패).
// → 보편 호환을 위해 classDef/:::를 쓰지 않고, 모든 버전이 지원하는
//   <<annotation>> 블록(클래스)과 라벨 접미사(관계)로 diff 상태를 표기한다.
const HEADER_LINES = ["classDiagram"];

function classDeclLine(c: AnnotatedClass): string {
  if (c.annotation && c.annotation !== "kept") {
    // <<...>> 주석은 모든 Mermaid 버전이 지원 (classDef 색상 대체)
    return `  class ${c.name} {\n    <<${c.annotation}>>\n  }`;
  }
  return `  class ${c.name}`;
}

function relationLine(r: AnnotatedRelation): string {
  // 줄 끝 %% 주석은 일부 뷰어에서 라벨로 오파싱된다 → 라벨 접미사로 상태 표기.
  const suffix =
    r.annotation && r.annotation !== "kept" ? ` [${r.annotation}]` : "";
  return `  ${r.from} --> ${r.to} : ${r.message}${suffix}`;
}

export function buildRelations(input: DiagramInput): RelationEdge[] {
  const idToName = new Map(input.classes.map((c) => [c.id, c.name] as const));
  const seen = new Set<string>();
  const edges: RelationEdge[] = [];
  for (const c of input.collaborations) {
    const from = idToName.get(c.from) ?? c.from;
    const to = idToName.get(c.to) ?? c.to;
    const key = `${from}::${to}::${c.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ from, to, message: c.message });
  }
  return edges.sort((a, b) =>
    a.from === b.from
      ? a.to === b.to
        ? a.message.localeCompare(b.message)
        : a.to.localeCompare(b.to)
      : a.from.localeCompare(b.from),
  );
}

export function renderClassDiagram(input: DiagramInput): string {
  const classes: AnnotatedClass[] = input.classes
    .map((c) => ({ name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const relations: AnnotatedRelation[] = buildRelations(input);
  return renderAnnotated({ classes, relations });
}

export function renderAnnotated(input: {
  classes: AnnotatedClass[];
  relations: AnnotatedRelation[];
}): string {
  const lines = [...HEADER_LINES];
  for (const c of input.classes) lines.push(classDeclLine(c));
  for (const r of input.relations) lines.push(relationLine(r));
  return lines.join("\n") + "\n";
}
