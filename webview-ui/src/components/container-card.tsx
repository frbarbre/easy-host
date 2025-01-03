import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { EnvVariableInputs } from "./env-variable-inputs";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { FormSchema } from "../schemas/form-schema";
import { Container, getType } from "@/utils";
import { useEffect } from "react";

interface ContainerCardProps {
  index: number;
  field: FieldValues;
  form: UseFormReturn<FormSchema>;
  onRemove: () => void;
}

export function ContainerCard({
  index,
  field,
  form,
  onRemove,
}: ContainerCardProps) {
  const type = getType(field.id as Container["id"]);

  const currentValues = form.watch();
  const api_url_name = currentValues.api_url_env;

  const backend_container_name = currentValues.containers.find((container) => {
    const type = getType(container.id as Container["id"]);

    return type === "backend";
  })?.name;

  const api_url_value = `http://${backend_container_name}`;

  useEffect(() => {
    if (type === "frontend") {
      const currentEnvVars = currentValues.containers[index].env_variables;

      // Remove any old API URL variables
      const filteredVars = currentEnvVars.filter(
        (v) =>
          !Object.values(currentValues.containers).some((c) =>
            c.env_variables.some(
              (ev) => ev.key === v.key && ev.value.startsWith("http://")
            )
          )
      );

      // Only add API URL if backend exists
      const newVars = backend_container_name
        ? [{ key: api_url_name, value: api_url_value }, ...filteredVars]
        : filteredVars;

      form.setValue(`containers.${index}.env_variables`, newVars);
    }
  }, [
    backend_container_name,
    api_url_name,
    api_url_value,
    form,
    index,
    type,
    currentValues.containers,
  ]);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold capitalize">
            {field.name} Container
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
              </FormItem>
            )}
          />

          {type !== "database" && (
            <>
              {/* Context Field */}
              <FormField
                control={form.control}
                name={`containers.${index}.context`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="./packages/frontend"
                      />
                    </FormControl>
                    <FormDescription>
                      The path to the container's context (optional)
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
                          The proxy path for the container (optional)
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
          <FormLabel>Container Environment Variables</FormLabel>
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
