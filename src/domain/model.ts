import type { Stereotype } from "./stereotypes.js";

export type ResponsibilityKind = "knowing" | "doing";

export interface Responsibility {
  kind: ResponsibilityKind;
  text: string;
}

export interface CollaboratorRef {
  name: string;
  message: string;
}

export interface CrcCard {
  id: string;
  name: string;
  stereotype: Stereotype;
  responsibilities: {
    knowing: string[];
    doing: string[];
  };
  collaborators: CollaboratorRef[];
  provenance: {
    derived_from_use_cases: string[];
    created_at: string;
    updated_at?: string;
  };
  notes?: string;
}

export interface UseCase {
  id: string;
  title: string;
  actor: string;
  preconditions: string[];
  main_flow: string[];
  postconditions: string[];
  related_classes: string[];
  notes?: string;
}

export type CollaborationDirection = "send" | "query" | "event";

export interface Collaboration {
  id: string;
  from: string;
  to: string;
  message: string;
  direction: CollaborationDirection;
  multiplicity?: string;
  rationale?: string;
}

export interface DesignIndex {
  oop_version: number;
  project: string;
  target_language: "kotlin";
  updated_at: string;
  use_cases: string[];
  classes: string[];
  collaborations: string[];
  current_diagram: string;
  thresholds?: Partial<{
    god_object_responsibilities: number;
    god_object_collaborators: number;
    cohesion_min_overlap: number;
    too_many_collaborators: number;
    mocking_pressure_max: number;
  }>;
  notes?: string;
}

export interface Design {
  index: DesignIndex;
  use_cases: UseCase[];
  classes: CrcCard[];
  collaborations: Collaboration[];
}
