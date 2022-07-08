import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

const App = () => {
  return (
    <BrowserRouter>
      <h1>D.S.</h1>
      <AuthenticatedTemplate>
        <Routes>
          <Route path="/" element={<p>logged in</p>}></Route>
        </Routes>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="/" element={<p>logged out</p>}></Route>
        </Routes>
      </UnauthenticatedTemplate>
    </BrowserRouter>
  );
};

export default App;
