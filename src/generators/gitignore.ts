import * as fs from "fs/promises";
import * as path from "path";

export async function generateGitignore(targetDirectory: string) {
  const gitignorePath = path.join(targetDirectory, ".gitignore");
  const sensitiveEntries = ["deploy.sh", "update.sh", ".env", ".env.*"];

  try {
    let existingContent = "";
    try {
      await fs.access(gitignorePath);
      existingContent = await fs.readFile(gitignorePath, "utf-8");
    } catch {
      // File doesn't exist, will create new
    }

    const existingLines = new Set(
      existingContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    );

    sensitiveEntries.forEach((entry) => existingLines.add(entry));
    const newContent = Array.from(existingLines).join("\n");
    await fs.writeFile(gitignorePath, newContent);
  } catch (error) {
    console.error("Error updating .gitignore:", error);
  }
}
