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

const HEADER_LINES = [
  "classDiagram",
  "  classDef added   fill:#d4f4dd,stroke:#1a7f37,stroke-width:2px",
  "  classDef removed fill:#ffd7d5,stroke:#cf222e,stroke-width:2px,stroke-dasharray:4 2",
  "  classDef changed fill:#fff8c5,stroke:#9a6700,stroke-width:2px",
  "  classDef kept    fill:#f6f8fa,stroke:#8c959f",
];

function classDeclLine(c: AnnotatedClass): string {
  const ann = c.annotation && c.annotation !== "kept" ? `:::${c.annotation}` : "";
  return `  class ${c.name}${ann}`;
}

function relationLine(r: AnnotatedRelation): string {
  const trail =
    r.annotation === "added" || r.annotation === "removed" || r.annotation === "changed"
      ? `    %% ${r.annotation}`
      : "";
  return `  ${r.from} --> ${r.to} : ${r.message}${trail}`;
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
