import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import React from "react";

const App = () => {
  return (
    <>
      <h1>D.S.</h1>
      <AuthenticatedTemplate>
        <p>in</p>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <p>out</p>
      </UnauthenticatedTemplate>
    </>
  );
};

export default App;
