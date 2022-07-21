import React, { useEffect, useState } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { loginRequest, msalConfig } from "../settings/msalConfig";
import PrivateLandingPage from "./pages/PrivateLandingPage";
import PublicLandingPage from "./pages/PublicLandingPage";
import PrivateAboutPage from "./pages/PrivateAboutPage";
import DreamSubmitPage from "./pages/DreamSubmitPage";
import CurrentUserPage from "./pages/CurrentUserPage";
import DreamViewPage from "./pages/DreamViewPage";
import DreamFeedPage from "./pages/DreamFeedPage";
import UserViewPage from "./pages/UserViewPage";
import FooterNav from "./components/FooterNav";
import HeaderNav from "./components/HeaderNav";
import Dream from "./components/Dream";
import Modal from "./components/Modal";
import createNotificationSubscription from "./utilities/Utilities";

const env = window.location.host;
switch (env) {
  case "dr3am.space":
    msalConfig.apiUri = "https://api.dr3am.space";
    break;
  case "dev.dr3am.space":
    msalConfig.apiUri = "https://dev.api.dr3am.space";
    break;
  case "localhost:9500":
    msalConfig.apiUri = "http://localhost:3000";
    break;
  default:
    msalConfig.apiUri = "https://api.imdb.com";
    break;
}

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { instance } = useMsal();
  const { accounts } = useMsal();

  useEffect((_) => {
    createNotificationSubscription();
    // on load, no matter what page you're on check if the user is already logged in
    // if session exists in localstorage
    try {
      if (localStorage.idToken != null && localStorage.currentUser != null) {
        console.log("session exists");
        msalConfig.currentUser = JSON.parse(localStorage.currentUser);
        msalConfig.idToken = localStorage.idToken;
        // console.log(msalConfig.currentUser);
      } else {
        console.log("no session");
        // if session exists in memory (maybe not what we want? see above storage)
        if (msalConfig.idToken == "") {
          // let tempToken = "";
          instance
            .acquireTokenSilent({
              scopes: ["https://storage.azure.com/user_impersonation"],
              account: accounts[0],
            })
            .then((response) => {
              // tempToken = response.idToken;
              msalConfig.idToken = response.idToken;
              localStorage.setItem("idToken", response.idToken);
            })
            .then((nextResponse) => {
              let userData = fetch(`${msalConfig.apiUri}/user`, {
                method: "GET",
                headers: {
                  Authorization: `bearer ${msalConfig.idToken}`,
                },
              })
                .then((response) => response.json())
                .then((nextResponse) => {
                  if (nextResponse.signupcompleted) {
                    msalConfig.currentUser = nextResponse;
                    localStorage.setItem(
                      "currentUser",
                      JSON.stringify(nextResponse)
                    );
                  }
                });
            });
        } else console.log("? ? ?");
      }
    } catch {
      navigate(`../`);
    }
  }, []);
  // :)

  // Inside the Router, we have two paths beneath the header
  // Routes for when the user is authenticated, and Routes for them they're not.
  return (
    // <BrowserRouter>
    <HashRouter>
      <HeaderNav instance={instance} accounts={accounts} />
      <AuthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateLandingPage
                instance={instance}
                accounts={accounts}
                setModalVisible={setModalVisible}
              />
            }
          ></Route>
          <Route exact path="about" element={<PrivateAboutPage />}></Route>
          <Route
            exact
            path="feed"
            element={<DreamFeedPage instance={instance} accounts={accounts} />}
          ></Route>
          <Route
            exact
            path="me"
            element={
              <CurrentUserPage instance={instance} accounts={accounts} />
            }
          ></Route>
          <Route
            exact
            path="new"
            element={
              <DreamSubmitPage
                instance={instance}
                accounts={accounts}
                setModalVisible={setModalVisible}
              />
            }
          ></Route>
          <Route
            exact
            path="dream/*"
            element={<DreamViewPage instance={instance} accounts={accounts} />}
          ></Route>
          <Route
            exact
            path="user/*"
            element={
              <>
                <UserViewPage
                  instance={instance}
                  accounts={accounts}
                  setModalVisible={setModalVisible}
                />
                <Outlet />
              </>
            }
          ></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
        <FooterNav instance={instance} accounts={accounts} setModalVisible={setModalVisible}></FooterNav>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={
              <PublicLandingPage instance={instance} accounts={accounts} />
            }
          ></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
      </UnauthenticatedTemplate>
      {/* </BrowserRouter> */}
      <Modal modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </HashRouter>
  );
};

const PageNotFound = (_) => {
  return <h1>404 time babyyyy</h1>;
};

export default App;
