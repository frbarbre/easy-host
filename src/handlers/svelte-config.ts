import * as fs from "fs";
import * as path from "path";

export function updateSveltekitConfig(containerPath: string) {
  const configPath = path.join(containerPath, "svelte.config.js");

  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, "utf-8");

    // Simply find any line with "import adapter from" and replace it
    configContent = configContent.replace(
      /^.*import\s+adapter\s+from.*$/m,
      "import adapter from '@sveltejs/adapter-node'"
    );

    fs.writeFileSync(configPath, configContent);
  }

  // Update package.json
  const packagePath = path.join(containerPath, "package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    // Add @sveltejs/adapter-node to dependencies if not present
    if (!packageJson.dependencies?.["@sveltejs/adapter-node"]) {
      packageJson.dependencies = {
        ...packageJson.dependencies,
        "@sveltejs/adapter-node": "^5.2.9",
      };

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    }
  }
}
