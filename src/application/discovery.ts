import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OOP_OPERATIONS } from "../oop/commands.js";

export const CapabilitiesInputSchema = z.object({}).strict();
export const DescribeInputSchema = z.object({
  command: z.enum(["oop", "system"]),
  operation: z.string().trim().min(1).max(80),
}).strict();

const mutating = new Set(["oop_init", "oop_use_case_add", "oop_assign_responsibility", "oop_class_upsert", "oop_collaboration_define", "oop_diagram_generate"]);
function operations() {
  return [
    ...Object.entries(OOP_OPERATIONS).map(([tool, definition]) => ({
      command: "oop", operation: tool.slice(4), tool, schema: definition.inputSchema,
      side_effect: mutating.has(tool) ? "local_write" : "none",
    })),
    { command: "system", operation: "capabilities", tool: "oop_capabilities", schema: CapabilitiesInputSchema, side_effect: "none" },
    { command: "system", operation: "describe", tool: "oop_describe", schema: DescribeInputSchema, side_effect: "none" },
  ];
}
function entry(op: ReturnType<typeof operations>[number]) {
  return { command: op.command, operation: op.operation,
    cli: { argv: ["oh-my-oop", op.command, op.operation, "--input", "-"] },
    mcp: { tool: op.tool, exposed: true, arguments: "input" }, side_effect: op.side_effect };
}
export function capabilities() {
  return {
    schema_version: 1, product: "oh-my-oop",
    model: { required: null, skill_required: false },
    interfaces: {
      skill: { installer: "skills", install: "npx skills add <source> --skill oh-my-oop", core_setup: "Build the OOP CLI separately; use oh-my-oop on PATH or an explicitly configured absolute CLI path.", invokes: "cli", mcp_required: false },
      mcp: { transport: "stdio", argv: ["oh-my-oop", "mcp"], skill_required: false },
    },
    operations: operations().map(entry),
    state: { durable: [".oop"], scope: "Same project root; no conversation or login transfer." },
    limits: [
      "Validates saved OOP design models, not implementation ASTs.",
      "Conformance returns a contract/checklist for host review, not an automated source verdict.",
      "No worker execution, architecture policies, JEV calls or automatic implementation.",
      "Findings are advice; input schemas are not authorization.",
    ],
  };
}
export function describeOperation(input: unknown) {
  const request = DescribeInputSchema.parse(input);
  const op = operations().find(x => x.command === request.command && x.operation === request.operation);
  if (!op) throw new Error("Unknown operation; use system capabilities");
  return { schema_version: 1, ...entry(op),
    input_schema: zodToJsonSchema(op.schema, { target: "jsonSchema7", $refStrategy: "none", effectStrategy: "input" }),
    validation: "Input shape only; runtime checks remain authoritative.",
  };
}
export function systemCommand(action: string, input: unknown) {
  if (action === "capabilities") { CapabilitiesInputSchema.parse(input); return capabilities(); }
  if (action === "describe") return describeOperation(input);
  throw new Error("Unknown system action; use capabilities or describe");
}
