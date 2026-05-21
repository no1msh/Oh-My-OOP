import type { OopConfig } from "../config.js";
import type { Design } from "../domain/model.js";
import { readDesignIndex } from "./designIndex.js";
import { listUseCases } from "./useCaseStore.js";
import { listClasses } from "./classStore.js";
import { listCollaborations } from "./collaborationStore.js";

export async function loadDesign(config: OopConfig): Promise<Design> {
  const [index, use_cases, classes, collaborations] = await Promise.all([
    readDesignIndex(config),
    listUseCases(config),
    listClasses(config),
    listCollaborations(config),
  ]);
  return { index, use_cases, classes, collaborations };
}
