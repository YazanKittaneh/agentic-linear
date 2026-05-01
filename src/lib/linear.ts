import fetch from "node-fetch";

const LINEAR_API = "https://api.linear.app/graphql";

export class LinearAPI {
  constructor(private token: string) {}

  private async query(query: string, variables?: Record<string, unknown>) {
    const res = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.token,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`Linear API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as {
      data?: unknown;
      errors?: Array<{ message: string }>;
    };

    if (json.errors) {
      throw new Error(`Linear GraphQL error: ${json.errors[0].message}`);
    }

    return json.data;
  }

  async getTeams() {
    const data = (await this.query(`
      query { teams { nodes { id name } } }
    `)) as { teams: { nodes: Array<{ id: string; name: string }> } };

    return data.teams.nodes;
  }

  async getProjects(teamId: string) {
    const data = (await this.query(`
      query($teamId: String!) {
        projects(filter: { team: { id: { eq: $teamId } } }) {
          nodes { id name }
        }
      }
    `, { teamId })) as { projects: { nodes: Array<{ id: string; name: string }> } };

    return data.projects.nodes;
  }

  async createProject(name: string, teamId: string) {
    const data = (await this.query(`
      mutation($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          project { id name }
        }
      }
    `, {
      input: { name, teamIds: [teamId] },
    })) as { projectCreate: { project: { id: string; name: string } } };

    return data.projectCreate.project;
  }

  async addComment(issueId: string, body: string, token?: string) {
    const api = token ? new LinearAPI(token) : this;
    await api.query(`
      mutation($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          comment { id }
        }
      }
    `, {
      input: { issueId, body },
    });
  }

  async updateIssueState(issueId: string, stateId: string, token?: string) {
    const api = token ? new LinearAPI(token) : this;
    await api.query(`
      mutation($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          issue { id }
        }
      }
    `, {
      id: issueId,
      input: { stateId },
    });
  }

  async getIssueStates(teamId: string) {
    const data = (await this.query(`
      query($teamId: String!) {
        workflowStates(filter: { team: { id: { eq: $teamId } } }) {
          nodes { id name type }
        }
      }
    `, { teamId })) as {
      workflowStates: {
        nodes: Array<{ id: string; name: string; type: string }>;
      };
    };

    return data.workflowStates.nodes;
  }
}