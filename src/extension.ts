import { MessageHandlerData } from '@estruyf/vscode';
import { join } from 'path';
import * as vscode from 'vscode';
import { ExtensionContext, ExtensionMode, Uri, Webview } from 'vscode';
import { createStoriesFiles, findReactTsxWithoutStories } from './utils';

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('vscode-storybookGPT.openWebview', () => {
    const panel = vscode.window.createWebviewPanel(
      'react-webview',
      'storybookGPT',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.onDidReceiveMessage(async message => {
      const { command, requestId, payload } = message;

      if (command === "GET_DATA") {
        const filePaths = await findReactTsxWithoutStories();

        // Send a response back to the webview
        panel.webview.postMessage({
          command,
          requestId, // The requestId is used to identify the response
          payload: JSON.stringify(filePaths)
        } as MessageHandlerData<string>);
      } else if (command === "POST_DATA") {
        vscode.window.showInformationMessage('Calling chatGPT to generate stories...');
        await createStoriesFiles(JSON.parse(payload.msg));

        vscode.window.showInformationMessage('Generation completed!');
      }
    }, undefined, context.subscriptions);

    panel.webview.html = getWebviewContent(context, panel.webview);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }


const getWebviewContent = (context: ExtensionContext, webview: Webview) => {
  const jsFile = "webview.js";
  const localServerUrl = "http://localhost:9000";

  let scriptUrl = null;
  let cssUrl = null;

  const isProduction = context.extensionMode === ExtensionMode.Production;
  if (isProduction) {
    scriptUrl = webview.asWebviewUri(Uri.file(join(context.extensionPath, 'dist', jsFile))).toString();
  } else {
    scriptUrl = `${localServerUrl}/${jsFile}`;
  }

  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ''}
	</head>
	<body>
		<div id="root"></div>

		<script src="${scriptUrl}"></script>
	</body>
	</html>`;
}
