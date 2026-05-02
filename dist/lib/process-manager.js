import fs from "fs";
import path from "path";
import os from "os";
const PID_FILE = path.join(os.homedir(), ".agentic-linear", "pids.json");
export class ProcessManager {
    static read() {
        try {
            if (fs.existsSync(PID_FILE)) {
                return JSON.parse(fs.readFileSync(PID_FILE, "utf-8"));
            }
        }
        catch {
            return null;
        }
        return null;
    }
    static write(info) {
        const dir = path.dirname(PID_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(PID_FILE, JSON.stringify(info, null, 2));
    }
    static clear() {
        if (fs.existsSync(PID_FILE)) {
            fs.unlinkSync(PID_FILE);
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
//# sourceMappingURL=process-manager.js.map