import { generateDeployScript } from "./generators/deploy";
import { generateDockerCompose } from "./generators/docker-compose";
import { generateDockerfile } from "./generators/dockerfiles";
import { generateUpdateScript } from "./generators/update";
import { generateGitignore } from "./generators/gitignore";
import { hasUncommittedChanges } from "./utilities";
import { Config } from "./types";

export async function fileGenerator(config: Config, workspacePath: string) {
  const projectRoot = workspacePath;

  try {
    const hasChanges = await hasUncommittedChanges(projectRoot);
    if (hasChanges) {
      return {
        success: false,
        error: "UNCOMMITTED_CHANGES",
        message: "Please commit your changes before generating files.",
      };
    }

    config.containers.forEach((container) =>
      generateDockerfile(container, projectRoot)
    );

    generateDockerCompose(config, projectRoot);
    generateUpdateScript(config, projectRoot);
    generateDeployScript(config, projectRoot);

    if (config.include_sensitive_env_variables) {
      await generateGitignore(projectRoot);
    }

    return {
      success: true,
      message: "Files generated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error: "GENERATION_ERROR",
      message: "An error occurred while generating files.",
    };
  }
}
