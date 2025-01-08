import { Containers } from "../types";
import { getLaravelDockerFile } from "./laravel";
import { getNextDockerFile } from "./next";
import { getInternalPort } from "../utilities";
import { getSveltekitDockerFile } from "./svelte";

export function getDockerfile({ id }: { id: Containers }): string | null {
  const port = getInternalPort(id);

  if (id === "next") {
    return getNextDockerFile(port);
  }

  if (id === "laravel") {
    return getLaravelDockerFile(port);
  }

  if (id === "sveltekit") {
    return getSveltekitDockerFile(port);
  }

  return null;
}
