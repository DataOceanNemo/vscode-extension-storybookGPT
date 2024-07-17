import { relative } from 'path';
import * as vscode from 'vscode';

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
];

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

  // Get the workspace root path
  const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

  // Calculate relative paths
  const filePaths = componentsWithoutStories.map(file => relative(workspaceFolder, (file as vscode.Uri).fsPath));

  return filePaths;
}