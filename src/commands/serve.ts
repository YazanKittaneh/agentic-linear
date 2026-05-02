import { Command } from "commander";
import chalk from "chalk";
import express from "express";
import { Registry } from "../lib/registry.js";
import { LinearAPI } from "../lib/linear.js";
import { spawnOpencodeAgent } from "../lib/opencode-spawner.js";
import { ProcessManager } from "../lib/process-manager.js";

export const serveCommand = new Command("serve")
  .description("Start the agentic-linear webhook server")
  .option("-p, --port <port>", "Port to run on", "3001")
  .option("-t, --token <token>", "Linear API token (or set LINEAR_TOKEN env)")
  .action(async (options) => {
    const port = parseInt(options.port, 10);

    const existing = ProcessManager.read();
    if (existing?.serverPid && ProcessManager.isRunning(existing.serverPid)) {
      console.log(chalk.yellow(`⚠️ Server already running on port ${existing.port} (PID: ${existing.serverPid})`));
      console.log(chalk.gray("   Use 'agentic-linear restart' to restart or 'agentic-linear stop' to stop."));
      process.exit(1);
    }

    const app = express();
    app.use(express.json());

    const registry = new Registry();

    app.post("/webhook/linear", async (req, res) => {
      try {
        const { body } = req;
        const { type, data } = body;

        if (!data || !data.teamId) {
          return res.status(400).json({ error: "Invalid webhook payload" });
        }

        const project = registry.findByTeamId(data.teamId);
        if (!project) {
          console.log(chalk.yellow(`⚠️ No project registered for team ${data.teamId}`));
          return res.status(200).json({ status: "ignored", reason: "no_project_mapped" });
        }

        const hasAiLabel = data.labels?.some((l: { name: string }) => l.name === "ai");
        if (!hasAiLabel) {
          return res.status(200).json({ status: "ignored", reason: "no_ai_label" });
        }

        if (type === "Issue" && (body.action === "create" || body.action === "update")) {
          console.log(chalk.blue(`🤖 Received Linear issue ${data.identifier}: ${data.title}`));

          const linear = new LinearAPI(project.linearToken);
          await linear.addComment(
            data.id,
            `🤖 Agentic pipeline triggered. Spawning opencode agent to work on this issue...`
          );

          spawnOpencodeAgent({
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
      } catch (error) {
        console.error(chalk.red("❌ Webhook error:"), error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/health", (_req, res) => {
      res.json({ status: "ok", projects: registry.getAll().length });
    });

    app.listen(port, () => {
      ProcessManager.write({
        serverPid: process.pid,
        port,
        startedAt: new Date().toISOString(),
      });

      console.log(chalk.green(`🚀 Agentic Linear server running on port ${port}`));
      console.log(chalk.gray(`   Webhook endpoint: http://localhost:${port}/webhook/linear`));
      console.log(chalk.gray(`   Registered projects: ${registry.getAll().length}`));
      console.log(chalk.gray(`   PID: ${process.pid}`));
    });
  });