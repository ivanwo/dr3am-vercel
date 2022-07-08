import React from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loginRequest } from "../settings/msalConfig";

const App = () => {
  const { instance } = useMsal();
  const { accounts } = useMsal();
  // Inside the Router, we have two paths beneath the header
  // Routes for when the user is authenticated, and Routes for them they're not.
  return (
    <BrowserRouter>
      <h1>D.S.</h1>
      <AuthenticatedTemplate>
        <Routes>
          <Route path="/" element={<LoggedIn instance={instance} accounts={accounts} />}></Route>
        </Routes>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="/" element={<LoggedOut instance={instance} accounts={accounts} />}></Route>
        </Routes>
      </UnauthenticatedTemplate>
    </BrowserRouter>
  );
};

const LoggedIn = ({instance, accounts}) => {
  return (
    <>
      <p>logged in as {accounts[0]?.name}</p>
      <button onClick={(_) => instance.logoutPopup({ postLogoutRedirectUri: "/"})}>log out</button>
    </>
  );
};

const LoggedOut = ({instance, accounts}) => {
  return (
    <>
      <p>logged out</p>
      <button onClick={_ => instance.loginPopup(loginRequest)}>log in</button>
    </>
  );
};

export default App;
