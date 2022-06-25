import { CssBaseline } from "@mui/material";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./app";
import { StateProvider } from "./contexts/state";

ReactDOM.render(
  <StateProvider>
    <CssBaseline />
    <App />
  </StateProvider>,
  document.body
);
