const LINEAR_API = "https://api.linear.app/graphql";
export class LinearAPI {
    token;
    constructor(token) {
        this.token = token;
    }
    async query(query, variables) {
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
        const json = (await res.json());
        if (json.errors) {
            throw new Error(`Linear GraphQL error: ${json.errors[0].message}`);
        }
        return json.data;
    }
    async getTeams() {
        const data = (await this.query(`
      query { teams { nodes { id name } } }
    `));
        return data.teams.nodes;
    }
    async getProjects(teamId) {
        const data = (await this.query(`
      query($teamId: ID!) {
        projects(filter: { accessibleTeams: { id: { eq: $teamId } } }) {
          nodes { id name }
        }
      }
    `, { teamId }));
        return data.projects.nodes;
    }
    async createProject(name, teamId) {
        const data = (await this.query(`
      mutation($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          project { id name }
        }
      }
    `, {
            input: { name, teamIds: [teamId] },
        }));
        return data.projectCreate.project;
    }
    async addComment(issueId, body, token) {
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
    async updateIssueState(issueId, stateId, token) {
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
    async getIssueStates(teamId) {
        const data = (await this.query(`
      query($teamId: ID!) {
        workflowStates(filter: { team: { id: { eq: $teamId } } }) {
          nodes { id name type }
        }
      }
    `, { teamId }));
        return data.workflowStates.nodes;
    }
}
//# sourceMappingURL=linear.js.map