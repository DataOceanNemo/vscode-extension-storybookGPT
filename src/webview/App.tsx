import { messageHandler } from "@estruyf/vscode/dist/client";
import * as React from "react";
import { FunctionComponent, PropsWithChildren, useState } from "react";
import FileTree from "./components/FileTree";
import "./styles.css";

export interface IAppProps {}

export const App: FunctionComponent<
  IAppProps
> = ({}: PropsWithChildren<IAppProps>) => {
  // const [message, setMessage] = useState<string>(JSON.stringify(mockData));
  const [message, setMessage] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const [selectedFilesCount, setSelectedFilesCount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const sendMessage = () => {
    messageHandler.send("POST_DATA", { msg: "Hello from the webview" });
  };

  const scan = () => {
    setMessage("");
    setScanning(true);
    messageHandler.request<string>("GET_DATA").then((msg) => {
      setMessage(msg);
      setScanning(false);
    });
  };

  return (
    <div className="app">
      <h1>Hello from the React Webview Starter</h1>

      <div className="app__actions">
        <button onClick={scan} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan"}
        </button>
        <button onClick={sendMessage} disabled={selectedFilesCount === 0}>
          Generate stories for selected {selectedFilesCount} files
        </button>
      </div>

      {message && <FileTree files={JSON.parse(message)} />}

      {error && (
        <p className="app__error">
          <strong>ERROR</strong>: {error}
        </p>
      )}
    </div>
  );
};
