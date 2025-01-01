import { Type } from "../types";

export const containerConfig = {
  next: {
    id: "next",
    type: "frontend",
    internalPort: 3000,
  },
  laravel: {
    id: "laravel",
    type: "backend",
    internalPort: 80,
  },
  postgres: {
    id: "postgres",
    type: "database",
    internalPort: 5432,
  },
} as const;

export type Container = (typeof containerConfig)[keyof typeof containerConfig];

export const containers = Object.values(containerConfig);

export function getInternalPort(id: Container["id"]) {
  return containerConfig[id as keyof typeof containerConfig].internalPort;
}

export function getType(id: Container["id"]): Type | null {
  return containerConfig[id as keyof typeof containerConfig].type;
}
