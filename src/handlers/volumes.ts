import { Type } from "../types";

export function getVolumes(types: { name: string; type: Type | null }[]) {
  const db = types.find((type) => type.type === "database");
  if (!db) {
    return null;
  }

  if (db.name === "postgres") {
    return {
      name: `volumes:
  ${db.name}_data:`,
      content: `volumes:
      - ${db.name}_data:/var/lib/postgresql/data`,
    };
  }
}
