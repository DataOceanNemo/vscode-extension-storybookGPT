import { MessageHandlerData } from '@estruyf/vscode';
import * as vscode from 'vscode';
import { createStoriesFiles, findReactTsxWithoutStories } from './utils';
import { MessageCommands } from './webview/utils/constants';

export interface IMessage {
  command: MessageCommands;
  requestId: string;
  payload: any;
}

export const customMessageHandlers = (panel: vscode.WebviewPanel, context: vscode.ExtensionContext) =>
  async (message: IMessage) => {
    const { command, requestId, payload } = message;

    switch (command) {
      case MessageCommands.GET_GLOBAL_STATE:
        panel.webview.postMessage({
          command,
          requestId,
          payload: JSON.stringify({
            selectedModel: context.globalState.get('selectedModel'),
            excludePatterns: context.globalState.get('excludePatterns'),
            template: context.globalState.get('template'),
          })
        } as MessageHandlerData<string>);
        break;

      case MessageCommands.SCAN:
        const filePaths = await findReactTsxWithoutStories(payload.excludePatterns.split('\n'));

        // Send a response back to the webview
        panel.webview.postMessage({
          command,
          requestId, // The requestId is used to identify the response
          payload: JSON.stringify(filePaths)
        } as MessageHandlerData<string>);
        break;

      case MessageCommands.STORE_DATA:
        // Store data
        payload.selectedModel && context.globalState.update('selectedModel', payload.selectedModel);
        payload.excludePatterns && context.globalState.update('excludePatterns', payload.excludePatterns);
        payload.template && context.globalState.update('template', payload.template);
        break;

      case MessageCommands.GENERATE_REQUEST:
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
              panel.webview.postMessage({ command: MessageCommands.GENERATE_RESULT, result: {} });

              return;
            }
          }
        }
        await createStoriesFiles(JSON.parse(payload.msg), openaiApiKey, context.globalState.get('template'), context.globalState.get('selectedModel'));

        vscode.window.showInformationMessage('Generation completed!');

        // Send a response back to the webview
        panel.webview.postMessage({ command: MessageCommands.GENERATE_RESULT, result: {} });
        break;

      default:
        break;
    }
  }