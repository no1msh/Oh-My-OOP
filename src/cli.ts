import * as fs from "node:fs/promises";
import * as path from "node:path";
import { parseArgs } from "node:util";
import { resolveConfig } from "./config.js";
import { oopCommand } from "./oop/commands.js";
import { systemCommand } from "./application/discovery.js";

const HELP = `Oh-My-OOP 0.2.0
No arguments / mcp                  Start MCP stdio
oop <action> --input FILE           OOP operation without oop_ prefix
system capabilities                List operations
system describe --input FILE       Schema for {command, operation}
--root PATH                        Override OOP_PROJECT_ROOT / cwd
--input -                          Read JSON object from stdin (max 2 MB)
OOP validation is advisory. No model calls, app builds or worker execution.
Architecture/semantic/task commands were extracted into a separate migration archive.
Skill distribution: npx skills add <source> --skill oh-my-oop
Install/build the OOP CLI separately; Skill installation does not install the core.
`;

async function inputJson(file?: string): Promise<Record<string, unknown>> {
  if (!file) return {};
  let source: string;
  if (file === "-") {
    const parts: Buffer[] = [];
    let bytes = 0;
    for await (const part of process.stdin) {
      const buffer = Buffer.from(part);
      bytes += buffer.length;
      if (bytes > 2_000_000) throw new Error("JSON input exceeds 2 MB");
      parts.push(buffer);
    }
    source = Buffer.concat(parts).toString("utf8");
  } else {
    if ((await fs.stat(file)).size > 2_000_000) throw new Error("JSON input exceeds 2 MB");
    source = await fs.readFile(file, "utf8");
  }
  const input = JSON.parse(source) as unknown;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object");
  if ("action" in input) throw new Error("Specify the action as a CLI argument, not inside input JSON");
  return input as Record<string, unknown>;
}


/** CLI uses the same core as MCP without loading the SDK. */
export async function runCli(argv: string[]): Promise<boolean> {
  const {values, positionals} = parseArgs({
    args: argv, allowPositionals: true, strict: true,
    options: {root: {type: "string"}, input: {type: "string"}, help: {type: "boolean", short: "h"}, version: {type: "boolean", short: "v"}},
  });
  if (values.help) { process.stdout.write(HELP); return true; }
  if (values.version) { process.stdout.write("oh-my-oop 0.2.0\n"); return true; }
  if (!positionals.length || (positionals.length === 1 && positionals[0] === "mcp")) {
    if (values.root || values.input) throw new Error("Use OOP_PROJECT_ROOT for MCP mode");
    return false;
  }
  const [kind, action] = positionals;
  if (kind === "skill" && action === "install" && positionals.length === 2) {
    throw new Error("The built-in Skill installer was removed. Use npx skills add <source> --skill oh-my-oop; prepare the OOP CLI separately. See README.md.");
  }
  if (!action || positionals.length !== 2 || !["oop", "system"].includes(kind!)) throw new Error("Unknown command; see --help");
  const projectRoot = values.root ? path.resolve(values.root) : resolveConfig().projectRoot;
  const input = await inputJson(values.input);
  const output = kind === "oop"
    ? await oopCommand({projectRoot, oopDir: path.join(projectRoot, ".oop")}, {...input, action: `oop_${action}`})
    : systemCommand(action, input);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  return true;
}
