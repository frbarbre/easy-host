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

interface AdvancedSettingsProps {
  form: UseFormReturn<FormSchema>;
}

export function AdvancedSettings({ form }: AdvancedSettingsProps) {
  const currentValues = form.watch();

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

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <h2 className="text-2xl font-bold">Advanced Settings</h2>

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
              <FormDescription>The name of your Docker network</FormDescription>
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
      </CardContent>
    </Card>
  );
}
