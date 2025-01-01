import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormSchema } from "@/schemas/form-schema";

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
          if (key) {
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
    } else {
      e.currentTarget.value = pastedText;
      if (e.currentTarget.name === "key") setKey(pastedText);
      if (e.currentTarget.name === "value") setValue(pastedText);
    }
  };

  console.log(form.formState.errors);
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mt-2">
        <Input
          name="key"
          placeholder="Key (or paste .env content)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
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
              onAdd(key, value);
              setKey("");
              setValue("");
            }
          }}
        >
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {envVariables?.map((_, index) => (
          <div key={index}>
            <FormField
              control={form.control}
              name={`containers.${containerIndex}.env_variables.${index}.key`}
              render={({ field }) => (
                <FormItem className="flex gap-4 items-start">
                  <div className="flex-1">
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </div>
                  <FormField
                    control={form.control}
                    name={`containers.${containerIndex}.env_variables.${index}.value`}
                    render={({ field: valueField }) => (
                      <div className="flex-1 space-y-0">
                        <FormControl>
                          <Input
                            {...valueField}
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
                  >
                    Remove
                  </Button>
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
