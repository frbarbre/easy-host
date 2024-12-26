import { Config } from "../types";

export function getNetwork(
  config: Config,
  name: string | null = "custom_network"
): string | null {
  if (config.containers.length === 1) {
    return null;
  }

  return `networks:
  ${name}:
    driver: bridge`;
}
