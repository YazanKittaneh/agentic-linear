"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearAPI = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const LINEAR_API = "https://api.linear.app/graphql";
class LinearAPI {
    token;
    constructor(token) {
        this.token = token;
    }
    async query(query, variables) {
        const res = await (0, node_fetch_1.default)(LINEAR_API, {
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
      query($teamId: String!) {
        projects(filter: { team: { id: { eq: $teamId } } }) {
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
      query($teamId: String!) {
        workflowStates(filter: { team: { id: { eq: $teamId } } }) {
          nodes { id name type }
        }
      }
    `, { teamId }));
        return data.workflowStates.nodes;
    }
}
exports.LinearAPI = LinearAPI;
//# sourceMappingURL=linear.js.map