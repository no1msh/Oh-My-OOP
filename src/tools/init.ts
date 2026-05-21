import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ensureWorkspace } from "../io/workspace.js";
import { createDefaultIndex } from "../io/designIndex.js";
import { atomicWriteFile } from "../io/workspace.js";
import { workspacePaths, resolveConfig, ensureProjectRootExists } from "../config.js";
import { jsonResult } from "../util/mcp.js";
import * as path from "node:path";

const inputShape = {
  project: z.string().optional(),
  force: z.boolean().default(false),
};

export function registerInit(server: McpServer): void {
  server.registerTool(
    "oop_init",
    {
      title: "Initialize .oop/ workspace",
      description:
        ".oop/ 디렉토리(use-cases/, classes/, collaborations/, diagrams/, history/)와 design.md를 초기화합니다.",
      inputSchema: inputShape,
    },
    async ({ project, force }) => {
      const config = resolveConfig();
      ensureProjectRootExists(config);
      const ws = await ensureWorkspace(config, { force });
      const project_name = project ?? path.basename(config.projectRoot);
      const index = await createDefaultIndex(config, project_name);

      const paths = workspacePaths(config);
      const emptyDiagram =
        "classDiagram\n" +
        "  %% 아직 클래스가 정의되지 않았습니다. oop_class_upsert로 시작하세요.\n";
      await atomicWriteFile(paths.currentDiagram, emptyDiagram);

      return jsonResult(
        {
          project_root: config.projectRoot,
          oop_dir: paths.root,
          created: ws.created,
          existed: ws.existed,
          index,
        },
        `워크스페이스를 ${paths.root}에 초기화했습니다.`,
      );
    },
  );
}
