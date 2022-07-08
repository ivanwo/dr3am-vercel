import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

const App = () => {
  // Inside the Router, we have two paths beneath the header
  // Routes for when the user is authenticated, and Routes for them they're not.
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
