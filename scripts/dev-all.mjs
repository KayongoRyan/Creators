/**
 * One process group: FastAPI (:4000) + Next (:3000).
 * Usage: npm run dev:all
 * Portals-only extras: npm run dev:all -- --portals  (also admin:3001 brand:3002 creator:3003)
 */
import { spawn } from "node:child_process";

const wantPortals = process.argv.includes("--portals");

const children = [];

function start(label, command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });
  children.push(child);

  const tag = (chunk, stream) => {
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      if (!line) continue;
      stream.write(`[${label}] ${line}\n`);
    }
  };
  child.stdout.on("data", (c) => tag(c, process.stdout));
  child.stderr.on("data", (c) => tag(c, process.stderr));
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Starting API + Next…");
start("api", "npm", ["run", "dev:api"]);
start("web", "npx", ["next", "dev", "-p", "3000"]);

if (wantPortals) {
  console.log("Also starting role portals on 3001–3003…");
  start("admin", "npm", ["run", "dev:admin"]);
  start("brand", "npm", ["run", "dev:brand"]);
  start("creator", "npm", ["run", "dev:creator"]);
}

console.log(`
  API      http://127.0.0.1:4000/api/health
  App      http://localhost:3000
${wantPortals ? "  Admin    http://localhost:3001/admin\n  Brand    http://localhost:3002/brand\n  Creator  http://localhost:3003/creator\n" : "  (Tip: npm run dev:all -- --portals for admin/brand/creator on 3001–3003)\n"}`);
