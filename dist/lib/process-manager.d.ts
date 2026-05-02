interface ProcessInfo {
    serverPid?: number;
    tunnelPid?: number;
    port: number;
    tunnelUrl?: string;
    startedAt: string;
}
export declare class ProcessManager {
    static read(): ProcessInfo | null;
    static write(info: ProcessInfo): void;
    static clear(): void;
    static isRunning(pid: number): boolean;
}
export {};
//# sourceMappingURL=process-manager.d.ts.map