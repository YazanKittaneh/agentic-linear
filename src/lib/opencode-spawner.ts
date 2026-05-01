import { spawn } from "child_process";
import chalk from "chalk";
import { LinearAPI } from "./linear.js";

interface AgentContext {
  issueId: string;
  identifier: string;
  title: string;
  description: string;
  projectPath: string;
  repoUrl: string;
  branchPrefix: string;
  linearToken: string;
}

export function spawnOpencodeAgent(context: AgentContext) {
  const {
    issueId,
    identifier,
    title,
    description,
    projectPath,
    repoUrl,
    branchPrefix,
    linearToken,
  } = context;

  const branchName = `${branchPrefix}${identifier.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const promptContent = buildAgentPrompt({
    identifier,
    title,
    description,
    repoUrl,
    branchName,
    issueId,
    linearToken,
  });

  console.log(chalk.blue(`🚀 Spawning opencode agent for ${identifier} in ${projectPath}`));

  const opencodeProcess = spawn(
    "opencode",
    ["run", "--dangerously-skip-permissions", promptContent],
    {
      cwd: projectPath,
      stdio: ["pipe", "pipe", "pipe"],
      detached: true,
      env: {
        ...process.env,
        LINEAR_TOKEN: linearToken,
        AGENTIC_ISSUE_ID: issueId,
        AGENTIC_BRANCH: branchName,
      },
    }
  );

  opencodeProcess.stdin?.write("\n");
  opencodeProcess.stdin?.end();

  const linear = new LinearAPI(linearToken);

  let outputBuffer = "";

  opencodeProcess.stdout?.on("data", (data) => {
    const text = data.toString();
    outputBuffer += text;
    console.log(chalk.gray(`[${identifier}] ${text.trim()}`));
  });

  opencodeProcess.stderr?.on("data", (data) => {
    const text = data.toString();
    outputBuffer += text;
    console.error(chalk.red(`[${identifier}] ${text.trim()}`));
  });

  opencodeProcess.on("close", async (code) => {
    if (code === 0) {
      console.log(chalk.green(`✅ Agent completed for ${identifier}`));
      await linear.addComment(
        issueId,
        `✅ Agentic pipeline completed. PR has been opened with the implementation.`,
        linearToken
      );
    } else {
      console.log(chalk.red(`❌ Agent failed for ${identifier} (exit code ${code})`));

      const truncatedLog = truncateLog(outputBuffer, 3000);

      await linear.addComment(
        issueId,
        `❌ Agentic pipeline failed (exit code ${code}).\n\n**Log output:**\n\n\`\`\`\n${truncatedLog}\n\`\`\`\n\n*If the log is truncated, check the server logs for full details.*`,
        linearToken
      );
    }
  });

  opencodeProcess.unref();
}

function truncateLog(log: string, maxLength: number): string {
  const lines = log.split("\n");
  const result: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    if (currentLength + line.length + 1 > maxLength) {
      result.push("... [truncated]");
      break;
    }
    result.push(line);
    currentLength += line.length + 1;
  }

  return result.join("\n");
}

function buildAgentPrompt(context: {
  identifier: string;
  title: string;
  description: string;
  repoUrl: string;
  branchName: string;
  issueId: string;
  linearToken: string;
}): string {
  return `You are an AI software engineer working on a Linear issue.

ISSUE: ${context.identifier}
TITLE: ${context.title}
DESCRIPTION:
${context.description || "(No description provided)"}

REPOSITORY: ${context.repoUrl}
BRANCH: ${context.branchName}

YOUR TASK:
1. First, explore the codebase to understand the issue and relevant code
2. Create a plan for the implementation
3. Implement the fix/feature following existing code patterns
4. Run any available tests or linting
5. Commit your changes to branch "${context.branchName}"
6. Push the branch and open a PR using "gh pr create"

PROGRESS REPORTING:
- You MUST post updates to Linear as you work using the API
- The Linear API token is in env var LINEAR_TOKEN
- Issue ID: ${context.issueId}
- Example command to post a comment (replace the message):
  curl -s -X POST https://api.linear.app/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_TOKEN" \
    -d '{"query": "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { comment { id } } }", "variables": { "input": { "issueId": "${context.issueId}", "body": "YOUR_MESSAGE_HERE" } } }'
- Post when you: start working, find the issue, implement changes, create PR
- Always post a final update when done or if you encounter errors

CONSTRAINTS:
- Do NOT suppress TypeScript errors with "as any" or "@ts-ignore"
- Follow existing code patterns and conventions
- Keep changes minimal and focused
- Do NOT commit .env files or secrets
- Run "npm run lint" and "npm run build" before creating PR if available

Start by exploring the codebase to understand the issue.`;
}