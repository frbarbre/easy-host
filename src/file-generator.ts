import { generateDeployScript } from "./generators/deploy";
import { generateDockerCompose } from "./generators/docker-compose";
import { generateDockerfile } from "./generators/dockerfiles";
import { generateUpdateScript } from "./generators/update";
import { Config } from "./types";
import * as path from "path";
import * as fs from "fs/promises";

export async function fileGenerator(config: Config, workspacePath: string) {
  const projectRoot = workspacePath;

  // Generate all files
  try {
    config.containers.forEach((container) =>
      generateDockerfile(container, projectRoot)
    );

    generateDockerCompose(config, projectRoot);
    generateUpdateScript(config, projectRoot);
    generateDeployScript(config, projectRoot);

    if (config.include_sensitive_env_variables) {
      await generateGitignore(projectRoot);
    }

    console.log("Files generated successfully.");
  } catch (error) {
    console.error("Error generating files:", error);
  }
}

async function generateGitignore(targetDirectory: string) {
  const gitignorePath = path.join(targetDirectory, ".gitignore");
  const sensitiveEntries = ["deploy.sh", "update.sh", ".env", ".env.*"];

  try {
    let existingContent = "";
    try {
      // Check if .gitignore exists
      await fs.access(gitignorePath);
      // File exists, read it
      existingContent = await fs.readFile(gitignorePath, "utf-8");
    } catch {
      // File doesn't exist, will create new
    }

    // Filter out empty lines and get unique existing entries
    const existingLines = new Set(
      existingContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    );

    // Add new entries only if they don't exist
    sensitiveEntries.forEach((entry) => existingLines.add(entry));

    // Convert back to string with each entry on a new line
    const newContent = Array.from(existingLines).join("\n");
    await fs.writeFile(gitignorePath, newContent);
  } catch (error) {
    console.error("Error updating .gitignore:", error);
  }
}
