import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ContainerList } from "./components/container-list";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Switch } from "./components/ui/switch";
import type { Config } from "./types";
import { vscode } from "./vscode";
import { formSchema } from "./schemas/form-schema";
import { EnvVariableInputs } from "./components/env-variable-inputs";

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      containers: [],
      network_name: "",
      domain: "",
      email: "",
      api_url_env: "API_URL",
      include_sensitive_env_variables: false,
      location: "",
      github: {
        isPrivate: true,
        uri: "",
      },
      env_variables: [],
      nginx: {
        configName: "",
      },
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    vscode.postMessage({
      command: "submit",
      body: placeholderData,
    });
  }

  return (
    <div className="min-h-screen p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="network_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network Name</FormLabel>
                <FormControl>
                  <Input placeholder="my-network" {...field} />
                </FormControl>
                <FormDescription>
                  The name of your Docker network
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input placeholder="example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="include_sensitive_env_variables"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Include Sensitive Environment Variables
                  </FormLabel>
                  <FormDescription>
                    Whether to include sensitive environment variables in the
                    deployment
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="/path/to/project" {...field} />
                </FormControl>
                <FormDescription>
                  The location where your project will be deployed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="api_url_env"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API URL Environment Variable</FormLabel>
                <FormControl>
                  <Input placeholder="API_URL" {...field} />
                </FormControl>
                <FormDescription>
                  The environment variable name that will contain the API URL
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">GitHub Settings</h3>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="github.uri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repository URI</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="github.com/username/repo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="github.isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Private Repository</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Global Environment Variables
              </h3>
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Environment Variables</FormLabel>
                  <FormControl>
                    <EnvVariableInputs
                      envVariables={form.watch("env_variables")}
                      onAdd={(key, value) => {
                        const current = form.getValues("env_variables");
                        form.setValue("env_variables", [
                          ...current,
                          { key, value },
                        ]);
                      }}
                      onRemove={(index) => {
                        const current = form.getValues("env_variables");
                        form.setValue(
                          "env_variables",
                          current.filter((_, i) => i !== index)
                        );
                      }}
                    />
                  </FormControl>
                </FormItem>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Nginx Settings</h3>
              <FormField
                control={form.control}
                name="nginx.configName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Config Name</FormLabel>
                    <FormControl>
                      <Input placeholder="my-app" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name for your Nginx configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <ContainerList form={form} />

          <Button type="submit">Deploy</Button>
        </form>
      </Form>
    </div>
  );
}

export default App;
