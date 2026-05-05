import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const pnpmCli = process.env.npm_execpath;

if (!pnpmCli) {
  throw new Error("This script must be started through pnpm so it can locate the pnpm CLI.");
}

const nodeDir = path.dirname(process.execPath);
const basePath = process.env.Path ?? process.env.PATH ?? "";

function withNodePath(extraEnv = {}) {
  return {
    ...process.env,
    PATH: `${nodeDir};${basePath}`,
    Path: `${nodeDir};${basePath}`,
    ...extraEnv,
  };
}

function start(command, args, options = {}) {
  return spawn(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
    ...options,
  });
}

const apiScript = path.join(repoRoot, "artifacts", "api-server", "dev.mjs");
const webArgs = [pnpmCli, "--dir", path.join(repoRoot, "artifacts", "gaming-store"), "run", "dev"];

const api = start(process.execPath, [apiScript], {
  env: withNodePath({ PORT: "3001" }),
});

const web = start(process.execPath, webArgs, {
  env: withNodePath({ PORT: "5173", VITE_API_TARGET: "http://127.0.0.1:3001" }),
});

const shutdown = (signal = "SIGTERM") => {
  api.kill(signal);
  web.kill(signal);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

api.on("exit", (code) => {
  if (code && code !== 0) {
    shutdown();
    process.exit(code);
  }
});

web.on("exit", (code) => {
  if (code && code !== 0) {
    shutdown();
    process.exit(code);
  }
});