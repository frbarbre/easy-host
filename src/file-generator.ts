import * as fs from "fs";
import * as path from "path";
import { Config } from "./types";

export async function fileGenerator(config: Config, workspacePath: string) {
  const projectRoot = workspacePath;

  // Add some error handling and logging
  const ensureDirectoryExists = (dir: string) => {
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
  };

  // Generate Dockerfile for each container
  const generateDockerfile = (container: Config["containers"][0]) => {
    const dockerfileContent = `# Dockerfile for ${container.name}
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE ${container.port}
CMD ["npm", "start"]`;

    // Resolve the container context to an absolute path based on the project root
    const containerPath = path.resolve(projectRoot, container.context);
    const dockerfilePath = path.join(containerPath, "Dockerfile");

    ensureDirectoryExists(containerPath);
    fs.writeFileSync(dockerfilePath, dockerfileContent);
  };

  // Generate docker-compose.yml
  const generateDockerCompose = () => {
    const services = config.containers
      .map(
        (container) => `
  ${container.name}:
    build: ${container.context}
    ports:
      - "${container.port}:${container.port}"
    environment:
${container.env_variables
  .map((env) => `      ${env.key}: ${env.value}`)
  .join("\n")}
    ${
      container.proxy
        ? `labels:
      - "traefik.http.routers.${container.name}.rule=PathPrefix(\`${container.proxy}\`)"`
        : ""
    }`
      )
      .join("\n");

    const dockerComposeContent = `version: "3.8"
services:
${services}`;

    const composeFilePath = path.join(projectRoot, "docker-compose.yml");
    fs.writeFileSync(composeFilePath, dockerComposeContent);
  };

  // Generate update.sh
  const generateUpdateScript = () => {
    const updateScriptContent = `#!/bin/bash
echo "Updating containers..."
docker-compose pull
docker-compose up -d`;

    const updateScriptPath = path.join(projectRoot, "update.sh");
    fs.writeFileSync(updateScriptPath, updateScriptContent);
    fs.chmodSync(updateScriptPath, "755"); // Make script executable
  };

  // Generate deploy.sh
  const generateDeployScript = () => {
    const deployScriptContent = `#!/bin/bash
echo "Deploying containers..."
docker-compose down
docker-compose up -d --build`;

    const deployScriptPath = path.join(projectRoot, "deploy.sh");
    fs.writeFileSync(deployScriptPath, deployScriptContent);
    fs.chmodSync(deployScriptPath, "755"); // Make script executable
  };

  // Generate all files
  try {
    config.containers.forEach((container) => generateDockerfile(container));
    generateDockerCompose();
    generateUpdateScript();
    generateDeployScript();
    console.log("Files generated successfully.");
  } catch (error) {
    console.error("Error generating files:", error);
  }
}
