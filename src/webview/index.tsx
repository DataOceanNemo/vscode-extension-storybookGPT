import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const elm = document.querySelector("#root");
if (elm) {
  const root = createRoot(elm); // createRoot(container!) if you use TypeScript
  root.render(<App />);
}

// Webpack HMR
// @ts-expect-error
if (import.meta.webpackHot) {
  // @ts-expect-error
  import.meta.webpackHot.accept();
}
