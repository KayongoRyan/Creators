import { spawn, spawnSync } from "node:child_process";

const role = process.argv[2] || "admin";
const route = process.argv[3] || "/admin";

/** Each role gets its own port + distDir so parallel dev servers do not corrupt .next */
const roleConfig = {
  admin: { port: 3001, distDir: ".next-admin", route: "/admin" },
  brand: { port: 3002, distDir: ".next-brand", route: "/brand" },
  creator: { port: 3003, distDir: ".next-creator", route: "/creator" },
};

const config = roleConfig[role] ?? roleConfig.admin;
const preferredPort = process.env.PORT ?? String(config.port);
const distDir = process.env.NEXT_DIST_DIR ?? config.distDir;
const openRoute = route || config.route;

function portOwners(p) {
  if (process.platform === "win32") {
    const r = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${p} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`,
      ],
      { encoding: "utf8" },
    );
    return (r.stdout || "")
      .split(/\s+/)
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  const r = spawnSync("sh", ["-c", `lsof -ti:${p} 2>/dev/null || true`], { encoding: "utf8" });
  return (r.stdout || "")
    .split(/\s+/)
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function isPortInUse(p) {
  return portOwners(p).length > 0;
}

/** First free port at or above preferred (scan up to +32). */
function resolvePort(preferred) {
  const base = Number(preferred);
  if (!Number.isFinite(base) || base < 1 || base > 65535) {
    console.error(`Invalid port: ${preferred}`);
    process.exit(1);
  }
  const max = Math.min(base + 32, 65535);
  for (let p = base; p <= max; p++) {
    if (!isPortInUse(p)) return String(p);
  }
  console.error(`No free port found between ${base} and ${max}. Try: npm run dev:reset`);
  process.exit(1);
}

const port = resolvePort(preferredPort);
if (port !== String(preferredPort)) {
  console.warn(`Port ${preferredPort} is in use — starting on http://localhost:${port} instead.`);
}

const child = spawn("npx", ["next", "dev", "-p", port], {
  env: {
    ...process.env,
    NEXT_PUBLIC_DEMO_ROLE: role,
    NEXT_DIST_DIR: distDir,
  },
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

let opened = false;

function handleOutput(chunk) {
  const text = chunk.toString();
  process.stdout.write(text);
  if (opened) return;

  const plain = text.replace(/\u001b\[[0-9;]*m/g, "");
  const match = plain.match(/Local:\s+(https?:\/\/\S+)/);
  if (!match) return;

  opened = true;
  const target = new URL(openRoute, match[1]).href;
  const command =
    process.platform === "win32"
      ? `start "" "${target}"`
      : process.platform === "darwin"
        ? `open "${target}"`
        : `xdg-open "${target}"`;

  spawn(command, { shell: true, detached: true, stdio: "ignore" }).unref();
}

child.stdout.on("data", handleOutput);
child.stderr.on("data", handleOutput);
child.on("exit", (code) => process.exit(code ?? 0));
