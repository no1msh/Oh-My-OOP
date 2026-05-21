export function toSlug(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[^a-zA-Z0-9가-힣\s_-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .toLowerCase();
}

export function classIdFromName(name: string): string {
  return toSlug(name);
}

const VERB_PARTICLES = /[()\[\]{}.,;:!?]/g;

export function collaborationId(from: string, message: string, to: string): string {
  const verb = toSlug(message.replace(VERB_PARTICLES, " ")).split("-")[0] || "msg";
  return `${toSlug(from)}__${verb}__${toSlug(to)}`;
}

export function snapshotFilename(label: string, when: Date = new Date()): string {
  const iso = when.toISOString().replace(/[:.]/g, "-").replace(/Z$/, "Z");
  return `${iso}__${toSlug(label) || "snapshot"}.mmd`;
}
