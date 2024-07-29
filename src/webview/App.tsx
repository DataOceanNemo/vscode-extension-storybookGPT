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

export interface IAppProps {}

const models = [
  { label: "GPT-3.5 (default)", value: "gpt-3.5" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o-mini", value: "gpt-4o-mini" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-4-turbo", value: "gpt-4-turbo" },
];

const initialExcludePatterns = [
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

export const App: FunctionComponent<
  IAppProps
> = ({}: PropsWithChildren<IAppProps>) => {
  // const [message, setMessage] = useState<string>(JSON.stringify(mockData));
  const [message, setMessage] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);

  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [excludePatterns, setExcludePatterns] = useState(
    initialExcludePatterns.join("\n")
  );
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleExcludePatternsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setExcludePatterns(e.target.value);
  };

  const scan = () => {
    setMessage("");
    setScanning(true);
    messageHandler
      .request<string>("GET_DATA", { selectedModel, excludePatterns })
      .then((msg) => {
        setMessage(msg);
        setScanning(false);
      });
  };

  useEffect(() => {
    messageHandler.request<string>("GET_GLOBAL_STATE").then((msg) => {
      const { selectedModel, excludePatterns } = JSON.parse(msg);

      selectedModel && setSelectedModel(selectedModel);
      excludePatterns && setExcludePatterns(excludePatterns);
    });
  }, []);

  return (
    <div className="app">
      <h1>Welcome to storybookGPT</h1>

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
            <div className="settings__field">
              <label htmlFor="model-dropdown" className="settings__field-label">
                ChatGPT model to use:
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
        )}
      </div>

      <VSCodeDivider />

      {message && <FileTree files={JSON.parse(message)} />}
    </div>
  );
};
