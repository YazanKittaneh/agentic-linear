import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";
import { Registry } from "../lib/registry.js";
import { LinearAPI } from "../lib/linear.js";

export const initCommand = new Command("init")
  .description("Connect current directory to a Linear project")
  .action(async () => {
    console.log(chalk.blue("🔌 Agentic Linear - Project Setup\n"));

    let gitRemote: string | undefined;
    try {
      gitRemote = execSync("git remote get-url origin", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }).trim();
    } catch {
      console.log(chalk.yellow("⚠️  No git remote found. You'll need to specify the repo URL manually."));
    }

    const { linearToken } = await inquirer.prompt([
      {
        type: "password",
        name: "linearToken",
        message: "Linear API token:",
        mask: "*",
        validate: (input: string) => input.length > 0 || "Token is required",
      },
    ]);

    const linear = new LinearAPI(linearToken);

    console.log(chalk.gray("Fetching Linear teams..."));
    const teams = await linear.getTeams();

    if (teams.length === 0) {
      console.log(chalk.red("❌ No teams found. Check your Linear token."));
      process.exit(1);
    }

    const { teamId } = await inquirer.prompt([
      {
        type: "list",
        name: "teamId",
        message: "Select Linear team:",
        choices: teams.map((t) => ({ name: t.name, value: t.id })),
      },
    ]);

    console.log(chalk.gray("Fetching Linear projects..."));
    const projects = await linear.getProjects(teamId);

    const { projectAction } = await inquirer.prompt([
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

    let projectId: string;
    let projectName: string;

    if (projectAction === "existing") {
      const { selectedProject } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedProject",
          message: "Select project:",
          choices: projects.map((p) => ({ name: p.name, value: p })),
        },
      ]);
      projectId = selectedProject.id;
      projectName = selectedProject.name;
    } else {
      const { newProjectName } = await inquirer.prompt([
        {
          type: "input",
          name: "newProjectName",
          message: "New project name:",
          validate: (input: string) => input.length > 0 || "Name is required",
        },
      ]);

      console.log(chalk.gray("Creating project..."));
      const newProject = await linear.createProject(newProjectName, teamId);
      projectId = newProject.id;
      projectName = newProject.name;
    }

    const { repoUrl } = await inquirer.prompt([
      {
        type: "input",
        name: "repoUrl",
        message: "GitHub repository URL:",
        default: gitRemote,
        validate: (input: string) => {
          if (!input) return "Repository URL is required";
          if (!input.includes("github.com")) return "Must be a GitHub URL";
          return true;
        },
      },
    ]);

    const { branchPrefix } = await inquirer.prompt([
      {
        type: "input",
        name: "branchPrefix",
        message: "Branch name prefix:",
        default: "agentic/",
      },
    ]);

    const registry = new Registry();
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

    console.log(chalk.green(`\n✅ Project "${projectName}" connected!`));
    console.log(chalk.gray(`   Local path: ${cwd}`));
    console.log(chalk.gray(`   Repo: ${repoUrl}`));
    console.log(chalk.gray(`   Linear Project: ${projectName}`));
    console.log(chalk.gray(`   Branch prefix: ${branchPrefix}`));

    console.log(chalk.blue("\n📋 Next steps:"));
    console.log(chalk.gray("   1. Set up Linear webhook pointing to your service URL"));
    console.log(chalk.gray("   2. Run: agentic-linear serve"));
    console.log(chalk.gray("   3. Label Linear issues with 'ai' to trigger agents"));
  });