import OpenAI from "openai";

export const template = `import type { Meta, StoryObj } from '@storybook/react';\n//import component\nconst meta: Meta<//type of component> = {\n title: //title of component,\n component: //component\n};\nexport default meta;\ntype Story = StoryObj<//type of component>;\nconst StoryTemplate: Story = {\n render: (args) => //render component\n};\nexport Primary = {\n ...StoryTemplate,\n args: {\n //component's props\n}\n}`;

export type ConvertType = {
  component: string;
  openaiApiKey: string;
};

export async function ComponentConverter({ component, openaiApiKey }: ConvertType) {
  const prompt = `Write a Storybook component from a React component, without any comments added.\nThis is the template I want you to use to create the storybook component, keep the provided format, add component variants if possible:\n${template}\n`;

  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
    temperature: 0.5,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.1,
    stream: false,
  });

  return response.choices[0].message.content;
}

// export async function ComponentConverter({ component }: ConvertType) {
//   const prompt = `Write a Storybook component from a React component, without any comments added.\nThis is the template I want you to use to create the storybook component, keep the provided format, add component variants if possible:\n${template}\n`;
//   console.log(prompt + component);
//   try {
//     const response = await fetch('http://localhost:11434/api/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'llama3',
//         prompt: prompt + component,
//         stream: false,
//         format: "json",
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Error response text:', errorText);
//       throw new Error(`Network response was not ok: ${response.statusText}`);
//     }

//     const data = await response.json();

//     console.log(data);

//     return data.response;
//   } catch (error) {
//     console.error('Error communicating with local Ollama LLM:', error);
//     throw new Error('Failed to generate storybook component');
//   }
// }
