import * as path from "node:path";
import * as fs from "node:fs";

export interface OopConfig {
  projectRoot: string;
  oopDir: string;
}

export function resolveConfig(): OopConfig {
  const envRoot = process.env.OOP_PROJECT_ROOT;
  const projectRoot = envRoot
    ? path.resolve(envRoot)
    : process.cwd();
  return {
    projectRoot,
    oopDir: path.join(projectRoot, ".oop"),
  };
}

export function workspacePaths(config: OopConfig) {
  const root = config.oopDir;
  return {
    root,
    designIndex: path.join(root, "design.md"),
    useCasesDir: path.join(root, "use-cases"),
    classesDir: path.join(root, "classes"),
    collaborationsDir: path.join(root, "collaborations"),
    diagramsDir: path.join(root, "diagrams"),
    historyDir: path.join(root, "history"),
    currentDiagram: path.join(root, "diagrams", "current.mmd"),
  };
}

export function ensureProjectRootExists(config: OopConfig): void {
  if (!fs.existsSync(config.projectRoot)) {
    throw new Error(
      `OOP_PROJECT_ROOT does not exist: ${config.projectRoot}. ` +
        `Set OOP_PROJECT_ROOT or run from a real directory.`,
    );
  }
}
