import { Command } from "commander";
import chalk from "chalk";
import { execSync } from "child_process";
import path from "path";
import { ProcessManager } from "../lib/process-manager.js";

export const restartCommand = new Command("restart")
  .description("Restart the agentic-linear service")
  .option("-p, --port <port>", "Port to run on", "3001")
  .option("-t, --token <token>", "Linear API token (or set LINEAR_TOKEN env)")
  .action(async (options) => {
    const info = ProcessManager.read();
    const port = parseInt(options.port, 10);
    const linearToken = options.token || process.env.LINEAR_TOKEN;

    if (info?.serverPid && ProcessManager.isRunning(info.serverPid)) {
      console.log(chalk.blue("🔄 Stopping existing service..."));
      try {
        process.kill(info.serverPid, "SIGTERM");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(chalk.green("✅ Service stopped"));
      } catch {
        console.log(chalk.yellow("⚠️ Could not stop existing service gracefully"));
      }
    }

    if (info?.tunnelPid && ProcessManager.isRunning(info.tunnelPid)) {
      try {
        process.kill(info.tunnelPid, "SIGTERM");
      } catch {
        console.log(chalk.yellow("⚠️ Could not stop existing tunnel"));
      }
    }

    ProcessManager.clear();

    console.log(chalk.blue(`🚀 Starting service on port ${port}...`));

    const cliPath = path.join(process.cwd(), "dist", "cli.js");

    try {
      execSync(`node "${cliPath}" serve --port ${port}${linearToken ? ` --token ${linearToken}` : ""}`, {
        stdio: "inherit",
        env: process.env,
      });
    } catch {
      console.log(chalk.red("❌ Service exited"));
    }
  });