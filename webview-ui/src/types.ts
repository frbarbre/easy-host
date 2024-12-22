export type Config = {
  containers: {
    port: number;
    name: string;
    id: string;
    context: string;
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
  domain: string;
  email: string;
};
