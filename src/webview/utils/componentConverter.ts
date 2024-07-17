import OpenAI from "openai";

export const template = `import type { Meta, StoryObj } from '@storybook/react';\n//import component\nconst meta: Meta<//type of component> = {\n title: //title of component,\n component: //component\n};\nexport default meta;\ntype Story = StoryObj<//type of component>;\nconst StoryTemplate: Story = {\n render: (args) => //render component\n};\nexport Primary = {\n ...StoryTemplate,\n args: {\n //component's props\n}\n}`;

export type ConvertType = {
  component: string;
};

export async function ComponentConverter({ component }: ConvertType) {
  const prompt = `Write a Storybook component from a React component, without any comments added.\nThis is the template I want you to use to create the storybook component, keep the provided format, add component variants if possible:\n${template}\n`;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: component,
      },
    ],
    max_tokens: 2048,
    temperature: 0.5,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.1,
    stop: ["\n\n"],
  });

  return response.choices[0].message.content;
}
