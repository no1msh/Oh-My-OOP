import type { OopConfig } from "../config.js";
import type { Design } from "../domain/model.js";
import { readDesignIndex } from "./designIndex.js";
import { listUseCases } from "./useCaseStore.js";
import { listClasses } from "./classStore.js";
import { listCollaborations } from "./collaborationStore.js";
import { deriveCollaborators } from "../domain/collaborators.js";

export async function loadDesign(config: OopConfig): Promise<Design> {
  const [index, use_cases, classes, collaborations] = await Promise.all([
    readDesignIndex(config),
    listUseCases(config),
    listClasses(config),
    listCollaborations(config),
  ]);
  // 단일 진실 출처: collaborators를 collaborations에서 파생해
  // 다이어그램(collaborations)과 검증 룰(collaborators)이 같은 의존 그래프를 보게 한다.
  return {
    index,
    use_cases,
    classes: deriveCollaborators(classes, collaborations),
    collaborations,
  };
}
