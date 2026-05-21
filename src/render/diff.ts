import type { RelationEdge } from "./mermaid.js";

export interface ParsedDiagram {
  classes: Set<string>;
  relations: RelationEdge[];
}

export interface DesignDiff {
  added_classes: string[];
  removed_classes: string[];
  kept_classes: string[];
  added_relations: RelationEdge[];
  removed_relations: RelationEdge[];
  changed_relations: Array<{
    from: string;
    to: string;
    before: string;
    after: string;
  }>;
  kept_relations: RelationEdge[];
}

const CLASS_LINE = /^\s*class\s+([A-Za-z_][\w]*)(?::::[a-z]+)?\s*$/;
const REL_LINE = /^\s*([A-Za-z_][\w]*)\s*-->\s*([A-Za-z_][\w]*)\s*:\s*(.+?)(?:\s*%%.*)?$/;

export function parseMermaid(mermaid: string): ParsedDiagram {
  const classes = new Set<string>();
  const relations: RelationEdge[] = [];
  for (const raw of mermaid.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("%%") || line.startsWith("classDef") || line === "classDiagram") {
      continue;
    }
    const m1 = CLASS_LINE.exec(line);
    if (m1) {
      classes.add(m1[1]!);
      continue;
    }
    const m2 = REL_LINE.exec(line);
    if (m2) {
      const from = m2[1]!;
      const to = m2[2]!;
      const message = m2[3]!.trim();
      classes.add(from);
      classes.add(to);
      relations.push({ from, to, message });
    }
  }
  return { classes, relations };
}

function edgeKey(r: RelationEdge): string {
  return `${r.from}->${r.to}`;
}

function edgeFullKey(r: RelationEdge): string {
  return `${r.from}->${r.to}::${r.message}`;
}

export function diffDiagrams(before: ParsedDiagram, after: ParsedDiagram): DesignDiff {
  const added_classes = [...after.classes].filter((c) => !before.classes.has(c)).sort();
  const removed_classes = [...before.classes].filter((c) => !after.classes.has(c)).sort();
  const kept_classes = [...after.classes].filter((c) => before.classes.has(c)).sort();

  const beforeMap = new Map<string, RelationEdge>();
  for (const r of before.relations) beforeMap.set(edgeKey(r), r);
  const afterMap = new Map<string, RelationEdge>();
  for (const r of after.relations) afterMap.set(edgeKey(r), r);

  const added_relations: RelationEdge[] = [];
  const removed_relations: RelationEdge[] = [];
  const changed_relations: DesignDiff["changed_relations"] = [];
  const kept_relations: RelationEdge[] = [];

  for (const [k, afterR] of afterMap) {
    const beforeR = beforeMap.get(k);
    if (!beforeR) {
      added_relations.push(afterR);
    } else if (beforeR.message !== afterR.message) {
      changed_relations.push({
        from: afterR.from,
        to: afterR.to,
        before: beforeR.message,
        after: afterR.message,
      });
    } else {
      kept_relations.push(afterR);
    }
  }
  for (const [k, beforeR] of beforeMap) {
    if (!afterMap.has(k)) removed_relations.push(beforeR);
  }

  const sortRel = (a: RelationEdge, b: RelationEdge) =>
    edgeFullKey(a).localeCompare(edgeFullKey(b));
  added_relations.sort(sortRel);
  removed_relations.sort(sortRel);
  kept_relations.sort(sortRel);
  changed_relations.sort((a, b) =>
    `${a.from}->${a.to}`.localeCompare(`${b.from}->${b.to}`),
  );

  return {
    added_classes,
    removed_classes,
    kept_classes,
    added_relations,
    removed_relations,
    changed_relations,
    kept_relations,
  };
}
