export type Containers = "next" | "laravel" | "postgres";

export type Config = {
  containers: {
    port: number;
    name: string;
    id: Containers;
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
