import React, { useEffect } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { loginRequest } from "../settings/msalConfig";

const App = () => {
  const { instance } = useMsal();
  const { accounts } = useMsal();
  //   instance.acquireTokenSilent()
  // Inside the Router, we have two paths beneath the header
  // Routes for when the user is authenticated, and Routes for them they're not.
  return (
    <BrowserRouter>
      <h1>
        <Link to="">D.S.</Link>
      </h1>
      <AuthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={<LoggedIn instance={instance} accounts={accounts} />}
          ></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={<LoggedOut instance={instance} accounts={accounts} />}
          ></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
      </UnauthenticatedTemplate>
      <FooterNav instance={instance} accounts={accounts}></FooterNav>
    </BrowserRouter>
  );
};

const LoggedIn = ({ instance, accounts }) => {
  // useEffect(_ => {
  //     instance.acquireTokenSilent({
  //         ...loginRequest(""),
  //         account: accounts[0],
  //       }).then(res => console.log(res))
  // }, []);

  let sendWebRequest = async (_) => {
    instance
      .acquireTokenSilent({
        // TODO: move scope get back to auth config?
        // TODO: determine scope for SA access tokens
        // TODO: enable api access on SA from app registration side
        // scopes: ["user_impersonation"],
        scopes: ["https://storage.azure.com/user_impersonation"],
        // scopes: ["User.Read"],
        account: accounts[0],
      })
      .then((response) => {
        let bearerHeader = `bearer ${response.idToken}`;
        console.log(response);
        // send fetch request with bearer token as "Authorization" header
        // possibly, Content-Type : application/json
        // TODO: set up api.dr3am.space subdomain at namecheap
        let data = fetch("https://api.dr3am.space/i", {
        // let data = fetch("http://localhost:3000/i", {
          method: "GET",
        //   mode: "no-cors",
          headers: {
            "Authorization": bearerHeader, // TODO: set jwt verification on the API side
            "Content-Type": "application/json",
          },
        //   body: JSON.stringify({ location: "detroit" }),
        }).then((response) => response.json());
      });
    // i'm interested in how the SA integration could go w/ file access, might need a
    // wrapper for that. or even better, an APIM policy?
  };
  return (
    <>
      <p>logged in as {accounts[0]?.idTokenClaims.given_name}</p>

      <button onClick={(_) => console.log(instance.getAllAccounts())}>
        who me
      </button>
      <button onClick={(_) => sendWebRequest()}>web request</button>
    </>
  );
};

const LoggedOut = ({ instance, accounts }) => {
  return <p>logged out</p>;
};

const PageNotFound = (_) => {
  return <h1>404 time babyyyy</h1>;
};

// TODO: conditional options based on if the user is logged in or not
const FooterNav = ({ instance, accounts }) => {
  // more options for a logged in user in the nav menu
  if (accounts[0])
    return (
      <nav id="navfooter">
        <Link to="about" className="footerlink">
          about
        </Link>
        <Link to="user" className="footerlink">
          {accounts[0]?.idTokenClaims.given_name}'s dreams
        </Link>
        <Link to="new" className="footerlink">
          new dream
        </Link>
        <a
          className="footerlink"
          //   onClick={(_) => instance.logoutPopup({ postLogoutRedirectUri: "/" })}
          onClick={(_) =>
            instance.logoutRedirect({ postLogoutRedirectUri: "/" })
          }
        >
          log out
        </a>
      </nav>
    );
  // not logged in, not many option
  else
    return (
      <nav id="navfooter">
        <a
          onClick={(_) => instance.loginPopup(loginRequest)}
          className="footerlink"
        >
          log in
        </a>
      </nav>
    );
};

export default App;
