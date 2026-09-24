// A CLI-only host must not load the MCP server or SDK as a side effect.
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@modelcontextprotocol/")) {
    throw new Error("An MCP dependency was loaded in the standalone CLI");
  }
  return nextResolve(specifier, context);
}
