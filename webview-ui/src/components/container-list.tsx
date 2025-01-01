import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { ContainerCard } from "./container-card";
import {
  containers,
  getType,
  Container,
  containerConfig,
  getDefaultEnvVariables,
} from "../utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useFieldArray } from "react-hook-form";
import { Card, CardContent } from "./ui/card";

interface ContainerListProps {
  form: UseFormReturn<FormSchema>;
}

export function ContainerList({ form }: ContainerListProps) {
  const { fields, append, remove } = useFieldArray({
    name: "containers",
    control: form.control,
    keyName: "_id",
  });

  console.log(fields);
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

      console.log(container);

      // Validate the container has required properties
      if (!container || !container.id || !container.internalPort) {
        throw new Error(`Invalid container configuration for ID: ${id}`);
      }

      // Create container with default values
      const newContainer = {
        name: container.id,
        port: String(container.internalPort),
        id: container.id,
        context: null,
        proxy: null,
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Containers</h2>

      <div className="grid gap-6">
        {Object.entries(containersByType).map(([type, typeContainers]) => {
          const availableContainers = typeContainers.filter(
            (container) => !usedContainers.includes(container.id)
          );

          return (
            <Card key={type} className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{type}</h3>
                  {availableContainers.length > 0 && (
                    <Select onValueChange={addContainer}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={`Add ${type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableContainers.map((container) => (
                          <SelectItem key={container.id} value={container.id}>
                            {container.id}
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
                        const fieldType = getType(field.id as Container["id"]);
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
    </div>
  );
}
