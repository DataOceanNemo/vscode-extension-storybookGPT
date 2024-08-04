import * as path from 'path';
import { join, relative } from 'path';
import * as vscode from 'vscode';
import { ExtensionContext, ExtensionMode, Uri, Webview } from 'vscode';
import { ComponentConverter } from './webview/utils/componentConverter';


// Get the workspace root path
const workspaceFolder = vscode.workspace.workspaceFolders ? path.posix.normalize(vscode.workspace.workspaceFolders[0].uri.fsPath) : '';

export const findReactTsxWithoutStories = async (excludePatterns: string[]) => {
  // Search for all .tsx files excluding .stories.tsx and .test.tsx
  const allComponents = await vscode.workspace.findFiles('**/*.tsx', `{${excludePatterns.join(',')},**/*.stories.*}`);
  const allStories = await vscode.workspace.findFiles('**/*.stories.{tsx,ts}', `{${excludePatterns.join(',')}}`);

  // Normalize paths and prepare to check for missing stories
  let storyComponents = new Set();
  allStories.forEach(storyFile => {
    const normalizedPath = storyFile.fsPath.replace(/\.stories\.(tsx|ts)$/, '.tsx');
    storyComponents.add(normalizedPath);
  });

  // Filter components without corresponding stories
  const componentsWithoutStories = allComponents.filter(component =>
    !storyComponents.has(component.fsPath)
  );

  // Calculate relative paths
  const filePaths = componentsWithoutStories.map(file => relative(workspaceFolder, (file as vscode.Uri).fsPath).replace(/\\/g, '/'));

  return filePaths;
}


export const createStoriesFiles = async (fileNodes: string[], openaiApiKey: string, template = "", selectedModel = 'gpt-3.5-turbo') => {
  for (const node of fileNodes) {
    if (node.endsWith('.tsx')) {
      const filePath = path.resolve(workspaceFolder, node);
      const storyFilePath = filePath.replace(/\.tsx$/, '.stories.tsx');

      try {
        const fileUri = vscode.Uri.file(filePath);
        const storyFileUri = vscode.Uri.file(storyFilePath);

        const fileContent = await vscode.workspace.fs.readFile(fileUri);

        // Convert Uint8Array to string using TextDecoder
        const textDecoder = new TextDecoder('utf-8');
        const fileContentString = textDecoder.decode(fileContent);

        const story = await ComponentConverter({
          component: fileContentString,
          openaiApiKey: openaiApiKey,
          selectedModel,
          template
        });

        const textEncoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(storyFileUri, textEncoder.encode(story || ''));

      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(`Error processing file: ${filePath}. Error message: : ${error instanceof Error ? error.message :
          'Unknown error'
          }`);
      }
    }
  }
};


export const getWebviewContent = (context: ExtensionContext, webview: Webview) => {
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
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
		${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ''}
	</head>
	<body>
		<div id="root"></div>

		<script src="${scriptUrl}"></script>
	</body>
	</html>`;
}
