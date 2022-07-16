import React from "react";
import App from "./src/App";
import reactDom from "react-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./settings/msalConfig";
import { PublicClientApplication } from "@azure/msal-browser";

export const msalInstance = new PublicClientApplication(msalConfig);

reactDom.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
