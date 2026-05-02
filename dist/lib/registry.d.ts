export interface ProjectConfig {
    id: string;
    name: string;
    teamId: string;
    localPath: string;
    repoUrl: string;
    branchPrefix: string;
    linearToken: string;
}
export declare class Registry {
    private projects;
    constructor();
    private load;
    private save;
    addProject(project: ProjectConfig): void;
    findByTeamId(teamId: string): ProjectConfig | undefined;
    findByProjectId(projectId: string): ProjectConfig | undefined;
    getAll(): ProjectConfig[];
    removeProject(projectId: string): void;
}
//# sourceMappingURL=registry.d.ts.map