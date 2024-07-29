import { MessageHandlerData } from '@estruyf/vscode';
import { join } from 'path';
import * as vscode from 'vscode';
import { ExtensionContext, ExtensionMode, Uri, Webview } from 'vscode';
import { createStoriesFiles, findReactTsxWithoutStories } from './utils';

export function activate(context: vscode.ExtensionContext) {
  let openWebviewDisposable = vscode.commands.registerCommand('vscode-storybookGPT.openWebview', () => {
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

      if (command === "GET_GLOBAL_STATE") {
        // Send a response back to the webview
        panel.webview.postMessage({
          command,
          requestId,
          payload: JSON.stringify({
            selectedModel: context.globalState.get('selectedModel'),
            excludePatterns: context.globalState.get('excludePatterns'),
          })
        } as MessageHandlerData<string>);
      } else if (command === "GET_DATA") {
        const filePaths = await findReactTsxWithoutStories(payload.excludePatterns.split('\n'));

        // Store data
        context.globalState.update('selectedModel', payload.selectedModel);
        context.globalState.update('excludePatterns', payload.excludePatterns);

        // Send a response back to the webview
        panel.webview.postMessage({
          command,
          requestId, // The requestId is used to identify the response
          payload: JSON.stringify(filePaths)
        } as MessageHandlerData<string>);
      } else if (command === "POST_DATA") {
        vscode.window.showInformationMessage('Calling chatGPT to generate stories...');
        // Check if OpenAI API key is set
        let openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
          // Try to get it from VS Code's credential storage
          openaiApiKey = await context.secrets.get('OPENAI_API_KEY');
          if (!openaiApiKey) {
            // Prompt user to input API key
            const inputApiKey = await vscode.window.showInputBox({
              prompt: 'Enter your OpenAI API Key',
              ignoreFocusOut: true,
              placeHolder: 'sk-...',
              password: true,
            });

            if (inputApiKey) {
              openaiApiKey = inputApiKey;
              // store the API key in VS Code's credential storage
              await context.secrets.store('OPENAI_API_KEY', inputApiKey);
            } else {
              vscode.window.showErrorMessage('OpenAI API Key is required to generate stories.');
              // Send a response back to the webview
              panel.webview.postMessage({ command: 'RESULT', result: {} });

              return;
            }
          }
        }
        await createStoriesFiles(JSON.parse(payload.msg), openaiApiKey, context.globalState.get('selectedModel'));

        vscode.window.showInformationMessage('Generation completed!');

        // Send a response back to the webview
        panel.webview.postMessage({ command: 'RESULT', result: {} });
      }
    }, undefined, context.subscriptions);

    panel.webview.html = getWebviewContent(context, panel.webview);
  });

  // Command to delete the API key from the secret storage
  let deleteApiKeyDisposable = vscode.commands.registerCommand('vscode-storybookGPT.deleteApiKey', async () => {
    const secretKey = 'OPENAI_API_KEY';
    try {
      await context.secrets.delete(secretKey);
      vscode.window.showInformationMessage(`Secret ${secretKey} has been deleted successfully.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete secret ${secretKey}: ${error instanceof Error ? error.message :
        'Unknown error'
        }`);
    }
  });


  // Command to reset the API key in the secret storage
  let resetApiKeyDisposable = vscode.commands.registerCommand('vscode-storybookGPT.resetApiKey', async () => {
    const secretKey = 'OPENAI_API_KEY';
    try {
      const inputApiKey = await vscode.window.showInputBox({
        prompt: 'Enter your new OpenAI API Key',
        ignoreFocusOut: true,
        placeHolder: 'sk-...',
        password: true,
      });

      if (inputApiKey) {
        await context.secrets.store(secretKey, inputApiKey);
        vscode.window.showInformationMessage(`Secret ${secretKey} has been reset successfully.`);
      } else {
        vscode.window.showErrorMessage('OpenAI API Key reset canceled.');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to reset secret ${secretKey}: ${error instanceof Error ? error.message :
        'Unknown error'
        }`);
    }
  });

  context.subscriptions.push(openWebviewDisposable, deleteApiKeyDisposable, resetApiKeyDisposable);
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
