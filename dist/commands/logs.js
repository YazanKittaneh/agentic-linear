"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
exports.logsCommand = new commander_1.Command("logs")
    .description("View service logs")
    .option("-f, --follow", "Follow log output (tail -f)", false)
    .option("-n, --lines <lines>", "Number of lines to show", "50")
    .action((options) => {
    const logFile = "/tmp/agentic-linear.log";
    if (!fs_1.default.existsSync(logFile)) {
        console.log(chalk_1.default.yellow("⚠️ No log file found at /tmp/agentic-linear.log"));
        return;
    }
    const lines = parseInt(options.lines, 10);
    if (options.follow) {
        console.log(chalk_1.default.blue(`📄 Following logs (Ctrl+C to exit)...\n`));
        const tail = (0, child_process_1.spawn)("tail", ["-f", "-n", String(lines), logFile], {
            stdio: "inherit",
        });
        tail.on("exit", () => process.exit(0));
    }
    else {
        console.log(chalk_1.default.blue(`📄 Last ${lines} lines of logs:\n`));
        const output = (0, child_process_1.execSync)(`tail -n ${lines} ${logFile}`, { encoding: "utf-8" });
        console.log(output);
    }
});
//# sourceMappingURL=logs.js.map