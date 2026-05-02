import { Command } from "commander";
import chalk from "chalk";
import { ProcessManager } from "../lib/process-manager.js";
export const statusCommand = new Command("status")
    .description("Check the status of the agentic-linear service")
    .action(() => {
    const info = ProcessManager.read();
    if (!info) {
        console.log(chalk.yellow("⚠️ No service running"));
        console.log(chalk.gray("   Start with: agentic-linear serve"));
        return;
    }
    const serverRunning = info.serverPid && ProcessManager.isRunning(info.serverPid);
    console.log(chalk.blue("📊 Agentic Linear Status\n"));
    if (serverRunning) {
        console.log(chalk.green("● Server: Running"));
        console.log(chalk.gray(`   Port: ${info.port}`));
        console.log(chalk.gray(`   PID: ${info.serverPid}`));
    }
    else {
        console.log(chalk.red("● Server: Stopped"));
    }
    if (info.tunnelPid && ProcessManager.isRunning(info.tunnelPid)) {
        console.log(chalk.green("● Tunnel: Running"));
        console.log(chalk.gray(`   URL: ${info.tunnelUrl || "Unknown"}`));
        console.log(chalk.gray(`   PID: ${info.tunnelPid}`));
    }
    else if (info.tunnelPid) {
        console.log(chalk.red("● Tunnel: Stopped"));
    }
    if (info.startedAt) {
        const started = new Date(info.startedAt);
        const uptime = Math.floor((Date.now() - started.getTime()) / 1000);
        const minutes = Math.floor(uptime / 60);
        const seconds = uptime % 60;
        console.log(chalk.gray(`\n   Uptime: ${minutes}m ${seconds}s`));
    }
});
//# sourceMappingURL=status.js.map