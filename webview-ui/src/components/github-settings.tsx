import { vscode } from "@/vscode";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GitHubSettingsProps {
  form: UseFormReturn<FormSchema>;
}

export function GitHubSettings({ form }: GitHubSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.command === "set-github-info") {
        setIsLoading(false);
        const firstValidInfo = message.repoInfo.find(
          (item: { uri: string; private: boolean }) => item.uri
        );

        if (!firstValidInfo?.uri) {
          toast.error(
            "Found no .git config, please run the extension in a git repository"
          );
          return;
        }

        if (firstValidInfo) {
          form.setValue(
            "github.uri",
            firstValidInfo.uri.replace("https://", "")
          );
          form.setValue("github.isPrivate", firstValidInfo.private);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [form]);

  const fetchGitHubInfo = () => {
    setIsLoading(true);
    vscode.postMessage({ command: "webview-ready" });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">GitHub Settings</h2>
          <Button
            variant="outline"
            onClick={fetchGitHubInfo}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Fetching
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              </>
            ) : (
              "Fetch Repository Info"
            )}
          </Button>
        </div>
        <FormField
          control={form.control}
          name="github.uri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository URI</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <span className="text-sm border flex items-center border-r-0 text-muted-foreground h-9 px-2 rounded-l-md">
                    https://
                  </span>
                  <Input
                    className="rounded-l-none"
                    placeholder="github.com/username/repo"
                    {...field}
                  />
                </div>
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
