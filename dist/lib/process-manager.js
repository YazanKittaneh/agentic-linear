"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const PID_FILE = path_1.default.join(os_1.default.homedir(), ".agentic-linear", "pids.json");
class ProcessManager {
    static read() {
        try {
            if (fs_1.default.existsSync(PID_FILE)) {
                return JSON.parse(fs_1.default.readFileSync(PID_FILE, "utf-8"));
            }
        }
        catch {
            return null;
        }
        return null;
    }
    static write(info) {
        const dir = path_1.default.dirname(PID_FILE);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(PID_FILE, JSON.stringify(info, null, 2));
    }
    static clear() {
        if (fs_1.default.existsSync(PID_FILE)) {
            fs_1.default.unlinkSync(PID_FILE);
        }
    }
    static isRunning(pid) {
        try {
            process.kill(pid, 0);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ProcessManager = ProcessManager;
//# sourceMappingURL=process-manager.js.map