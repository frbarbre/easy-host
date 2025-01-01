import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { ContainerCard } from "./container-card";
import { containers } from "../utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useFieldArray } from "react-hook-form";

interface ContainerListProps {
  form: UseFormReturn<FormSchema>;
}

export function ContainerList({ form }: ContainerListProps) {
  const { fields, append, remove } = useFieldArray({
    name: "containers",
    control: form.control,
  });

  const usedContainers = fields.map((field) => field.name);
  const availableContainers = containers.filter(
    (container) => !usedContainers.includes(container.id)
  );

  const addContainer = (id: string) => {
    const container = containers.find((c) => c.id === id);
    if (container) {
      append({
        name: container.id,
        port: String(container.internalPort),
        id: container.id,
        context: null,
        proxy: null,
        env_variables: [],
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Containers</h2>
        {availableContainers.length > 0 && (
          <Select onValueChange={addContainer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add container" />
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

      {fields.map((field, index) => (
        <ContainerCard
          key={field.id}
          index={index}
          field={field}
          form={form}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  );
}
