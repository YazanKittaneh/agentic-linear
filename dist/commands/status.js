"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const process_manager_js_1 = require("../lib/process-manager.js");
exports.statusCommand = new commander_1.Command("status")
    .description("Check the status of the agentic-linear service")
    .action(() => {
    const info = process_manager_js_1.ProcessManager.read();
    if (!info) {
        console.log(chalk_1.default.yellow("⚠️ No service running"));
        console.log(chalk_1.default.gray("   Start with: agentic-linear serve"));
        return;
    }
    const serverRunning = info.serverPid && process_manager_js_1.ProcessManager.isRunning(info.serverPid);
    console.log(chalk_1.default.blue("📊 Agentic Linear Status\n"));
    if (serverRunning) {
        console.log(chalk_1.default.green("● Server: Running"));
        console.log(chalk_1.default.gray(`   Port: ${info.port}`));
        console.log(chalk_1.default.gray(`   PID: ${info.serverPid}`));
    }
    else {
        console.log(chalk_1.default.red("● Server: Stopped"));
    }
    if (info.tunnelPid && process_manager_js_1.ProcessManager.isRunning(info.tunnelPid)) {
        console.log(chalk_1.default.green("● Tunnel: Running"));
        console.log(chalk_1.default.gray(`   URL: ${info.tunnelUrl || "Unknown"}`));
        console.log(chalk_1.default.gray(`   PID: ${info.tunnelPid}`));
    }
    else if (info.tunnelPid) {
        console.log(chalk_1.default.red("● Tunnel: Stopped"));
    }
    if (info.startedAt) {
        const started = new Date(info.startedAt);
        const uptime = Math.floor((Date.now() - started.getTime()) / 1000);
        const minutes = Math.floor(uptime / 60);
        const seconds = uptime % 60;
        console.log(chalk_1.default.gray(`\n   Uptime: ${minutes}m ${seconds}s`));
    }
});
//# sourceMappingURL=status.js.map