import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

interface AdvancedSettingsProps {
  form: UseFormReturn<FormSchema>;
}

export function AdvancedSettings({ form }: AdvancedSettingsProps) {
  const currentValues = form.watch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const placeholderPrefix = currentValues?.github?.uri?.split("/")[2];

  const [isChanged, setIsChanged] = useState<{
    network_name: boolean;
    nginx_config_name: boolean;
  }>({
    network_name: false,
    nginx_config_name: false,
  });

  useEffect(() => {
    if (!placeholderPrefix) return;

    if (
      !isChanged.network_name &&
      currentValues?.network_name !== placeholderPrefix + "-network" &&
      currentValues?.containers?.length <= 1
    ) {
      form.setValue("network_name", placeholderPrefix + "-network");
    }
    if (
      !isChanged.nginx_config_name &&
      currentValues?.nginx?.configName !== placeholderPrefix
    ) {
      form.setValue("nginx.configName", placeholderPrefix);
    }
  }, [currentValues, form, isChanged, placeholderPrefix]);

  useEffect(() => {
    const formState = form.getFieldState("network_name");
    const nginxState = form.getFieldState("nginx.configName");
    const envVarsState = form.getFieldState("include_sensitive_env_variables");

    const hasFieldErrors = !!(
      formState.error ||
      nginxState.error ||
      envVarsState.error
    );

    setHasErrors(hasFieldErrors);

    if (hasFieldErrors) {
      setIsExpanded(true);
    }
  }, [form.formState.errors]);

  return (
    <Card className={cn(hasErrors && !isExpanded && "border-destructive")}>
      <CardContent className="pt-6">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between"
        >
          <h2 className="text-md font-bold">Advanced Settings</h2>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "space-y-6 overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-[500px] mt-10 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <FormField
            control={form.control}
            name="network_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={currentValues?.containers?.length <= 1}
                    placeholder="my-network"
                    onChange={(e) => {
                      setIsChanged((prev) => ({
                        ...prev,
                        network_name: true,
                      }));
                      field.onChange(e);
                    }}
                  />
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
            name="nginx.configName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nginx Config Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="my-app"
                    onChange={(e) => {
                      setIsChanged((prev) => ({
                        ...prev,
                        nginx_config_name: true,
                      }));
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The name for your Nginx configuration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="include_sensitive_env_variables"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                <label
                  htmlFor="include_sensitive_env_variables"
                  className="space-y-0.5 flex-1"
                >
                  <FormLabel className="text-base">
                    Include Sensitive Environment Variables
                  </FormLabel>
                  <FormDescription>
                    Whether to include sensitive environment variables in the
                    deployment
                  </FormDescription>
                </label>
                <FormControl>
                  <Switch
                    id="include_sensitive_env_variables"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
