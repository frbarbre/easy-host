import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./components/ui/button";
import { Form } from "./components/ui/form";
import { vscode } from "./vscode";
import { FormSchema, formSchema } from "./schemas/form-schema";
import { ContainerList } from "./components/container-list";
import { ProjectSettings } from "./components/project-settings";
import { AdvancedSettings } from "./components/advanced-settings";
import { z } from "zod";

function App() {
  const form = useForm<FormSchema>({
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

  // Load saved state and scroll position on mount
  useEffect(() => {
    const savedState = localStorage.getItem("formState");
    const savedScroll = localStorage.getItem("scrollPosition");

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        form.reset(parsedState);
      } catch (error) {
        console.error("❌ Error loading saved state:", error);
      }
    }

    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
    }
  }, [form]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem("scrollPosition", window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Save state changes with debounce
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const subscription = form.watch((data) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem("formState", JSON.stringify(data));
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    vscode.postMessage({
      command: "submit",
      body: values,
    });
  }

  return (
    <div className="min-h-screen p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ProjectSettings form={form} />
          <AdvancedSettings form={form} />
          <ContainerList form={form} />
          <Button type="submit">Deploy</Button>
        </form>
      </Form>
    </div>
  );
}

export default App;
