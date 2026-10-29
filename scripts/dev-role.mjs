import { spawn } from "node:child_process";

const role = process.argv[2] || "admin";
const route = process.argv[3] || "/admin";

const child = spawn("npx", ["next", "dev"], {
  env: { ...process.env, NEXT_PUBLIC_DEMO_ROLE: role },
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
  const target = new URL(route, match[1]).href;
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
