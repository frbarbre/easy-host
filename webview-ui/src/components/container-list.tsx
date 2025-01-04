import { useFieldArray, UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import {
  Container,
  containerConfig,
  containers,
  getDefaultEnvVariables,
  getType,
} from "../utils";
import { ContainerCard } from "./container-card";
import { Card, CardContent } from "./ui/card";
import { FormMessage } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import Docker from "./icons/docker";

interface ContainerListProps {
  form: UseFormReturn<FormSchema>;
}

export function ContainerList({ form }: ContainerListProps) {
  const { fields, append, remove } = useFieldArray({
    name: "containers",
    control: form.control,
    keyName: "_id",
  });

  const { errors } = form.formState;

  const usedContainers = fields.map((field) => field.name);

  // Group containers by type with type safety
  const containersByType = containers.reduce((acc, container) => {
    const type = getType(container.id);
    if (!type) return acc;

    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(container);
    return acc;
  }, {} as Record<string, typeof containers>);

  const addContainer = (id: string) => {
    try {
      // Validate the id
      if (!id) {
        throw new Error("No container ID provided");
      }

      // Validate the container exists
      if (!(id in containerConfig)) {
        throw new Error(`Invalid container ID: ${id}`);
      }

      const container = containerConfig[id as keyof typeof containerConfig];

      // Validate the container has required properties
      if (!container || !container.id || !container.internalPort) {
        throw new Error(`Invalid container configuration for ID: ${id}`);
      }

      const defaultProxy =
        container.type === "frontend"
          ? "/"
          : container.type === "backend"
          ? "/api"
          : null;

      // Create container with default values
      const newContainer = {
        name: container.id,
        port: String(container.internalPort),
        id: container.id,
        context: container.type === "database" ? null : ".",
        proxy: defaultProxy,
        env_variables: getDefaultEnvVariables(container.id),
      };

      // Use a try-catch specifically for append
      try {
        append(newContainer);
      } catch (appendError) {
        throw new Error(`Failed to append container: ${appendError}`);
      }
    } catch (error) {
      // If we can't use console.log, maybe we can show an error in the UI
      alert(`Error adding container: ${error}`);
    }
  };

  return (
    <Card className="space-y-6 border-b">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 pb-6">
          <Docker className="w-6 h-6" />
          Docker Containers
        </h2>

        {errors.containers && (
          <FormMessage className="text-destructive">
            {errors.containers.message}
          </FormMessage>
        )}

        <div className="grid gap-6">
          {Object.entries(containersByType).map(([type, typeContainers]) => {
            const availableContainers = typeContainers.filter(
              (container) => !usedContainers.includes(container.id)
            );

            return (
              <Card key={type} className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">{type}</h3>
                    {availableContainers?.length > 0 && (
                      <Select onValueChange={addContainer}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={`Add ${type}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableContainers.map((container) => (
                            <SelectItem key={container.id} value={container.id}>
                              <span className="flex items-center gap-2">
                                <container.icon
                                  className={cn(
                                    "w-4 h-4",
                                    container.invert && "dark:invert"
                                  )}
                                />
                                {container.displayName}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-4">
                    {fields
                      .filter((field) => {
                        // Add type guard
                        if (!field?.id) return false;
                        try {
                          const fieldType = getType(
                            field.id as Container["id"]
                          );
                          return fieldType === type;
                        } catch {
                          return false;
                        }
                      })
                      .map((field) => {
                        const originalIndex = fields.findIndex(
                          (f) => f.id === field.id
                        );
                        return (
                          <ContainerCard
                            container={
                              containerConfig[field.id as Container["id"]]
                            }
                            key={field.id}
                            index={originalIndex}
                            field={field}
                            form={form}
                            onRemove={() => remove(originalIndex)}
                          />
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
