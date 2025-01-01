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
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold capitalize">
            {field.name} Container
          </h3>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>

        <div className="grid gap-4">
          {/* Port Field */}
          <FormField
            control={form.control}
            name={`containers.${index}.port`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
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
