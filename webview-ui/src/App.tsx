import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdvancedSettings } from "./components/advanced-settings";
import { ContainerList } from "./components/container-list";
import { ProjectSettings } from "./components/project-settings";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import {
  FormSchema,
  formSchema,
  defaultFormValues,
} from "./schemas/form-schema";
import { vscode } from "./vscode";
import { usePersistence } from "./hooks/usePersistence";
import { Config } from "./types";
import { GitHubSettings } from "./components/github-settings";
import { ThemeProvider } from "./components/theme-provider";

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
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const { isLoading, resetForm } = usePersistence({ form });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit", values);
    console.log("placeholderData", placeholderData);
    vscode.postMessage({
      command: "submit",
      body: values,
    });
  }

  return (
    <ThemeProvider>
      <main className="min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen"></div>
        ) : (
          <>
            <article className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">EasyHost</h1>

              <Button
                onClick={() => {
                  resetForm();
                }}
                variant="ghost"
                className="text-destructive hover:text-destructive"
              >
                Reset the form
              </Button>
            </article>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <GitHubSettings form={form} />
                <ProjectSettings form={form} />
                <AdvancedSettings form={form} />
                <ContainerList form={form} />
                <Button
                  type="button"
                  onClick={() => {
                    form.trigger();
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  Deploy
                </Button>
              </form>
            </Form>
          </>
        )}
      </main>
    </ThemeProvider>
  );
}

export default App;
