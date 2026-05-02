"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = void 0;
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const registry_js_1 = require("../lib/registry.js");
const linear_js_1 = require("../lib/linear.js");
exports.initCommand = new commander_1.Command("init")
    .description("Connect current directory to a Linear project")
    .action(async () => {
    console.log(chalk_1.default.blue("🔌 Agentic Linear - Project Setup\n"));
    let gitRemote;
    try {
        gitRemote = (0, child_process_1.execSync)("git remote get-url origin", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "ignore"],
        }).trim();
    }
    catch {
        console.log(chalk_1.default.yellow("⚠️  No git remote found. You'll need to specify the repo URL manually."));
    }
    const { linearToken } = await inquirer_1.default.prompt([
        {
            type: "password",
            name: "linearToken",
            message: "Linear API token:",
            mask: "*",
            validate: (input) => input.length > 0 || "Token is required",
        },
    ]);
    const linear = new linear_js_1.LinearAPI(linearToken);
    console.log(chalk_1.default.gray("Fetching Linear teams..."));
    const teams = await linear.getTeams();
    if (teams.length === 0) {
        console.log(chalk_1.default.red("❌ No teams found. Check your Linear token."));
        process.exit(1);
    }
    const { teamId } = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "teamId",
            message: "Select Linear team:",
            choices: teams.map((t) => ({ name: t.name, value: t.id })),
        },
    ]);
    console.log(chalk_1.default.gray("Fetching Linear projects..."));
    const projects = await linear.getProjects(teamId);
    const { projectAction } = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "projectAction",
            message: "Project setup:",
            choices: [
                { name: "Connect to existing project", value: "existing" },
                { name: "Create new project", value: "new" },
            ],
        },
    ]);
    let projectId;
    let projectName;
    if (projectAction === "existing") {
        const { selectedProject } = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "selectedProject",
                message: "Select project:",
                choices: projects.map((p) => ({ name: p.name, value: p })),
            },
        ]);
        projectId = selectedProject.id;
        projectName = selectedProject.name;
    }
    else {
        const { newProjectName } = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "newProjectName",
                message: "New project name:",
                validate: (input) => input.length > 0 || "Name is required",
            },
        ]);
        console.log(chalk_1.default.gray("Creating project..."));
        const newProject = await linear.createProject(newProjectName, teamId);
        projectId = newProject.id;
        projectName = newProject.name;
    }
    const { repoUrl } = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "repoUrl",
            message: "GitHub repository URL:",
            default: gitRemote,
            validate: (input) => {
                if (!input)
                    return "Repository URL is required";
                if (!input.includes("github.com"))
                    return "Must be a GitHub URL";
                return true;
            },
        },
    ]);
    const { branchPrefix } = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "branchPrefix",
            message: "Branch name prefix:",
            default: "agentic/",
        },
    ]);
    const registry = new registry_js_1.Registry();
    const cwd = process.cwd();
    registry.addProject({
        id: projectId,
        name: projectName,
        teamId,
        localPath: cwd,
        repoUrl,
        branchPrefix,
        linearToken,
    });
    console.log(chalk_1.default.green(`\n✅ Project "${projectName}" connected!`));
    console.log(chalk_1.default.gray(`   Local path: ${cwd}`));
    console.log(chalk_1.default.gray(`   Repo: ${repoUrl}`));
    console.log(chalk_1.default.gray(`   Linear Project: ${projectName}`));
    console.log(chalk_1.default.gray(`   Branch prefix: ${branchPrefix}`));
    console.log(chalk_1.default.blue("\n📋 Next steps:"));
    console.log(chalk_1.default.gray("   1. Set up Linear webhook pointing to your service URL"));
    console.log(chalk_1.default.gray("   2. Run: agentic-linear serve"));
    console.log(chalk_1.default.gray("   3. Label Linear issues with 'ai' to trigger agents"));
});
//# sourceMappingURL=init.js.map