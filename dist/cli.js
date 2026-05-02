#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_js_1 = require("./commands/init.js");
const serve_js_1 = require("./commands/serve.js");
const status_js_1 = require("./commands/status.js");
const stop_js_1 = require("./commands/stop.js");
const restart_js_1 = require("./commands/restart.js");
const logs_js_1 = require("./commands/logs.js");
const program = new commander_1.Command();
program
    .name("agentic-linear")
    .description("Connect Linear tickets to AI agents")
    .version("0.1.0");
program.addCommand(init_js_1.initCommand);
program.addCommand(serve_js_1.serveCommand);
program.addCommand(status_js_1.statusCommand);
program.addCommand(stop_js_1.stopCommand);
program.addCommand(restart_js_1.restartCommand);
program.addCommand(logs_js_1.logsCommand);
program.parse();
//# sourceMappingURL=cli.js.map