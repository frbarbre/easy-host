import { containerConfig } from "../utilities";

export type Container = (typeof containerConfig)[keyof typeof containerConfig];

export type Containers = Container["id"];

export type Type = Container["type"];

export type Config = {
  containers: {
    port: number;
    name: string;
    id: Container["id"];
    context: string | null;
    proxy: string | null;
    env_variables: {
      key: string;
      value: string;
    }[];
  }[];
  github: {
    isPrivate: boolean;
    uri: string;
  };
  env_variables: {
    key: string;
    value: string;
  }[];
  network_name: string | null;
  domain: string;
  email: string;
  api_url_env: string | null;
  include_sensitive_env_variables: boolean;
  location: string;
  nginx?: {
    configName: string;
  };
};

export type FolderStructure = {
  name: string;
  path: string;
  subfolders: FolderStructure[] | null;
};
