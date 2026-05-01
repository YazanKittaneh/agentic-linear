# Agentic Linear

A reusable service that connects Linear tickets to AI agents powered by [opencode](https://opencode.ai). When you label a Linear issue with `ai`, an agent automatically researches, implements, and opens a PR.

## Features

- **One service, many projects** — Run a single instance, connect unlimited repositories
- **Automatic PR creation** — Agents research, implement, and open PRs via GitHub CLI
- **Progress tracking** — Real-time updates posted as comments on Linear issues
- **Webhook-driven** — Responds to Linear webhooks in real-time

## Installation

```bash
npm install -g agentic-linear
```

## Quick Start

### 1. Start the service

```bash
# Set your Linear API token
export LINEAR_TOKEN="your-linear-api-token"

# Start the server
agentic-linear serve --port 3001
```

### 2. Connect a project

In any project directory:

```bash
cd /path/to/your/project
agentic-linear init
```

This will:
- Ask for your Linear API token
- List your Linear teams
- Let you select or create a Linear project
- Map your local repository

### 3. Configure Linear webhook

In Linear, go to **Settings → API → Webhooks** and create a webhook pointing to:

```
http://your-server:3001/webhook/linear
```

Enable the **Issue** event type.

### 4. Label issues with `ai`

Create or edit a Linear issue and add the `ai` label. The agent will automatically:

1. Receive the webhook
2. Explore your codebase
3. Research the issue
4. Implement the fix/feature
5. Push a branch and open a PR
6. Update the Linear issue with progress

## Architecture

```
Linear Issue (with "ai" label)
  → Webhook POST /webhook/linear
    → Service maps team → project
      → Spawns opencode agent in project directory
        → Agent researches & implements
        → Opens PR via gh CLI
      → Posts updates to Linear
```

## Commands

### `agentic-linear init`

Interactive setup to connect current directory to a Linear project.

### `agentic-linear serve [options]`

Start the webhook server.

Options:
- `-p, --port <port>` — Server port (default: 3001)
- `-t, --token <token>` — Linear API token (or set `LINEAR_TOKEN` env)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LINEAR_TOKEN` | Linear API token | Yes |

## Project Registry

Projects are stored in `~/.agentic-linear/registry.json`:

```json
[
  {
    "id": "project-id",
    "name": "My Project",
    "teamId": "team-id",
    "localPath": "/path/to/project",
    "repoUrl": "https://github.com/user/repo",
    "branchPrefix": "agentic/",
    "linearToken": "token"
  }
]
```

## Requirements

- Node.js 18+
- [opencode](https://opencode.ai) CLI installed
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- Linear API token

## How It Works

1. **Webhook received** — Linear sends issue data when labeled with `ai`
2. **Project lookup** — Service finds matching project by team ID
3. **Agent spawn** — Writes a prompt file and spawns opencode in the project directory
4. **Research phase** — Opencode explores codebase using `explore` agents
5. **Implementation** — Opencode implements the fix using `build` agents
6. **PR creation** — Agent pushes branch and runs `gh pr create`
7. **Progress updates** — Agent posts comments back to Linear issue

## License

MIT