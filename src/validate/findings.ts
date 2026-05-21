export type Severity = "info" | "warn" | "error";

export interface Remedy {
  label: string;
  summary: string;
  tradeoffs: { pros: string[]; cons: string[] };
}

export interface Finding {
  rule_id: string;
  severity: Severity;
  target: { kind: "class" | "collaboration" | "design"; id: string };
  message: string;
  evidence: Record<string, unknown>;
  remedies: Remedy[];
}

const SEVERITY_RANK: Record<Severity, number> = { info: 0, warn: 1, error: 2 };

export function severityAtLeast(s: Severity, min: Severity): boolean {
  return SEVERITY_RANK[s] >= SEVERITY_RANK[min];
}

export function assertHasMultipleRemedies(f: Finding): Finding {
  if (f.remedies.length < 2) {
    throw new Error(
      `Rule ${f.rule_id} produced a finding with fewer than 2 remedies. ` +
        `Oh-My-OOP contract: every finding must offer at least 2 alternative remedies.`,
    );
  }
  return f;
}
