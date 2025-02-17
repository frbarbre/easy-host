import { Laravel } from "@/components/icons/laravel";
import Mongo from "@/components/icons/mongo";
import NextJs from "@/components/icons/next-js";
import Postgres from "@/components/icons/postgres";
import ReactRouter from "@/components/icons/react-router";
import Svelte from "@/components/icons/svelte";

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
  sveltekit: {
    id: "sveltekit",
    type: "frontend",
    internalPort: 3000,
    displayName: "SvelteKit",
    icon: Svelte,
    invert: false,
  },
  mongodb: {
    id: "mongodb",
    type: "database",
    internalPort: 27017,
    displayName: "MongoDB",
    icon: Mongo,
    invert: false,
  },
  "react-router": {
    id: "react-router",
    type: "frontend",
    internalPort: 3000,
    displayName: "React Router",
    icon: ReactRouter,
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

  if (id === "mongodb") {
    return [
      {
        key: "MONGO_INITDB_ROOT_PASSWORD",
        value: "",
      },
      {
        key: "MONGO_INITDB_ROOT_USERNAME",
        value: "",
      },
      {
        key: "MONGO_INITDB_DATABASE",
        value: "",
      },
    ];
  }
  return [];
}
