import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as path from "node:path";
import { resolveConfig, workspacePaths } from "../config.js";
import { pathExists, readUtf8 } from "../io/workspace.js";
import { loadDesign } from "../io/design.js";
import { listHistory, readHistory } from "../io/history.js";
import { readClass, listClasses } from "../io/classStore.js";
import { readUseCase, listUseCases } from "../io/useCaseStore.js";

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
