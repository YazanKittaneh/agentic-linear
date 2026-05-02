import { Command } from "commander";
import chalk from "chalk";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";

const __dirname = dirname(new URL(import.meta.url).pathname);

function getCurrentVersion(): string {
  const pkgPath = resolve(__dirname, "../../package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return pkg.version;
}

function getLatestVersion(): string {
  try {
    const result = execSync(
      "npm view agentic-linear version 2>/dev/null || echo 'not-published'",
      { encoding: "utf8" }
    );
    return result.trim();
  } catch {
    return "unknown";
  }
}

function getGitVersion(): string {
  try {
    const result = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      cwd: resolve(__dirname, "../.."),
    });
    return result.trim();
  } catch {
    return "unknown";
  }
}

function detectInstallMethod(): "git" | "npm" | "npx" | "unknown" {
  const binPath = process.argv[1];
  
  if (binPath?.includes("_npx")) {
    return "npx";
  }
  
  try {
    execSync("git rev-parse --git-dir", {
      cwd: resolve(__dirname, "../.."),
      stdio: "pipe",
    });
    return "git";
  } catch {
    return "npm";
  }
}

export const updateCommand = new Command("update")
  .description("Update agentic-linear to the latest version")
  .option("-f, --force", "Force update even if already on latest")
  .action(async (options) => {
    const currentVersion = getCurrentVersion();
    const gitCommit = getGitVersion();
    const installMethod = detectInstallMethod();
    
    console.log(chalk.blue("📦 Agentic Linear Update"));
    console.log(chalk.gray(`   Current version: ${currentVersion} (${gitCommit})`));
    console.log(chalk.gray(`   Install method: ${installMethod}`));
    
    if (installMethod === "npx") {
      console.log(chalk.green("✅ Using npx - always runs latest version. No update needed!"));
      console.log(chalk.gray("   Run with: npx github:YazanKittaneh/agentic-linear"));
      return;
    }
    
    console.log(chalk.blue("\n🔄 Checking for updates..."));
    
    try {
      if (installMethod === "git") {
        const repoPath = resolve(__dirname, "../..");
        
        console.log(chalk.gray("   Fetching from GitHub..."));
        execSync("git fetch origin", { 
          cwd: repoPath, 
          stdio: "inherit" 
        });
        
        const localCommit = execSync("git rev-parse HEAD", { 
          cwd: repoPath, 
          encoding: "utf8" 
        }).trim();
        const remoteCommit = execSync("git rev-parse origin/main", { 
          cwd: repoPath, 
          encoding: "utf8" 
        }).trim();
        
        if (localCommit === remoteCommit && !options.force) {
          console.log(chalk.green("✅ Already up to date!"));
          return;
        }
        
        console.log(chalk.blue("\n📥 Downloading updates..."));
        execSync("git pull origin main", { 
          cwd: repoPath, 
          stdio: "inherit" 
        });
        
        console.log(chalk.blue("\n📦 Installing dependencies..."));
        execSync("npm install", { 
          cwd: repoPath, 
          stdio: "inherit" 
        });
        
        console.log(chalk.blue("\n🔨 Building..."));
        execSync("npm run build", { 
          cwd: repoPath, 
          stdio: "inherit" 
        });
        
        console.log(chalk.blue("\n🔗 Re-linking..."));
        execSync("npm link", { 
          cwd: repoPath, 
          stdio: "inherit" 
        });
        
      } else {
        console.log(chalk.blue("\n📥 Reinstalling from GitHub..."));
        execSync("npm install -g github:YazanKittaneh/agentic-linear", {
          stdio: "inherit",
        });
      }
      
      const newVersion = getCurrentVersion();
      const newCommit = getGitVersion();
      
      console.log(chalk.green("\n✅ Update complete!"));
      console.log(chalk.gray(`   Version: ${currentVersion} → ${newVersion}`));
      console.log(chalk.gray(`   Commit: ${gitCommit} → ${newCommit}`));
      
    } catch (error) {
      console.log(chalk.red("\n❌ Update failed"));
      console.error(error);
      process.exit(1);
    }
  });