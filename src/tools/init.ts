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
      title: "Initialize .oop/ workspace (RDD / OOP / 객체지향 / 설계 워크숍 시작)",
      description:
        "[USE WHEN] 사용자가 객체지향/OOP/설계/RDD/책임 주도 설계/CRC/클래스 다이어그램/책임 분배/Wirfs-Brock stereotype/응집도/결합도/테스터빌리티 등을 언급하고 새 도메인을 모델링하려 할 때 가장 먼저 호출. " +
        ".oop/ 디렉토리(use-cases/, classes/, collaborations/, diagrams/, history/)와 design.md를 초기화하여 RDD 워크숍 워크스페이스를 만든다. 코드 생성은 하지 않고 설계 모델링만 담당.",
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
