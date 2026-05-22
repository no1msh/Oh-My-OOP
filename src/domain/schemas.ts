import { z } from "zod";
import { STEREOTYPES } from "./stereotypes.js";

export const StereotypeSchema = z.enum(STEREOTYPES);
export const ResponsibilityKindSchema = z.enum(["knowing", "doing"]);
export const CollaborationDirectionSchema = z.enum(["send", "query", "event"]);

export const CollaboratorRefSchema = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
});

export const CrcCardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stereotype: StereotypeSchema,
  responsibilities: z.object({
    knowing: z.array(z.string()),
    doing: z.array(z.string()),
  }),
  collaborators: z.array(CollaboratorRefSchema),
  provenance: z.object({
    derived_from_use_cases: z.array(z.string()),
    created_at: z.string(),
    updated_at: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export const UseCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  actor: z.string().min(1),
  preconditions: z.array(z.string()),
  main_flow: z.array(z.string()).min(1),
  postconditions: z.array(z.string()),
  related_classes: z.array(z.string()),
  notes: z.string().optional(),
});

export const CollaborationSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  message: z.string().min(1),
  direction: CollaborationDirectionSchema,
  multiplicity: z.string().optional(),
  rationale: z.string().optional(),
});

export const DesignIndexSchema = z.object({
  oop_version: z.number().int().positive(),
  project: z.string(),
  target_language: z.literal("kotlin"),
  updated_at: z.string(),
  use_cases: z.array(z.string()),
  classes: z.array(z.string()),
  collaborations: z.array(z.string()),
  current_diagram: z.string(),
  thresholds: z
    .object({
      god_object_responsibilities: z.number().int().positive().optional(),
      god_object_collaborators: z.number().int().positive().optional(),
      cohesion_min_overlap: z.number().min(0).max(1).optional(),
      too_many_collaborators: z.number().int().positive().optional(),
      mocking_pressure_max: z.number().int().nonnegative().optional(),
      data_duplication_overlap: z.number().min(0).max(1).optional(),
    })
    .partial()
    .optional(),
  notes: z.string().optional(),
});

export const TradeoffQuestionSchema = z.enum([
  "responsibility_split",
  "class_split",
  "collaboration_shape",
  "stereotype_choice",
  "free_form",
]);

export type TradeoffQuestion = z.infer<typeof TradeoffQuestionSchema>;
