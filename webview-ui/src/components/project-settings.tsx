import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { AdvancedSettings } from "./advanced-settings";
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

        <AdvancedSettings form={form} />
      </CardContent>
    </Card>
  );
}
