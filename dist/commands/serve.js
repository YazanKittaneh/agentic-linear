"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const express_1 = __importDefault(require("express"));
const registry_js_1 = require("../lib/registry.js");
const linear_js_1 = require("../lib/linear.js");
const opencode_spawner_js_1 = require("../lib/opencode-spawner.js");
const process_manager_js_1 = require("../lib/process-manager.js");
exports.serveCommand = new commander_1.Command("serve")
    .description("Start the agentic-linear webhook server")
    .option("-p, --port <port>", "Port to run on", "3001")
    .option("-t, --token <token>", "Linear API token (or set LINEAR_TOKEN env)")
    .action(async (options) => {
    const port = parseInt(options.port, 10);
    const linearToken = options.token || process.env.LINEAR_TOKEN;
    if (!linearToken) {
        console.log(chalk_1.default.red("❌ Linear token required. Use --token or set LINEAR_TOKEN env var."));
        process.exit(1);
    }
    const existing = process_manager_js_1.ProcessManager.read();
    if (existing?.serverPid && process_manager_js_1.ProcessManager.isRunning(existing.serverPid)) {
        console.log(chalk_1.default.yellow(`⚠️ Server already running on port ${existing.port} (PID: ${existing.serverPid})`));
        console.log(chalk_1.default.gray("   Use 'agentic-linear restart' to restart or 'agentic-linear stop' to stop."));
        process.exit(1);
    }
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const registry = new registry_js_1.Registry();
    const linear = new linear_js_1.LinearAPI(linearToken);
    app.post("/webhook/linear", async (req, res) => {
        try {
            const { body } = req;
            const { type, data } = body;
            if (!data || !data.teamId) {
                return res.status(400).json({ error: "Invalid webhook payload" });
            }
            const project = registry.findByTeamId(data.teamId);
            if (!project) {
                console.log(chalk_1.default.yellow(`⚠️ No project registered for team ${data.teamId}`));
                return res.status(200).json({ status: "ignored", reason: "no_project_mapped" });
            }
            const hasAiLabel = data.labels?.some((l) => l.name === "ai");
            if (!hasAiLabel) {
                return res.status(200).json({ status: "ignored", reason: "no_ai_label" });
            }
            if (type === "Issue" && (body.action === "create" || body.action === "update")) {
                console.log(chalk_1.default.blue(`🤖 Received Linear issue ${data.identifier}: ${data.title}`));
                await linear.addComment(data.id, `🤖 Agentic pipeline triggered. Spawning opencode agent to work on this issue...`, project.linearToken);
                (0, opencode_spawner_js_1.spawnOpencodeAgent)({
                    issueId: data.id,
                    identifier: data.identifier,
                    title: data.title,
                    description: data.description || "",
                    projectPath: project.localPath,
                    repoUrl: project.repoUrl,
                    branchPrefix: project.branchPrefix,
                    linearToken: project.linearToken,
                });
                return res.status(200).json({ status: "processing", agent: "spawned" });
            }
            res.status(200).json({ status: "ignored", reason: "not_applicable" });
        }
        catch (error) {
            console.error(chalk_1.default.red("❌ Webhook error:"), error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", projects: registry.getAll().length });
    });
    app.listen(port, () => {
        process_manager_js_1.ProcessManager.write({
            serverPid: process.pid,
            port,
            startedAt: new Date().toISOString(),
        });
        console.log(chalk_1.default.green(`🚀 Agentic Linear server running on port ${port}`));
        console.log(chalk_1.default.gray(`   Webhook endpoint: http://localhost:${port}/webhook/linear`));
        console.log(chalk_1.default.gray(`   Registered projects: ${registry.getAll().length}`));
        console.log(chalk_1.default.gray(`   PID: ${process.pid}`));
    });
});
//# sourceMappingURL=serve.js.map