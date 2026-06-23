import { type DesignDiff, parseMermaid } from "./diff.js";
import {
  type AnnotatedClass,
  type AnnotatedRelation,
  renderAnnotated,
} from "./mermaid.js";

export interface SideBySideResult {
  before_mermaid: string;
  after_mermaid: string;
  side_by_side_markdown: string;
  diff: DesignDiff;
}

export function annotateBefore(mermaid: string, diff: DesignDiff): string {
  const parsed = parseMermaid(mermaid);
  const removedClasses = new Set(diff.removed_classes);
  const classes: AnnotatedClass[] = [...parsed.classes]
    .sort()
    .map((name) => ({
      name,
      annotation: removedClasses.has(name) ? "removed" : "kept",
    }));

  const removedRelKey = (r: { from: string; to: string }) => `${r.from}->${r.to}`;
  const removedSet = new Set(diff.removed_relations.map(removedRelKey));
  const changedSet = new Set(diff.changed_relations.map(removedRelKey));

  const relations: AnnotatedRelation[] = parsed.relations
    .slice()
    .sort((a, b) => `${a.from}::${a.to}::${a.message}`.localeCompare(`${b.from}::${b.to}::${b.message}`))
    .map((r) => {
      const k = removedRelKey(r);
      if (removedSet.has(k)) return { ...r, annotation: "removed" as const };
      if (changedSet.has(k)) return { ...r, annotation: "changed" as const };
      return { ...r, annotation: "kept" as const };
    });

  return renderAnnotated({ classes, relations });
}

export function annotateAfter(mermaid: string, diff: DesignDiff): string {
  const parsed = parseMermaid(mermaid);
  const addedClasses = new Set(diff.added_classes);
  const classes: AnnotatedClass[] = [...parsed.classes]
    .sort()
    .map((name) => ({
      name,
      annotation: addedClasses.has(name) ? "added" : "kept",
    }));

  const relKey = (r: { from: string; to: string }) => `${r.from}->${r.to}`;
  const addedSet = new Set(diff.added_relations.map(relKey));
  const changedSet = new Set(diff.changed_relations.map(relKey));

  const relations: AnnotatedRelation[] = parsed.relations
    .slice()
    .sort((a, b) => `${a.from}::${a.to}::${a.message}`.localeCompare(`${b.from}::${b.to}::${b.message}`))
    .map((r) => {
      const k = relKey(r);
      if (addedSet.has(k)) return { ...r, annotation: "added" as const };
      if (changedSet.has(k)) return { ...r, annotation: "changed" as const };
      return { ...r, annotation: "kept" as const };
    });

  return renderAnnotated({ classes, relations });
}

const LEGEND = `**범례:** 추가 (added) · 제거 (removed) · 변경 (changed) · 유지 (kept)\n` +
  `클래스는 \`<<added>>/<<removed>>/<<changed>>\` 주석으로, 관계는 화살표 라벨 뒤 \`[added]/[removed]/[changed]\`로 표기합니다. (구버전 Mermaid 호환을 위해 classDef 색상은 쓰지 않습니다.)\n`;

export function buildSideBySide(
  beforeMermaid: string,
  afterMermaid: string,
  diff: DesignDiff,
  labels: { before: string; after: string } = { before: "Before", after: "After" },
): SideBySideResult {
  const before_mermaid = annotateBefore(beforeMermaid, diff);
  const after_mermaid = annotateAfter(afterMermaid, diff);

  const summary = renderDiffSummary(diff);

  const md =
    `${LEGEND}\n` +
    `## ${labels.before}\n\n` +
    "```mermaid\n" +
    before_mermaid +
    "```\n\n" +
    `## ${labels.after}\n\n` +
    "```mermaid\n" +
    after_mermaid +
    "```\n\n" +
    `## 변경 요약\n\n${summary}\n`;

  return {
    before_mermaid,
    after_mermaid,
    side_by_side_markdown: md,
    diff,
  };
}

export function renderDiffSummary(diff: DesignDiff): string {
  const lines: string[] = [];
  const fmtRel = (r: { from: string; to: string; message: string }) =>
    `\`${r.from} --> ${r.to} : ${r.message}\``;

  lines.push(
    `- **추가된 클래스 (${diff.added_classes.length}):** ${
      diff.added_classes.length ? diff.added_classes.map((c) => `\`${c}\``).join(", ") : "(없음)"
    }`,
  );
  lines.push(
    `- **제거된 클래스 (${diff.removed_classes.length}):** ${
      diff.removed_classes.length ? diff.removed_classes.map((c) => `\`${c}\``).join(", ") : "(없음)"
    }`,
  );
  lines.push(
    `- **추가된 관계 (${diff.added_relations.length}):** ${
      diff.added_relations.length ? diff.added_relations.map(fmtRel).join(", ") : "(없음)"
    }`,
  );
  lines.push(
    `- **제거된 관계 (${diff.removed_relations.length}):** ${
      diff.removed_relations.length ? diff.removed_relations.map(fmtRel).join(", ") : "(없음)"
    }`,
  );
  if (diff.changed_relations.length) {
    lines.push(
      `- **메시지가 변경된 관계 (${diff.changed_relations.length}):** ` +
        diff.changed_relations
          .map((c) => `\`${c.from} --> ${c.to}\` (\`${c.before}\` → \`${c.after}\`)`)
          .join(", "),
    );
  }
  return lines.join("\n");
}
