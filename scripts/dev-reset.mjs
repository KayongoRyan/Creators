/**
 * Stop local Next dev servers (ports 3000–3003) and remove all .next* build dirs.
 * Run after cache corruption (Cannot find module './611.js', missing vendor-chunks).
 */
import { rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const ports = [3000, 3001, 3002, 3003];

function killPort(port) {
  if (process.platform === "win32") {
    const result = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `$c = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($p in $c) { if ($p -and $p -ne 0) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } }`,
      ],
      { stdio: "inherit" },
    );
    return result.status === 0;
  }
  spawnSync("sh", ["-c", `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`], {
    stdio: "inherit",
  });
  return true;
}

console.log("Stopping dev servers on ports", ports.join(", "), "…");
for (const port of ports) killPort(port);

const dirs = [".next", ".next-admin", ".next-brand", ".next-creator"];
for (const dir of dirs) {
  const path = join(root, dir);
  if (!existsSync(path)) continue;
  console.log("Removing", dir);
  if (process.platform === "win32") {
    spawnSync(
      "powershell",
      ["-NoProfile", "-Command", `Remove-Item -LiteralPath '${path.replace(/'/g, "''")}' -Recurse -Force -ErrorAction SilentlyContinue`],
      { stdio: "inherit" },
    );
  } else {
    rmSync(path, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

console.log("Done. Restart dev: npm run dev (:3000) and/or dev:admin|brand|creator (:3001–3003).");
