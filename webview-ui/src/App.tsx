import { useState } from "react";
import { vscode } from "./vscode";
import { Config } from "./types";

const placeholderData: Config = {
  containers: [
    {
      port: 3004,
      name: "ez-next",
      id: "next",
      context: "./frontend",
      proxy: "/",
      env_variables: [
        {
          key: "API_URL",
          value: "http://laravel",
        },
      ],
    },
    {
      port: 8080,
      name: "ez-laravel",
      id: "laravel",
      context: "./backend",
      proxy: "/api",
      env_variables: [
        {
          key: "DB_CONNECTION",
          value: "pgsql",
        },
        {
          key: "DB_HOST",
          value: "ez-postgres",
        },
        {
          key: "DB_PORT",
          value: "5432",
        },
        {
          key: "DB_DATABASE",
          value: "db",
        },
        {
          key: "DB_USERNAME",
          value: "postgres",
        },
        {
          key: "DB_PASSWORD",
          value: "password",
        },
      ],
    },
    {
      port: 9891,
      name: "ez-postgres",
      id: "postgres",
      context: null,
      proxy: null,
      env_variables: [
        {
          key: "POSTGRES_USER",
          value: "postgres",
        },
        {
          key: "POSTGRES_PASSWORD",
          value: "password",
        },
        {
          key: "POSTGRES_DB",
          value: "db",
        },
      ],
    },
  ],
  github: {
    isPrivate: true,
    uri: "github.com/frbarbre/ez-deploy-test-project",
  },
  env_variables: [
    {
      key: "POSTGRES_USER",
      value: "postgres",
    },
    {
      key: "POSTGRES_PASSWORD",
      value: "password",
    },
    {
      key: "POSTGRES_DB",
      value: "db",
    },
  ],
  network_name: "cool",
  domain: "ezdeploy.frederikbarbre.dk",
  email: "fr.barbre@gmail.com",
  api_url_env: "API_URL",
  include_sensitive_env_variables: true,
  location: "/ezdeploy/myapp",
  nginx: {
    configName: "ezdeploy",
  },
};

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen  flex flex-col  items-center p-10 gap-5">
      <button
        onClick={() => setCount((prev) => prev + 1)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {count}
      </button>

      <button
        onClick={() => {
          vscode.postMessage({
            command: "submit",
            body: placeholderData,
          });
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  );
}

export default App;
