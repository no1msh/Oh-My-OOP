import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolveConfig, workspacePaths } from "../config.js";
import { pathExists, readUtf8 } from "../io/workspace.js";
import { loadDesign } from "../io/design.js";
import { listHistory, readHistory } from "../io/history.js";
import { readClass, listClasses } from "../io/classStore.js";
import { readUseCase, listUseCases } from "../io/useCaseStore.js";

// 패키지 내부의 lessons/ 폴더 경로를 찾는다.
// dist/resources/index.js → ../../lessons
function packageLessonsDir(): string {
  const here = fileURLToPath(import.meta.url);
  const distRoot = path.resolve(path.dirname(here), "..", "..");
  return path.join(distRoot, "lessons");
}

export function registerAllResources(server: McpServer): void {
  server.registerResource(
    "design-index",
    "oop://design/index",
    {
      title: "Design Index",
      description: ".oop/design.md 원문",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const config = resolveConfig();
      const file = workspacePaths(config).designIndex;
      const text = (await pathExists(file)) ? await readUtf8(file) : "# (no design yet)";
      return {
        contents: [{ uri: uri.href, mimeType: "text/markdown", text }],
      };
    },
  );

  server.registerResource(
    "design-diagram",
    "oop://design/diagram",
    {
      title: "Current class diagram (Mermaid)",
      description: "현재 설계의 Mermaid 클래스 다이어그램",
      mimeType: "text/vnd.mermaid",
    },
    async (uri) => {
      const config = resolveConfig();
      const file = workspacePaths(config).currentDiagram;
      const text = (await pathExists(file)) ? await readUtf8(file) : "classDiagram\n";
      return { contents: [{ uri: uri.href, mimeType: "text/vnd.mermaid", text }] };
    },
  );

  server.registerResource(
    "design-classes",
    "oop://design/classes",
    {
      title: "All CRC cards (JSON)",
      description: "현재 모든 클래스 CRC 카드",
      mimeType: "application/json",
    },
    async (uri) => {
      const config = resolveConfig();
      const cards = await listClasses(config);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(cards, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "design-class",
    new ResourceTemplate("oop://design/classes/{id}", {
      list: async () => {
        const config = resolveConfig();
        const cards = await listClasses(config);
        return {
          resources: cards.map((c) => ({
            uri: `oop://design/classes/${c.id}`,
            name: c.name,
            mimeType: "text/markdown",
            description: `CRC card for ${c.name} (${c.stereotype})`,
          })),
        };
      },
    }),
    {
      title: "Class CRC card",
      description: "단일 CRC 카드의 frontmatter+본문",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const config = resolveConfig();
      const id = String(variables.id);
      const file = path.join(workspacePaths(config).classesDir, `${id}.md`);
      const text = (await pathExists(file)) ? await readUtf8(file) : `# (class ${id} not found)`;
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  server.registerResource(
    "design-use-cases",
    "oop://design/use-cases",
    {
      title: "All use cases (JSON)",
      description: "현재 모든 유스케이스",
      mimeType: "application/json",
    },
    async (uri) => {
      const config = resolveConfig();
      const ucs = await listUseCases(config);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(ucs, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "design-use-case",
    new ResourceTemplate("oop://design/use-cases/{id}", {
      list: async () => {
        const config = resolveConfig();
        const ucs = await listUseCases(config);
        return {
          resources: ucs.map((u) => ({
            uri: `oop://design/use-cases/${u.id}`,
            name: u.title,
            mimeType: "text/markdown",
            description: `Use case: ${u.title}`,
          })),
        };
      },
    }),
    {
      title: "Use case",
      description: "단일 유스케이스 frontmatter+본문",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const config = resolveConfig();
      const id = String(variables.id);
      const file = path.join(workspacePaths(config).useCasesDir, `${id}.md`);
      const text = (await pathExists(file)) ? await readUtf8(file) : `# (use case ${id} not found)`;
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  server.registerResource(
    "design-collaborations",
    "oop://design/collaborations",
    {
      title: "All collaborations (JSON)",
      description: "현재 모든 협력",
      mimeType: "application/json",
    },
    async (uri) => {
      const config = resolveConfig();
      const design = await loadDesign(config);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(design.collaborations, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "design-history",
    "oop://design/history",
    {
      title: "Diagram history",
      description: "스냅샷 목록",
      mimeType: "application/json",
    },
    async (uri) => {
      const config = resolveConfig();
      const list = await listHistory(config);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(list, null, 2),
          },
        ],
      };
    },
  );

  // ─────────────────────────────────────────────────────────────────────
  // Lessons resources — woowacourse/kotlin-racingcar 133 PR 리뷰 분석.
  // AI가 propose_alternatives / propose_responsibilities 시점에 인용할 수 있도록
  // 패키지 내부 lessons/ 폴더를 MCP resource로 노출한다.
  // ─────────────────────────────────────────────────────────────────────
  server.registerResource(
    "lessons-racingcar-summary",
    "oop://lessons/racingcar/summary",
    {
      title: "Racing Car 133 PR OOP 교훈 — TOP 10 + 명언 + 조영호 토픽 매핑",
      description:
        "우아한테크코스 kotlin-racingcar 미션의 133개 closed PR 리뷰에서 추출한 OOP 설계 교훈 총정리. 자주 하는 실수 TOP 10, 리뷰어 명언, 조영호 강의 토픽 매핑, 단계별 학습 곡선.",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const file = path.join(packageLessonsDir(), "woowacourse-racingcar", "SUMMARY.md");
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      const text = exists ? await fs.readFile(file, "utf8") : "# (lessons not bundled)";
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  server.registerResource(
    "lessons-racingcar-readme",
    "oop://lessons/racingcar/readme",
    {
      title: "Racing Car lessons — 입구 문서",
      description: "lessons/woowacourse-racingcar/README.md — 구조와 사용법.",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const file = path.join(packageLessonsDir(), "woowacourse-racingcar", "README.md");
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      const text = exists ? await fs.readFile(file, "utf8") : "# (lessons not bundled)";
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  server.registerResource(
    "lessons-racingcar-pr",
    new ResourceTemplate("oop://lessons/racingcar/{reviewee}/{file}", {
      list: async () => {
        const dir = path.join(packageLessonsDir(), "woowacourse-racingcar");
        const exists = await fs
          .access(dir)
          .then(() => true)
          .catch(() => false);
        if (!exists) return { resources: [] };
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const resources: Array<{
          uri: string;
          name: string;
          mimeType: string;
          description: string;
        }> = [];
        for (const ent of entries) {
          if (!ent.isDirectory()) continue;
          const subDir = path.join(dir, ent.name);
          const files = await fs.readdir(subDir);
          for (const f of files) {
            if (!f.endsWith(".md")) continue;
            resources.push({
              uri: `oop://lessons/racingcar/${ent.name}/${encodeURIComponent(f)}`,
              name: `${ent.name}/${f}`,
              mimeType: "text/markdown",
              description: `PR 리뷰 분석: ${ent.name} — ${f}`,
            });
          }
        }
        return { resources };
      },
    }),
    {
      title: "Racing Car PR 리뷰 분석 (개별 PR)",
      description: "특정 reviewee의 특정 PR 분석. 잘한 점/못한 점/리뷰어 인용/얻은 교훈.",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const reviewee = String(variables.reviewee);
      const file = decodeURIComponent(String(variables.file));
      const filePath = path.join(
        packageLessonsDir(),
        "woowacourse-racingcar",
        reviewee,
        file,
      );
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      const text = exists
        ? await fs.readFile(filePath, "utf8")
        : `# (lesson ${reviewee}/${file} not found)`;
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  server.registerResource(
    "style-guide",
    "oop://lessons/style-guide",
    {
      title: "OOP 스타일 가이드 — 133 PR에서 추출한 보편 원칙",
      description: "MCP 자동 검증으로 못 잡지만 워크숍에서 안내할 만한 설계 원칙 모음.",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const file = path.join(packageLessonsDir(), "STYLE_GUIDE.md");
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      const text = exists ? await fs.readFile(file, "utf8") : "# (style guide not bundled)";
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  server.registerResource(
    "design-history-file",
    new ResourceTemplate("oop://design/history/{file}", {
      list: async () => {
        const config = resolveConfig();
        const items = await listHistory(config);
        return {
          resources: items.map((h) => ({
            uri: `oop://design/history/${h.file}`,
            name: h.label,
            mimeType: "text/vnd.mermaid",
            description: `Snapshot ${h.created_at}`,
          })),
        };
      },
    }),
    {
      title: "Historical diagram snapshot",
      description: "특정 스냅샷의 Mermaid",
      mimeType: "text/vnd.mermaid",
    },
    async (uri, variables) => {
      const config = resolveConfig();
      const file = String(variables.file);
      const text = await readHistory(config, file).catch(() => "classDiagram\n");
      return { contents: [{ uri: uri.href, mimeType: "text/vnd.mermaid", text }] };
    },
  );
}

void readClass;
void readUseCase;
