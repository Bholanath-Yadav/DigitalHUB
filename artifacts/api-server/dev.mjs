import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const nodeDir = path.dirname(process.execPath);
const basePath = process.env.Path ?? process.env.PATH ?? "";

// Load .env file
const envVars = {};
try {
  const envContent = readFileSync(path.join(serverRoot, ".env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim();
      if (key) {
        envVars[key] = value;
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env file");
}

function withNodePath(extraEnv = {}) {
  return {
    ...process.env,
    NODE_ENV: "development",
    PATH: `${nodeDir};${basePath}`,
    Path: `${nodeDir};${basePath}`,
    ...envVars,            // Load from .env file
    ...extraEnv,           // Override with explicit values only
  };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: serverRoot,
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Process exited with signal ${signal}`));
        return;
      }
      if (code && code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      resolve(child);
    });
  });
}

const buildScript = path.join(serverRoot, "build.mjs");
const startScript = path.join(serverRoot, "dist", "index.mjs");

try {
  await run(process.execPath, [buildScript], { env: withNodePath({ PORT: process.env.PORT ?? "3001" }) });
  console.log("✓ Starting API server with env vars:", Object.keys(envVars).join(", "));
  const server = spawn(process.execPath, [startScript], {
    cwd: serverRoot,
    stdio: "inherit",
    shell: false,
    env: withNodePath({ PORT: process.env.PORT ?? "3001" }),
  });

  const shutdown = (signal = "SIGTERM") => server.kill(signal);
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  server.on("exit", (code) => {
    process.exit(code ?? 0);
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}