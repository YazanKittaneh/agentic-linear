"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const REGISTRY_PATH = path_1.default.join(os_1.default.homedir(), ".agentic-linear", "registry.json");
class Registry {
    projects = [];
    constructor() {
        this.load();
    }
    load() {
        try {
            if (fs_1.default.existsSync(REGISTRY_PATH)) {
                const data = fs_1.default.readFileSync(REGISTRY_PATH, "utf-8");
                this.projects = JSON.parse(data);
            }
        }
        catch {
            this.projects = [];
        }
    }
    save() {
        const dir = path_1.default.dirname(REGISTRY_PATH);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(REGISTRY_PATH, JSON.stringify(this.projects, null, 2));
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
exports.Registry = Registry;
//# sourceMappingURL=registry.js.map