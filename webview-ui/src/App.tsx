import { useState } from "react";
import { vscode } from "./vscode";
import { Config } from "./types";

const placeholderData: Config = {
  containers: [
    {
      port: 3004,
      name: "next",
      id: "next",
      context: "./frontend",
      proxy: null,
      env_variables: [
        {
          key: "API_URL",
          value: "backend:8080",
        },
      ],
    },
    {
      port: 8080,
      name: "laravel",
      id: "laravel",
      context: "./backend",
      proxy: "/api",
      env_variables: [
        {
          key: "key1",
          value: "value1",
        },
        {
          key: "key2",
          value: "value2",
        },
      ],
    },
  ],
  github: {
    isPrivate: false,
    uri: "https://github.com/username/repo",
  },
  env_variables: [
    {
      key: "key1",
      value: "value1",
    },
    {
      key: "key2",
      value: "value2",
    },
  ],
  network_name: "cool",
  domain: "example.com",
  email: "example@mail.com",
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
