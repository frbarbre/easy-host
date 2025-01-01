import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface EnvVariableInputsProps {
  envVariables: { key: string; value: string }[];
  onAdd: (key: string, value: string) => void;
  onRemove: (index: number) => void;
}

export function EnvVariableInputs({
  envVariables,
  onAdd,
  onRemove,
}: EnvVariableInputsProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

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

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
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
        {envVariables.map((env, index) => (
          <div key={index} className="flex gap-4">
            <Input disabled value={env.key} />
            <Input disabled value={env.value} />
            <Button
              type="button"
              variant="destructive"
              onClick={() => onRemove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
