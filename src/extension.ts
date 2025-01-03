import { commands, ExtensionContext } from "vscode";
import { Panel } from "./panels/panel";

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand("ez-deploy.run", () => {
    Panel.render(context.extensionUri, context);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
