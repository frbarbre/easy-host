import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

interface GitHubSettingsProps {
  form: UseFormReturn<FormSchema>;
}

export function GitHubSettings({ form }: GitHubSettingsProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <h2 className="text-2xl font-bold">GitHub Settings</h2>
        <FormField
          control={form.control}
          name="github.uri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository URI</FormLabel>
              <FormControl>
                <Input placeholder="github.com/username/repo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="github.isPrivate"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Private Repository</FormLabel>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
