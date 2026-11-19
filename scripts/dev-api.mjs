import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const venvPython =
  process.platform === "win32"
    ? join(root, "apps", "api", ".venv", "Scripts", "python.exe")
    : join(root, "apps", "api", ".venv", "bin", "python");
const python = existsSync(venvPython) ? venvPython : "python";

const port = process.env.PORT || "4000";
const reload = process.env.UVICORN_RELOAD === "0" ? [] : ["--reload"];

const child = spawn(
  python,
  [
    "-m",
    "uvicorn",
    "app.main:app",
    "--app-dir",
    join(root, "apps", "api"),
    "--host",
    "127.0.0.1",
    "--port",
    port,
    ...reload,
  ],
  { stdio: "inherit", cwd: root, env: process.env },
);

child.on("exit", (code) => process.exit(code ?? 1));