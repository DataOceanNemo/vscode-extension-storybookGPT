import { messageHandler } from "@estruyf/vscode/dist/client";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react";
import * as React from "react";
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import FileTree from "./components/FileTree";
import "./styles.css";
import {
  defaultExcludePatterns,
  defaultTemplate,
  MessageCommands,
  models,
} from "./utils/constants";

export interface IAppProps {}

export const App: FunctionComponent<
  IAppProps
> = ({}: PropsWithChildren<IAppProps>) => {
  // const [message, setMessage] = useState<string>(JSON.stringify(mockData));
  const [message, setMessage] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);

  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [excludePatterns, setExcludePatterns] = useState(
    defaultExcludePatterns.join("\n")
  );
  const [template, setTemplate] = useState(defaultTemplate);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    messageHandler.send(MessageCommands.STORE_DATA, {
      selectedModel: e.target.value,
    });
  };

  const handleExcludePatternsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setExcludePatterns(e.target.value);
    messageHandler.send(MessageCommands.STORE_DATA, {
      excludePatterns: e.target.value,
    });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
    messageHandler.send(MessageCommands.STORE_DATA, {
      template: e.target.value,
    });
  };

  const scan = () => {
    setMessage("");
    setScanning(true);
    messageHandler
      .request<string>(MessageCommands.SCAN, { excludePatterns })
      .then((msg) => {
        setMessage(msg);
        setScanning(false);
      });
  };

  useEffect(() => {
    messageHandler
      .request<string>(MessageCommands.GET_GLOBAL_STATE)
      .then((msg) => {
        const { selectedModel, excludePatterns, template } = JSON.parse(msg);

        selectedModel && setSelectedModel(selectedModel);
        excludePatterns && setExcludePatterns(excludePatterns);
        template && setTemplate(template);
      });
  }, []);

  return (
    <div className="app">
      <h1>Welcome to storybookGPT</h1>

      <p>
        Inspired by{" "}
        <a href="https://storybook.js.org/blog/build-your-own-storybook-gpt/">
          https://storybook.js.org/blog/build-your-own-storybook-gpt/
        </a>
      </p>
      <p>
        This extension assists you in scanning your React .tsx components of
        current workspace and automates the generation of Storybook stories
        using OpenAI's GPT model gpt-3.5-turbo.
      </p>

      <div className="app__actions">
        <VSCodeButton appearance="primary" onClick={scan} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan"}
        </VSCodeButton>

        <VSCodeButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          appearance="secondary"
        >
          {isCollapsed ? "Show Settings" : "Hide Settings"}
        </VSCodeButton>
      </div>

      <div className="settings">
        {!isCollapsed && (
          <div className="settings__content">
            <div className="column">
              <div className="settings__field">
                <label
                  htmlFor="model-dropdown"
                  className="settings__field-label"
                >
                  ChatGPT model:
                </label>
                <VSCodeDropdown
                  id="model-dropdown"
                  onChange={handleModelChange}
                  value={selectedModel}
                >
                  {models.map((model) => (
                    <VSCodeOption key={model.value} value={model.value}>
                      {model.label}
                    </VSCodeOption>
                  ))}
                </VSCodeDropdown>
              </div>

              <div className="settings__field">
                <label className="settings__field-label">
                  Scan exclude patterns:
                </label>
                <VSCodeTextArea
                  value={excludePatterns}
                  onChange={handleExcludePatternsChange}
                  rows={10}
                  cols={50}
                  placeholder="Enter exclude patterns, one per line"
                />
              </div>
            </div>

            <div className="template-column">
              <div className="settings__field">
                <label className="settings__field-label">
                  Storybook template:
                </label>
                <VSCodeTextArea
                  value={template}
                  onChange={handleTemplateChange}
                  rows={14}
                  cols={50}
                  placeholder="Enter storybook template"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <VSCodeDivider />

      {message && <FileTree files={JSON.parse(message)} />}
    </div>
  );
};
