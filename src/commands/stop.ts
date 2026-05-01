import { Command } from "commander";
import chalk from "chalk";
import { ProcessManager } from "../lib/process-manager.js";

export const stopCommand = new Command("stop")
  .description("Stop the agentic-linear service and tunnel")
  .action(() => {
    const info = ProcessManager.read();

    if (!info) {
      console.log(chalk.yellow("⚠️ No service is currently running"));
      return;
    }

    let stopped = false;

    if (info.serverPid && ProcessManager.isRunning(info.serverPid)) {
      try {
        process.kill(info.serverPid, "SIGTERM");
        console.log(chalk.green(`✅ Stopped server (PID: ${info.serverPid})`));
        stopped = true;
      } catch {
        console.log(chalk.red(`❌ Failed to stop server (PID: ${info.serverPid})`));
      }
    }

    if (info.tunnelPid && ProcessManager.isRunning(info.tunnelPid)) {
      try {
        process.kill(info.tunnelPid, "SIGTERM");
        console.log(chalk.green(`✅ Stopped tunnel (PID: ${info.tunnelPid})`));
        stopped = true;
      } catch {
        console.log(chalk.red(`❌ Failed to stop tunnel (PID: ${info.tunnelPid})`));
      }
    }

    ProcessManager.clear();

    if (!stopped) {
      console.log(chalk.yellow("⚠️ No running processes found"));
    } else {
      console.log(chalk.blue("\n🛑 All services stopped"));
    }
  });