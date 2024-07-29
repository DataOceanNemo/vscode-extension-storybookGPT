import * as vscode from 'vscode';
import { customMessageHandlers } from './messaging';
import { getWebviewContent } from './utils';

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

    // define the message handlers
    panel.webview.onDidReceiveMessage(customMessageHandlers(panel, context), undefined, context.subscriptions);

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
