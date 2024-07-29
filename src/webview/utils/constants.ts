
export const models = [
  { label: "GPT-3.5-turbo (default)", value: "gpt-3.5-turbo" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o-mini", value: "gpt-4o-mini" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-4-turbo", value: "gpt-4-turbo" },
];

export const defaultExcludePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/__tests__/**",
  "**/__mocks__/**",
  "**/__snapshots__/**",
  "**/test/**",
  "**/tests/**",
  "**/spec/**",
  "**/specs/**",
  "**/setupTests.tsx",
  "**/*.spec.tsx",
  "**/*.test.tsx",
  "**/*.docs.tsx",
  "**/*.e2e.tsx",
  "**/*.helper.tsx",
];

export const defaultTemplate = `import type { Meta, StoryObj } from '@storybook/react';\n//import component\n//import related type definitions\nconst meta: Meta<//type of component> = {\n title: //title of component,\n component: //component\n};\nexport default meta;\ntype Story = StoryObj<//type of component>;\nconst StoryTemplate: Story = {\n render: (args) => //render component\n};\nexport Primary = {\n ...StoryTemplate,\n args: {\n //component's props\n}\n}`;

export enum MessageCommands {
  GET_GLOBAL_STATE = 'GET_GLOBAL_STATE',
  SCAN = 'SCAN',
  STORE_DATA = 'STORE_DATA',
  GENERATE_REQUEST = 'GENERATE_REQUEST',
  GENERATE_RESULT = 'GENERATE_RESULT',
}

