export function logErr(...args: unknown[]): void {
  const msg = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ");
  process.stderr.write(`[oh-my-oop] ${msg}\n`);
}
