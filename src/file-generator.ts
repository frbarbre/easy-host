import { generateDeployScript } from "./generators/deploy";
import { generateDockerCompose } from "./generators/docker-compose";
import { generateDockerfile } from "./generators/dockerfiles";
import { generateUpdateScript } from "./generators/update";
import { Config } from "./types";

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

    console.log("Files generated successfully.");
  } catch (error) {
    console.error("Error generating files:", error);
  }
}
