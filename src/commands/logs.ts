import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import { spawn, execSync } from "child_process";

export const logsCommand = new Command("logs")
  .description("View service logs")
  .option("-f, --follow", "Follow log output (tail -f)", false)
  .option("-n, --lines <lines>", "Number of lines to show", "50")
  .action((options) => {
    const logFile = "/tmp/agentic-linear.log";

    if (!fs.existsSync(logFile)) {
      console.log(chalk.yellow("⚠️ No log file found at /tmp/agentic-linear.log"));
      return;
    }

    const lines = parseInt(options.lines, 10);

    if (options.follow) {
      console.log(chalk.blue(`📄 Following logs (Ctrl+C to exit)...\n`));
      const tail = spawn("tail", ["-f", "-n", String(lines), logFile], {
        stdio: "inherit",
      });
      tail.on("exit", () => process.exit(0));
    } else {
      console.log(chalk.blue(`📄 Last ${lines} lines of logs:\n`));
      const output = execSync(`tail -n ${lines} ${logFile}`, { encoding: "utf-8" });
      console.log(output);
    }
  });