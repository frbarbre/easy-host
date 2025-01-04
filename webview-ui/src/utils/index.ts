import { Laravel } from "@/components/icons/laravel";
import NextJs from "@/components/icons/next-js";
import Postgres from "@/components/icons/postgres";

export const containerConfig = {
  next: {
    id: "next",
    type: "frontend",
    internalPort: 3000,
    displayName: "Next.js",
    icon: NextJs,
    invert: true,
  },
  laravel: {
    id: "laravel",
    type: "backend",
    internalPort: 80,
    displayName: "Laravel",
    icon: Laravel,
    invert: false,
  },
  postgres: {
    id: "postgres",
    type: "database",
    internalPort: 5432,
    displayName: "PostgreSQL",
    icon: Postgres,
    invert: false,
  },
} as const;

export type Container = (typeof containerConfig)[keyof typeof containerConfig];

export const containers = Object.values(containerConfig);

export function getInternalPort(id: Container["id"]) {
  return containerConfig[id as keyof typeof containerConfig].internalPort;
}

export function getType(id: Container["id"]): Container["type"] {
  return containerConfig[id as keyof typeof containerConfig].type;
}

export function getDefaultEnvVariables(id: Container["id"]) {
  if (id === "postgres") {
    return [
      {
        key: "POSTGRES_PASSWORD",
        value: "",
      },
      {
        key: "POSTGRES_USER",
        value: "",
      },
      {
        key: "POSTGRES_DB",
        value: "",
      },
    ];
  }

  return [];
}
