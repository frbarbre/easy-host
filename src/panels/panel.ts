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

export class Panel {
  public static currentPanel: Panel | undefined;
  private static readonly viewType = "ez-deploy";
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

        if (command === "webview-ready") {
          // Get folder structure for each workspace
          const workspaceStructures = await Promise.all(
            workspaceFolders.map(async (folder) => ({
              name: folder.name,
              path: folder.path,
              subfolders: await getFolderStructure(folder.path),
            }))
          );

          // Send workspace folders and their structures to webview
          this._panel.webview.postMessage({
            command: "set-workspaces",
            workspaceFolders: workspaceStructures,
          });
        }

        if (command === "submit") {
          if (!body) {
            window.showErrorMessage("No configuration provided");
            return;
          }
          const workspaceFolders = workspace.workspaceFolders;

          console.log(workspaceFolders);
          if (!workspaceFolders) {
            window.showErrorMessage("No workspace folder found");
            return;
          }
          const workspacePath = workspaceFolders[0].uri.fsPath;
          await fileGenerator(body, workspacePath);
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
        "EZ Deploy",
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
          <title>EZ Deploy</title>
        </head>
        <body style="padding: 32px;">
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
