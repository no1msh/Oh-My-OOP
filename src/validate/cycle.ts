import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

function detectCycles(adj: Map<string, Set<string>>): string[][] {
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const cycles: string[][] = [];

  function dfs(node: string): void {
    visited.add(node);
    stack.add(node);
    path.push(node);
    const neighbors = adj.get(node) ?? new Set();
    for (const n of neighbors) {
      if (stack.has(n)) {
        const idx = path.indexOf(n);
        if (idx >= 0) cycles.push(path.slice(idx).concat(n));
      } else if (!visited.has(n)) {
        dfs(n);
      }
    }
    stack.delete(node);
    path.pop();
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) dfs(node);
  }
  return dedupeCycles(cycles);
}

function dedupeCycles(cycles: string[][]): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const c of cycles) {
    const norm = canonicalCycle(c);
    const key = norm.join("->");
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

function canonicalCycle(c: string[]): string[] {
  const trimmed = c.slice(0, -1);
  if (trimmed.length === 0) return c;
  let minIdx = 0;
  for (let i = 1; i < trimmed.length; i++) {
    if (trimmed[i]! < trimmed[minIdx]!) minIdx = i;
  }
  return [...trimmed.slice(minIdx), ...trimmed.slice(0, minIdx), trimmed[minIdx]!];
}

export function checkCycles(design: Design): Finding[] {
  const adj = new Map<string, Set<string>>();
  for (const c of design.collaborations) {
    if (!adj.has(c.from)) adj.set(c.from, new Set());
    adj.get(c.from)!.add(c.to);
  }
  const cycles = detectCycles(adj);
  if (cycles.length === 0) return [];
  return [
    assertHasMultipleRemedies({
      rule_id: "cycle",
      severity: "error",
      target: { kind: "design", id: "graph" },
      message: `협력 그래프에 사이클이 ${cycles.length}개 있습니다.`,
      evidence: { cycles },
      remedies: [
        {
          label: "한쪽 의존을 인터페이스로 역전",
          summary:
            "사이클을 이루는 화살표 중 하나를 인터페이스로 바꾸고, 의존 방향을 뒤집는다 (DIP).",
          tradeoffs: {
            pros: ["사이클 제거", "테스트가 쉬워짐"],
            cons: ["인터페이스 추가로 코드 표면적 증가"],
          },
        },
        {
          label: "공통 추상으로 외부 추출",
          summary:
            "두 클래스가 공유하는 개념을 새 클래스로 뽑고, 둘 다 그 클래스에 의존하게 한다.",
          tradeoffs: {
            pros: ["사이클 제거", "도메인 개념이 1급으로 드러남"],
            cons: ["진짜 도메인 개념이 없다면 인위적인 추상"],
          },
        },
        {
          label: "두 클래스를 병합",
          summary: "실제로 한 개념이라면 합친다.",
          tradeoffs: {
            pros: ["관계 자체가 사라짐"],
            cons: ["응집도와 단일책임이 망가질 수 있음"],
          },
        },
      ],
    }),
  ];
}
