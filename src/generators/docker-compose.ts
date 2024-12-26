import * as fs from "fs";
import * as path from "path";
import { Config } from "../types";
import { getDependsOn, getInternalPort, getType } from "../utilities";
import { getNetwork } from "../handlers/network";

export function generateDockerCompose(config: Config, projectRoot: string) {
  const types = config.containers.map((container) => {
    return {
      name: container.name,
      type: getType(container.id),
    };
  });

  const networks = getNetwork(config, config.network_name);

  const services = config.containers
    .map((container) => {
      const port = getInternalPort(container.id);
      const type = getType(container.id);
      const dependsOn = getDependsOn({
        all_types: types,
        current_type: type,
      });

      return `  ${container.name}:
    ${
      container.context
        ? `build:
      context: ${container.context}`
        : "build: ."
    }
    ports:
      - "${container.port}:${port}"${
        networks
          ? `
    networks:
      - ${config.network_name}`
          : ""
      }${
        dependsOn.length > 0
          ? `
    depends_on:
      - ${dependsOn.join("\n      - ")}`
          : ""
      }
    environment:
${container.env_variables
  .map((env) => `      ${env.key}: ${"${" + env.key + "}"}`)
  .join("\n")}`;
    })
    .join("\n\n");

  const dockerComposeContent = `services:
${services}

${networks ? networks : ""}`;

  const composeFilePath = path.join(projectRoot, "docker-compose.yml");
  fs.writeFileSync(composeFilePath, dockerComposeContent);
}
