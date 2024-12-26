import { Uri, Webview } from "vscode";
import { Containers, Type } from "./types";

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

export function getInternalPort(id: string) {
  if (id === "next") {
    return 3000;
  }

  if (id === "laravel") {
    return 80;
  }

  if (id === "postgres") {
    return 5432;
  }
}

export function getType(id: string): Type | null {
  const frontend = ["next"];
  const backend = ["laravel"];
  const database = ["mysql", "postgres"];

  if (frontend.includes(id)) {
    return "frontend";
  }

  if (backend.includes(id)) {
    return "backend";
  }

  if (database.includes(id)) {
    return "database";
  }

  return null;
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

export function getImage(id: Containers) {
  if (id === "postgres") {
    return "postgres:latest";
  }

  return null;
}
