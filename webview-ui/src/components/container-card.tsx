import { cn } from "@/lib/utils";
import { Container, getType } from "@/utils";
import { vscode } from "@/vscode";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { EnvVariableInputs } from "./env-variable-inputs";
import { Button } from "./ui/button";
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

interface ContainerCardProps {
  container: Container;
  index: number;
  field: FieldValues;
  form: UseFormReturn<FormSchema>;
  onRemove: () => void;
}

type FolderStructure = {
  name: string;
  path: string;
  subfolders: FolderStructure[] | null;
};

function FolderTree({
  structure,
  depth = 0,
  onSelect,
  selectedPath,
  index,
}: {
  structure: FolderStructure;
  depth?: number;
  onSelect: (path: string) => void;
  selectedPath?: string;
  index: number;
}) {
  const isPartOfSelectedPath = selectedPath?.startsWith(structure.path + "/");
  const [isOpen, setIsOpen] = useState(isPartOfSelectedPath || false);

  // Update isOpen when selectedPath changes
  useEffect(() => {
    if (isPartOfSelectedPath) {
      setIsOpen(true);
    }
  }, [selectedPath, isPartOfSelectedPath]);

  console.log(index, depth, structure.path);

  return (
    <div className={cn(depth + index !== 0 && "mt-1", depth !== 0 && "ml-3")}>
      <div
        className={cn(
          "flex items-center gap-2 p-1 rounded-sm hover:bg-secondary cursor-pointer",
          selectedPath === structure.path && "bg-secondary",
          !structure.subfolders && "pl-7"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(structure.path);
        }}
      >
        {structure.subfolders && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        <Folder className="h-4 w-4" />
        <span className="text-sm">{structure.name}</span>
      </div>

      {isOpen && structure.subfolders && (
        <div className="ml-2">
          {structure.subfolders.map((folder, i) => (
            <FolderTree
              key={i}
              index={i}
              structure={folder}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContainerCard({
  container,
  index,
  field,
  form,
  onRemove,
}: ContainerCardProps) {
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [isTreeOpen, setIsTreeOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log(message);
      switch (message.command) {
        case "set-workspaces":
          setFolderStructure(message.workspaceFolders?.[0]?.subfolders);
          break;
      }
    });

    vscode.postMessage({ command: "webview-ready" });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isTreeOpen &&
        !(event.target as HTMLElement).closest(".folder-tree")
      ) {
        setIsTreeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTreeOpen]);

  const type = getType(field.id as Container["id"]);

  const currentValues = form.watch();
  const api_url_name = currentValues.api_url_env;

  const backend_container_name = currentValues.containers.find((container) => {
    const type = getType(container.id as Container["id"]);

    return type === "backend";
  })?.name;

  const api_url_value = `http://${backend_container_name}`;

  const origin_value = `https://${currentValues.domain}`;

  useEffect(() => {
    if (type === "frontend") {
      const currentEnvVars = currentValues.containers[index].env_variables;
      const isSvelteKit = container.id === "sveltekit";

      // Remove any old API URL variables and ORIGIN variable for SvelteKit
      const filteredVars = currentEnvVars.filter(
        (v) =>
          !Object.values(currentValues.containers).some((c) =>
            c.env_variables.some(
              (ev) =>
                ev.key === v.key &&
                (ev.value.startsWith("http://") || ev.key === "ORIGIN")
            )
          )
      );

      // Prepare new variables
      let newVars = filteredVars;

      // Add API URL if backend exists
      if (backend_container_name) {
        newVars = [{ key: api_url_name, value: api_url_value }, ...newVars];
      }

      // Add ORIGIN for SvelteKit
      if (isSvelteKit) {
        newVars = [{ key: "ORIGIN", value: origin_value }, ...newVars];
      }

      form.setValue(`containers.${index}.env_variables`, newVars);
    }
  }, [
    backend_container_name,
    api_url_name,
    api_url_value,
    origin_value,
    form,
    index,
    type,
    container.id,
    currentValues.containers,
    currentValues.domain,
  ]);

  useEffect(() => {
    if (currentValues.containers[index].context === "") {
      form.setValue(`containers.${index}.context`, ".");
    }
  }, [currentValues.containers[index].context]);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg flex items-center gap-2 font-semibold">
            <container.icon
              className={cn("w-6 h-6", container.invert && "dark:invert")}
            />
            {container.displayName}
          </h3>
          <Button
            variant="destructive"
            type="button"
            size="sm"
            onClick={onRemove}
          >
            Remove
          </Button>
        </div>

        <div className="grid gap-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name={`containers.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder={`ez-${field.value}`} {...field} />
                </FormControl>
                <FormDescription>The name of your container</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Port Field */}
          <FormField
            control={form.control}
            name={`containers.${index}.port`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="3000" />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  The external port your application will run on.
                </FormDescription>
              </FormItem>
            )}
          />

          {type !== "database" && (
            <>
              <FormField
                control={form.control}
                name={`containers.${index}.context`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Path</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="./packages/frontend"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsTreeOpen(true);
                          }}
                        />
                        {isTreeOpen && folderStructure.length > 0 && (
                          <Card className="absolute top-full left-0 w-full mt-1 z-50 max-h-[300px] overflow-y-auto folder-tree">
                            <CardContent className="p-2">
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start mb-1 gap-2 h-7 p-1 pl-7",
                                  currentValues.containers[index].context ===
                                    "." && "bg-secondary"
                                )}
                                onClick={() => {
                                  field.onChange(".");
                                  setIsTreeOpen(false);
                                }}
                              >
                                <Folder className="h-4 w-4" />
                                <span className="text-sm">.</span>
                              </Button>
                              {folderStructure.map((folder, i) => (
                                <FolderTree
                                  key={i}
                                  index={i}
                                  structure={folder}
                                  onSelect={(path) => {
                                    field.onChange(path);
                                    setIsTreeOpen(false);
                                  }}
                                  selectedPath={field.value || undefined}
                                />
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      The path to the application's root directory, "." means
                      the current directory.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type !== "frontend" && (
                <>
                  {/* Proxy Field */}
                  <FormField
                    control={form.control}
                    name={`containers.${index}.proxy`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proxy Path</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="/api"
                          />
                        </FormControl>
                        <FormDescription>
                          The path you want to proxy to your application (e.g.
                          "/api").
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Container Environment Variables */}
        <div className="mt-4">
          <FormLabel className="block space-y-0 mb-2">
            Container Environment Variables
          </FormLabel>
          <EnvVariableInputs
            form={form}
            containerIndex={index}
            onAdd={(key, value) => {
              const current = form.getValues(
                `containers.${index}.env_variables`
              );
              form.setValue(`containers.${index}.env_variables`, [
                ...current,
                { key, value },
              ]);
            }}
            onRemove={(removeIndex) => {
              const current = form.getValues(
                `containers.${index}.env_variables`
              );
              form.setValue(
                `containers.${index}.env_variables`,
                current.filter((_, i) => i !== removeIndex)
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
