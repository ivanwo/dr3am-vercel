import React, {useEffect} from "react";
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
//   instance.acquireTokenSilent()
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
    // useEffect(_ => {
    //     instance.acquireTokenSilent({
    //         ...loginRequest(""),
    //         account: accounts[0],
    //       }).then(res => console.log(res))
    // }, []);

    let sendWebRequest = _ => {
        instance.acquireTokenSilent({
            ...loginRequest(),
            account: accounts[0],
          }).then(response => {
            let bearerHeader = `bearer ${response.accessToken}`;
            // send fetch request with bearerHeader as "Authorization" header
            // possibly, Content-Type : application/json
            // i'm interested in how the SA integration could go w/ file access, might need a 
            // wrapper for that. or even better, an APIM policy?
          })
    }
  return (
    <>
      <p>logged in as {accounts[0]?.username}</p>
      <button onClick={(_) => instance.logoutPopup({ postLogoutRedirectUri: "/"})}>log out</button>
      <button onClick={_ => console.log(accounts[0])}>who me</button>
      <button onClick={_ => sendWebRequest()}>web request</button>
      <p id="footer">footer</p>
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
