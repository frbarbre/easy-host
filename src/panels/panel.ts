import {
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn,
  workspace,
  ExtensionContext,
  FileType,
} from "vscode";
import { getNonce, getUri } from "../utilities";
import { Config, FolderStructure } from "../types";
import { fileGenerator } from "../file-generator";
import ignore from "ignore";
import * as fs from "fs/promises";
import * as path from "path";
import axios from "axios";

async function readGitignore(path: string): Promise<string[]> {
  try {
    const gitignorePath = Uri.file(`${path}/.gitignore`);
    const content = await workspace.fs.readFile(gitignorePath);
    return content
      .toString()
      .split("\n")
      .filter((line) => line && !line.startsWith("#"));
  } catch {
    return [];
  }
}

async function getFolderStructure(
  basePath: string,
  parentPath: string = "",
  ignorePatterns: string[] = []
): Promise<FolderStructure[]> {
  const folders: FolderStructure[] = [];
  const entries = await workspace.fs.readDirectory(Uri.file(basePath));

  const ig = ignore().add(ignorePatterns);
  const localGitignore = await readGitignore(basePath);
  if (localGitignore.length > 0) {
    ig.add(localGitignore);
  }

  for (const [name, type] of entries) {
    if (name.startsWith(".")) {
      continue;
    }

    if (type === FileType.Directory) {
      const relativePath = name;
      if (ig.ignores(relativePath)) {
        continue;
      }

      const fullPath = basePath + "/" + name;
      const currentPath = parentPath ? `${parentPath}/${name}` : `./${name}`;

      const subfolders = await getFolderStructure(
        fullPath,
        currentPath,
        ignorePatterns.concat(localGitignore)
      );

      folders.push({
        name,
        path: currentPath,
        subfolders: subfolders.length > 0 ? subfolders : null,
      });
    }
  }

  return folders;
}

async function getGitHubUri(workspacePath: string): Promise<string | null> {
  try {
    const gitConfigPath = path.join(workspacePath, ".git", "config");
    const configContent = await fs.readFile(gitConfigPath, "utf8");

    // Look for the remote "origin" URL
    const match = configContent.match(/\[remote "origin"\][\s\S]*?url = (.*)/);
    if (match) {
      let url = match[1].trim();
      // Convert SSH format to HTTPS if needed
      if (url.startsWith("git@")) {
        url = "https://github.com/" + url.split(":")[1];
      }
      // Remove .git suffix if present
      url = url.replace(/\.git$/, "");
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

async function getGitHubRepoInfo(repoUrl: string): Promise<boolean | null> {
  try {
    // Extract owner and repo from URL
    const [owner, repo] = repoUrl
      .replace("https://github.com/", "")
      .replace("github.com/", "")
      .split("/");

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    const { data } = await axios.get(apiUrl);

    return data.private;
  } catch (error: any) {
    console.error("GitHub API Error:", error.response?.data || error.message);
    return true;
  }
}

export class Panel {
  public static currentPanel: Panel | undefined;
  private static readonly viewType = "easy-host";
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(
    panel: WebviewPanel,
    extensionUri: Uri,
    context: ExtensionContext
  ) {
    this._panel = panel;

    // Get workspace folders immediately
    const workspaceFolders =
      workspace.workspaceFolders?.map((folder) => ({
        name: folder.name,
        uri: folder.uri,
        path: folder.uri.fsPath,
      })) || [];

    // Send workspace folders to webview when it's ready
    this._panel.webview.onDidReceiveMessage(
      async (message: { command: string; body?: Config }) => {
        const { command, body } = message;

        if (command === "submit") {
          if (!body) {
            window.showErrorMessage("No configuration provided");
            return;
          }
          const workspaceFolders = workspace.workspaceFolders;

          if (!workspaceFolders) {
            window.showErrorMessage("No workspace folder found");
            return;
          }
          const workspacePath = workspaceFolders[0].uri.fsPath;
          const result = await fileGenerator(body, workspacePath);

          // Send the result back to the webview
          this._panel.webview.postMessage({
            command: "generation-result",
            ...result,
          });
        }

        if (command === "webview-ready") {
          // Send workspace folders structure
          const workspaceStructures = await Promise.all(
            workspaceFolders.map(async (folder) => ({
              name: folder.name,
              path: folder.path,
              subfolders: await getFolderStructure(folder.path),
            }))
          );

          this._panel.webview.postMessage({
            command: "set-workspaces",
            workspaceFolders: workspaceStructures,
          });

          // Send GitHub URIs separately
          const githubUris = await Promise.all(
            workspaceFolders.map(async (folder) => ({
              path: folder.path,
              uri: await getGitHubUri(folder.path),
            }))
          );

          this._panel.webview.postMessage({
            command: "set-github-uris",
            githubUris,
          });

          // Get repository privacy information
          const repoInfo = await Promise.all(
            githubUris.map(async ({ path, uri }) => ({
              path,
              uri,
              private: uri ? await getGitHubRepoInfo(uri) : null,
            }))
          );

          this._panel.webview.postMessage({
            command: "set-github-info",
            repoInfo,
          });
        }
      },
      undefined,
      this._disposables
    );

    // Set the HTML content
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // Handle panel disposal
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static render(extensionUri: Uri, context: ExtensionContext) {
    if (Panel.currentPanel) {
      Panel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        Panel.viewType,
        "EasyHost",
        ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/build"),
          ],
        }
      );

      Panel.currentPanel = new Panel(panel, extensionUri, context);
    }
  }

  public dispose() {
    Panel.currentPanel = undefined;
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.css",
    ]);
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            style-src ${webview.cspSource} 'unsafe-inline';
            script-src 'nonce-${nonce}' 'unsafe-inline';
            connect-src 'self' ${webview.cspSource};
            frame-src 'self' ${webview.cspSource};
            img-src ${webview.cspSource} https:;
          ">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>EasyHost</title>
        </head>
        <body style="padding: 32px;">
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
