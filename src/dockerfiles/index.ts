import { Containers } from "../types";
import { getInternalPort } from "../utilities";
import { getLaravelDockerFile } from "./laravel";
import { getNextDockerFile } from "./next";

export function getDockerfile({ id }: { id: Containers }): string | null {
  const port = getInternalPort(id);

  if (id === "next") {
    return getNextDockerFile(port);
  }

  if (id === "laravel") {
    return getLaravelDockerFile(port);
  }

  return null;
}
