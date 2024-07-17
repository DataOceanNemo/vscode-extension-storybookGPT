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
      <h1>Welcome to storybookGPT</h1>

      <div className="app__actions">
        <button onClick={scan} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan"}
        </button>
      </div>

      {message && <FileTree files={JSON.parse(message)} />}
    </div>
  );
};
