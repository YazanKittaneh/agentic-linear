import fs from "fs";
import path from "path";
import os from "os";
const REGISTRY_PATH = path.join(os.homedir(), ".agentic-linear", "registry.json");
export class Registry {
    projects = [];
    constructor() {
        this.load();
    }
    load() {
        try {
            if (fs.existsSync(REGISTRY_PATH)) {
                const data = fs.readFileSync(REGISTRY_PATH, "utf-8");
                this.projects = JSON.parse(data);
            }
        }
        catch {
            this.projects = [];
        }
    }
    save() {
        const dir = path.dirname(REGISTRY_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(this.projects, null, 2));
    }
    addProject(project) {
        const existing = this.projects.findIndex((p) => p.id === project.id);
        if (existing >= 0) {
            this.projects[existing] = project;
        }
        else {
            this.projects.push(project);
        }
        this.save();
    }
    findByTeamId(teamId) {
        return this.projects.find((p) => p.teamId === teamId);
    }
    findByProjectId(projectId) {
        return this.projects.find((p) => p.id === projectId);
    }
    getAll() {
        return this.projects;
    }
    removeProject(projectId) {
        this.projects = this.projects.filter((p) => p.id !== projectId);
        this.save();
    }
}
//# sourceMappingURL=registry.js.map