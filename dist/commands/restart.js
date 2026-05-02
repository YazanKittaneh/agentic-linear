"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const process_manager_js_1 = require("../lib/process-manager.js");
exports.restartCommand = new commander_1.Command("restart")
    .description("Restart the agentic-linear service")
    .option("-p, --port <port>", "Port to run on", "3001")
    .option("-t, --token <token>", "Linear API token (or set LINEAR_TOKEN env)")
    .action(async (options) => {
    const info = process_manager_js_1.ProcessManager.read();
    const port = parseInt(options.port, 10);
    const linearToken = options.token || process.env.LINEAR_TOKEN;
    if (info?.serverPid && process_manager_js_1.ProcessManager.isRunning(info.serverPid)) {
        console.log(chalk_1.default.blue("🔄 Stopping existing service..."));
        try {
            process.kill(info.serverPid, "SIGTERM");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log(chalk_1.default.green("✅ Service stopped"));
        }
        catch {
            console.log(chalk_1.default.yellow("⚠️ Could not stop existing service gracefully"));
        }
    }
    if (info?.tunnelPid && process_manager_js_1.ProcessManager.isRunning(info.tunnelPid)) {
        try {
            process.kill(info.tunnelPid, "SIGTERM");
        }
        catch {
            console.log(chalk_1.default.yellow("⚠️ Could not stop existing tunnel"));
        }
    }
    process_manager_js_1.ProcessManager.clear();
    console.log(chalk_1.default.blue(`🚀 Starting service on port ${port}...`));
    const cliPath = path_1.default.join(process.cwd(), "dist", "cli.js");
    try {
        (0, child_process_1.execSync)(`node "${cliPath}" serve --port ${port}${linearToken ? ` --token ${linearToken}` : ""}`, {
            stdio: "inherit",
            env: process.env,
        });
    }
    catch {
        console.log(chalk_1.default.red("❌ Service exited"));
    }
});
//# sourceMappingURL=restart.js.map