#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { serveCommand } from "./commands/serve.js";
import { statusCommand } from "./commands/status.js";
import { stopCommand } from "./commands/stop.js";
import { restartCommand } from "./commands/restart.js";
import { logsCommand } from "./commands/logs.js";

const program = new Command();

program
  .name("agentic-linear")
  .description("Connect Linear tickets to AI agents")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(serveCommand);
program.addCommand(statusCommand);
program.addCommand(stopCommand);
program.addCommand(restartCommand);
program.addCommand(logsCommand);

program.parse();