import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { Card, CardContent } from "./ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

interface ProjectSettingsProps {
  form: UseFormReturn<FormSchema>;
}

export function ProjectSettings({ form }: ProjectSettingsProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <h2 className="text-2xl font-bold">Project Settings</h2>

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
                The environment variable name used for API URL in your frontend
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
      </CardContent>
    </Card>
  );
}
