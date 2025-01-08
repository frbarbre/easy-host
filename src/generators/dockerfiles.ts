import * as fs from "fs";
import * as path from "path";
import { Config } from "../types";
import { getDockerfile } from "../dockerfiles";
import { updateNextConfig } from "../handlers/next-config";
import { updateSveltekitConfig } from "../handlers/svelte-config";

export function generateDockerfile(
  container: Config["containers"][number],
  projectRoot: string
) {
  const dockerfileContent = getDockerfile({
    id: container.id,
  });

  if (!dockerfileContent) {
    return;
  }

  // Resolve the container context to an absolute path based on the project root
  const containerPath = path.resolve(projectRoot, container.context || "./");
  const dockerfilePath = path.join(containerPath, "Dockerfile");

  // Handle Next.js specific configuration
  if (container.id === "next") {
    updateNextConfig(containerPath);
  }

  if (container.id === "sveltekit") {
    updateSveltekitConfig(containerPath);
  }
  // Ensure directory exists before writing
  ensureDirectoryExists(containerPath);
  fs.writeFileSync(dockerfilePath, dockerfileContent);
}

function ensureDirectoryExists(dir: string) {
  console.log(`Attempting to create directory: ${dir}`);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Successfully created directory: ${dir}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
    throw error;
  }
}
