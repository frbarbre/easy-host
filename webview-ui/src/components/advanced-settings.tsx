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

interface AdvancedSettingsProps {
  form: UseFormReturn<FormSchema>;
}

export function AdvancedSettings({ form }: AdvancedSettingsProps) {
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
                <Input placeholder="my-network" {...field} />
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
  );
}
