import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "@/schemas/form-schema";
import { getDefaultEnvVariables, getType } from "@/utils";
import { Container } from "@/utils";
import { Trash2 } from "lucide-react";

interface EnvVariableInputsProps {
  onAdd: (key: string, value: string) => void;
  onRemove: (index: number) => void;
  form: UseFormReturn<FormSchema>;
  containerIndex: number;
}

export function EnvVariableInputs({
  onAdd,
  onRemove,
  form,
  containerIndex,
}: EnvVariableInputsProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get env variables directly from form
  const envVariables = form.watch(`containers.${containerIndex}.env_variables`);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    if (pastedText.includes("\n")) {
      pastedText
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .forEach((line) => {
          const [key, ...valueParts] = line.split("=");
          if (key && !envVariables.some((v) => v.key === key.trim())) {
            onAdd(
              key.trim(),
              valueParts
                .join("=")
                .trim()
                .replace(/^["']|["']$/g, "")
            );
          }
        });
      setKey("");
      setValue("");
      setError(null);
    } else {
      e.currentTarget.value = pastedText;
      if (e.currentTarget.name === "key") setKey(pastedText);
      if (e.currentTarget.name === "value") setValue(pastedText);
    }
  };

  const defaultEnvVariables = getDefaultEnvVariables(
    form.getValues("containers")[containerIndex].id as Container["id"]
  );

  const currentValues = form.watch();

  const type = getType(
    currentValues.containers[containerIndex].id as Container["id"]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <Input
            name="key"
            placeholder="Key (or paste .env content)"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError(null);
            }}
            onPaste={handlePaste}
          />
          <Input
            name="value"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPaste={handlePaste}
          />
          <Button
            type="button"
            onClick={() => {
              if (key && value) {
                if (envVariables.some((v) => v.key === key)) {
                  setError("A variable with this key already exists");
                  return;
                }
                if (key === currentValues.api_url_env && type === "frontend") {
                  setError(
                    `${key} is reserved for the api url environment variable`
                  );
                  return;
                }

                if (
                  key === "ORIGIN" &&
                  currentValues.containers[containerIndex].id === "sveltekit"
                ) {
                  setError(
                    `${key} is reserved for the origin environment variable`
                  );
                  return;
                }

                onAdd(key, value);
                setKey("");
                setValue("");
                setError(null);
              }
            }}
          >
            Add
          </Button>
        </div>
        {error && (
          <FormMessage className="text-destructive">{error}</FormMessage>
        )}
      </div>
      {envVariables?.length > 0 && (
        <div className="flex flex-col gap-4 mt-4 border rounded-md p-4">
          {envVariables?.map((_, index) => (
            <div key={index}>
              <FormField
                control={form.control}
                name={`containers.${containerIndex}.env_variables.${index}.key`}
                render={({ field }) => (
                  <FormItem className="flex gap-4 items-start space-y-0">
                    <div className="flex-1">
                      <FormControl>
                        <Input
                          disabled={
                            defaultEnvVariables.some(
                              (envVar) => envVar.key === field.value
                            ) ||
                            ((field.value === currentValues.api_url_env ||
                              field.value === "ORIGIN") &&
                              type === "frontend")
                          }
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                    <FormField
                      control={form.control}
                      name={`containers.${containerIndex}.env_variables.${index}.value`}
                      render={({ field: valueField }) => (
                        <div className="flex-1 ">
                          <FormControl>
                            <Input
                              {...valueField}
                              disabled={
                                (field.value === currentValues.api_url_env ||
                                  field.value === "ORIGIN") &&
                                type === "frontend"
                              }
                              value={valueField.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onRemove(index)}
                      size="icon"
                      disabled={
                        defaultEnvVariables.some(
                          (envVar) => envVar.key === field.value
                        ) ||
                        ((field.value === currentValues.api_url_env ||
                          field.value === "ORIGIN") &&
                          type === "frontend")
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
