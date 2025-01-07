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
  const currentValues = form.watch();

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
              <FormDescription>
                The domain you want to deploy your project to. Do not include
                the protocol (http:// or https://).
              </FormDescription>
            </FormItem>
          )}
        />

        {currentValues.domain && (
          <div className="rounded-lg border p-4 bg-muted">
            <p className="font-medium mb-2">
              Please add the following DNS records to your provider:
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-medium">Type</div>
              <div className="font-medium">Host</div>
              <div className="font-medium">Value</div>
              <div>A</div>
              <div>
                {currentValues.domain.split(".").length > 2
                  ? currentValues.domain.split(".")[0]
                  : currentValues.domain}
              </div>
              <div>Server IP address (eg. 12.43.5.678)</div>
              {currentValues.domain.split(".").length <= 2 && (
                <>
                  <div>CNAME</div>
                  <div>www</div>
                  <div>{currentValues.domain}</div>
                </>
              )}
            </div>
          </div>
        )}

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
              <FormDescription>
                Your email address, used for generating SSL certificates.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Location</FormLabel>
              <FormControl>
                <Input placeholder="/path/to/project" {...field} />
              </FormControl>
              <FormDescription>
                The location you wish to save your project files on your server.
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
                The name of the environment variable in your frontend that
                stores the API URL (e.g. if you use
                API_URL=http://localhost:8000 in your .env file, enter "API_URL"
                here).
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
