export declare class LinearAPI {
    private token;
    constructor(token: string);
    private query;
    getTeams(): Promise<{
        id: string;
        name: string;
    }[]>;
    getProjects(teamId: string): Promise<{
        id: string;
        name: string;
    }[]>;
    createProject(name: string, teamId: string): Promise<{
        id: string;
        name: string;
    }>;
    addComment(issueId: string, body: string, token?: string): Promise<void>;
    updateIssueState(issueId: string, stateId: string, token?: string): Promise<void>;
    getIssueStates(teamId: string): Promise<{
        id: string;
        name: string;
        type: string;
    }[]>;
}
//# sourceMappingURL=linear.d.ts.map