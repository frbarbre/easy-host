import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ContainerList } from "./components/container-list";
import { GitHubSettings } from "./components/github-settings";
import { ProjectSettings } from "./components/project-settings";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import { usePersistence } from "./hooks/usePersistence";
import {
  defaultFormValues,
  FormSchema,
  formSchema,
} from "./schemas/form-schema";

import { vscode } from "./vscode";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { useEffect } from "react";

function App() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const { isLoading, resetForm } = usePersistence({ form });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "generation-result") {
        if (!message.success) {
          if (message.error === "UNCOMMITTED_CHANGES") {
            toast.error(message.message);
          } else {
            toast.error("An error occurred while generating files.");
          }
        } else {
          toast.success(message.message);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
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
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
