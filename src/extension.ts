import { commands, ExtensionContext } from "vscode";
import { Panel } from "./panels/panel";

export function activate(context: ExtensionContext) {
  // Add command to the extension context
  context.subscriptions.push(
    commands.registerCommand("ez-deploy.run", () => {
      Panel.render(context.extensionUri);
    })
  );
}
