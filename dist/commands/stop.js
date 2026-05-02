"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const process_manager_js_1 = require("../lib/process-manager.js");
exports.stopCommand = new commander_1.Command("stop")
    .description("Stop the agentic-linear service and tunnel")
    .action(() => {
    const info = process_manager_js_1.ProcessManager.read();
    if (!info) {
        console.log(chalk_1.default.yellow("⚠️ No service is currently running"));
        return;
    }
    let stopped = false;
    if (info.serverPid && process_manager_js_1.ProcessManager.isRunning(info.serverPid)) {
        try {
            process.kill(info.serverPid, "SIGTERM");
            console.log(chalk_1.default.green(`✅ Stopped server (PID: ${info.serverPid})`));
            stopped = true;
        }
        catch {
            console.log(chalk_1.default.red(`❌ Failed to stop server (PID: ${info.serverPid})`));
        }
    }
    if (info.tunnelPid && process_manager_js_1.ProcessManager.isRunning(info.tunnelPid)) {
        try {
            process.kill(info.tunnelPid, "SIGTERM");
            console.log(chalk_1.default.green(`✅ Stopped tunnel (PID: ${info.tunnelPid})`));
            stopped = true;
        }
        catch {
            console.log(chalk_1.default.red(`❌ Failed to stop tunnel (PID: ${info.tunnelPid})`));
        }
    }
    process_manager_js_1.ProcessManager.clear();
    if (!stopped) {
        console.log(chalk_1.default.yellow("⚠️ No running processes found"));
    }
    else {
        console.log(chalk_1.default.blue("\n🛑 All services stopped"));
    }
});
//# sourceMappingURL=stop.js.map