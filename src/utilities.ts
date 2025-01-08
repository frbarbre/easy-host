import { Uri, Webview } from "vscode";
import { Container, Type } from "./types";

/**
 * A helper function which will get the webview URI of a given file or resource.
 *
 * @remarks This URI can be used within a webview's HTML as a link to the
 * given file/resource.
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param pathList An array of strings representing the path to a file/resource
 * @returns A URI pointing to the file/resource
 */
export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

/**
 * A helper function that returns a unique alphanumeric identifier called a nonce.
 *
 * @remarks This function is primarily used to help enforce content security
 * policies for resources/scripts being executed in a webview context.
 *
 * @returns A nonce
 */
export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function getDependsOn({
  all_types,
  current_type,
}: {
  all_types: { name: string; type: Type | null }[];
  current_type: Type | null;
}) {
  if (current_type === "frontend") {
    return all_types
      .filter((type) => type.type === "backend")
      .map((type) => type.name);
  }

  if (current_type === "backend") {
    return all_types
      .filter((type) => type.type === "database")
      .map((type) => type.name);
  }

  return [];
}

export const containerConfig = {
  postgres: {
    id: "postgres",
    image: "postgres:16",
    internalPort: 5432,
    type: "database",
  },
  next: {
    id: "next",
    image: null,
    internalPort: 3000,
    type: "frontend",
  },
  laravel: {
    id: "laravel",
    image: null,
    internalPort: 80,
    type: "backend",
  },
  sveltekit: {
    id: "sveltekit",
    image: null,
    internalPort: 3000,
    type: "frontend",
  },
} as const;

export const containers = Object.values(containerConfig);

export function getImage(id: Container["id"]) {
  return containerConfig[id as keyof typeof containerConfig].image;
}

export function getInternalPort(id: Container["id"]) {
  return containerConfig[id as keyof typeof containerConfig].internalPort;
}

export function getType(id: Container["id"]) {
  return containerConfig[id as keyof typeof containerConfig].type;
}
