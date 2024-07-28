import * as path from 'path';
import { relative } from 'path';
import * as vscode from 'vscode';
import { ComponentConverter } from './webview/utils/componentConverter';

const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/__tests__/**',
  '**/__mocks__/**',
  '**/__snapshots__/**',
  '**/test/**',
  '**/tests/**',
  '**/spec/**',
  '**/specs/**',
  '**/setupTests.tsx',
  '**/*.spec.tsx',
  '**/*.test.tsx',
  '**/*.docs.tsx',
  '**/*.e2e.tsx',
  '**/*.helper.tsx',
];

// Get the workspace root path
const workspaceFolder = vscode.workspace.workspaceFolders ? path.posix.normalize(vscode.workspace.workspaceFolders[0].uri.fsPath) : '';

export const findReactTsxWithoutStories = async () => {
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


export const createStoriesFiles = async (fileNodes: string[]) => {
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
        });

        const textEncoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(storyFileUri, textEncoder.encode(story || ''));

      } catch (err) {
        console.log(err);
        vscode.window.showErrorMessage(`Error processing file: ${filePath}`);
      }
    }
  }
};