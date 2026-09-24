---
name: oh-my-oop
description: Help design or review object responsibilities, CRC cards, collaborations and OOP/RDD alternatives using the Oh-My-OOP CLI. Use for object-oriented modeling and design-model checks, not whole-application architecture orchestration.
---

# Oh-My-OOP

Use the shared OOP core through the CLI; an MCP connection is not required.

Requires Node.js 18.17 or later, the built Oh-My-OOP CLI, and an agent allowed to read local files and execute commands. No model API key is required by the toolkit.

## Execution

Skill distribution is managed by `npx skills`; it installs these instructions, not the OOP executable. Use `oh-my-oop` on PATH, or `node "/absolute/Oh-My-OOP/dist/index.js"` when the user/project explicitly supplied that CLI path. Check `--version` before first use. If neither is available, ask the user to build/configure the CLI; do not silently download software or run `npx oh-my-oop`. Do not infer the executable location relative to this Skill: installation may copy or symlink only the Skill folder. There is no generated `runtime.json` dependency.

Always specify `--root "<target-project>"` for OOP operations. Do not confuse the toolkit directory with the user's project. The core stores design records in that project's `.oop/` directory. Installing this Skill does not initialize project state or authorize modifications.

Discover operations with `system capabilities`. Before an unfamiliar operation, obtain its executable input schema:

```sh
echo '{"command":"oop","operation":"class_upsert"}' | oh-my-oop system describe --input -
```

Run `oop <operation> --root "<target-project>" --input <json-file>`, or pass a JSON object on stdin using `--input -`. Do not put an `action` field in that JSON. JSON stdout is the result; stderr is diagnostics. Do not invoke the CLI without arguments: that starts an MCP server instead.

## Working with the user

- For an existing design, start with `oop state_read`. If no workspace exists, initialize with `oop init` only when the user wants to create/save a design. A conceptual explanation need not create files.
- For new modeling, clarify the use case and collaboration before assigning classes. Use `use_case_add`, `propose_responsibilities`, `class_upsert`, `assign_responsibility` and `collaboration_define` as needed, not as a mandatory checklist for every question.
- Use `propose_alternatives` to compare responsibility ownership or collaboration choices. Present multiple viable alternatives and concrete domain-specific tradeoffs; do not treat heuristic seeds as the single correct answer.
- Use `design_validate` to review the stored design model. Findings are advisory, not approval or implementation proof. Preserve the multiple remedies and explain when each fits.
- For implementation review, `conformance_check` returns a contract/checklist. Read authorized implementation evidence and compare it yourself. It does not parse Kotlin, verify all source, or prove behavior. Name missing evidence and ask contextual questions when intent cannot be inferred.
- `diagram_generate` writes by default; use `write_current:false` for preview. `design_compare` compares diagrams/history, not arbitrary source trees. Do not use `init force:true` to solve missing-context errors.

Retain user decisions and distinguish facts, assumptions and unresolved intent. Use “비즈니스 로직” in Korean. Do not reclassify a user's scoped decision without explaining changed evidence. Do not expand a design review into implementation or worker execution.

## Choosing the interface

If the user chose this Skill, use the CLI without asking to connect MCP. If the user explicitly chooses an already connected MCP interface instead, use its `oop_*` equivalents. Do not execute a state-changing operation through both interfaces. They share `.oop` data, but do not share chat history or provide concurrent-edit locking.
