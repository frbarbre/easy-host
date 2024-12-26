import * as fs from "fs";
import * as path from "path";
import { Config } from "../types";
import { getDependsOn, getImage, getInternalPort, getType } from "../utilities";
import { getNetwork } from "../handlers/network";
import { getVolumes } from "../handlers/volumes";

export function generateDockerCompose(config: Config, projectRoot: string) {
  const types = config.containers.map((container) => {
    return {
      name: container.name,
      type: getType(container.id),
    };
  });

  const networks = getNetwork(config, config.network_name);

  const volumes = getVolumes(types);

  const services = config.containers
    .map((container) => {
      const port = getInternalPort(container.id);
      const type = getType(container.id);
      const dependsOn = getDependsOn({
        all_types: types,
        current_type: type,
      });
      const image = getImage(container.id);

      const apiUrlEnv = config.api_url_env;

      const envVariables = container.env_variables.map((env) => {
        if (env.key === apiUrlEnv) {
          return `      ${env.key}: ${
            "http://" + types.find((type) => type.type === "backend")?.name
          }`;
        }
        return `      ${env.key}: ${"${" + env.key + "}"}`;
      });

      const serviceParts = [
        `  ${container.name}:`,
        container.context
          ? `    build:
      context: ${container.context}`
          : type === "database"
          ? null
          : "    build: .",
        image ? `    image: ${image}` : null,
        `    ports:
      - "${container.port}:${port}"`,
        networks
          ? `    networks:
      - ${config.network_name}`
          : null,
        dependsOn.length > 0
          ? `    depends_on:
      - ${dependsOn.join("\n      - ")}`
          : null,
        type === "database" && volumes ? `    ${volumes.content}` : null,
        `    environment:
${envVariables.join("\n")}`,
      ].filter(Boolean);

      return serviceParts.join("\n");
    })
    .join("\n\n");

  const sections = [
    `services:
${services}`,
    volumes?.name,
    networks,
  ].filter(Boolean);

  const dockerComposeContent = sections.join("\n\n");

  const composeFilePath = path.join(projectRoot, "docker-compose.yml");
  fs.writeFileSync(composeFilePath, dockerComposeContent);
}
