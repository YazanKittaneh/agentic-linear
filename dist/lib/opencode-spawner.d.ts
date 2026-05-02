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
export declare function spawnOpencodeAgent(context: AgentContext): void;
export {};
//# sourceMappingURL=opencode-spawner.d.ts.map