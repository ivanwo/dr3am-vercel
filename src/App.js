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
import PrivateLandingPage from "./pages/PrivateLandingPage";
import PublicLandingPage from "./pages/PublicLandingPage";
import PrivateAboutPage from "./pages/PrivateAboutPage";
import DreamSubmitPage from "./pages/DreamSubmitPage";
import CurrentUserPage from "./pages/CurrentUserPage";
import { msalConfig } from "../settings/msalConfig";
import React, { useEffect, useState } from "react";
import DreamViewPage from "./pages/DreamViewPage";
import DreamFeedPage from "./pages/DreamFeedPage";
import UserViewPage from "./pages/UserViewPage";
import FooterNav from "./components/FooterNav";
import HeaderNav from "./components/HeaderNav";
import Dream from "./components/Dream";
import Modal from "./components/Modal";

// const env = window.location.host;
switch (window.location.host) {
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
    // on load, no matter what page you're on check if the user is already logged in
    // if session exists in localstorage
    try {
      if (localStorage.idToken != null && localStorage.currentUser != null) {
        console.log("session exists");
        msalConfig.currentUser = JSON.parse(localStorage.currentUser);
        msalConfig.idToken = localStorage.idToken;
        console.log(msalConfig.currentUser);
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
  // Inside the Router, we have two paths beneath the header
  // Routes for when the user is authenticated, and Routes for them they're not.
  return (
    // <BrowserRouter>
    <HashRouter>
      <HeaderNav />
      <AuthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={<PrivateLandingPage setModalVisible={setModalVisible} />}
          ></Route>
          <Route exact path="about" element={<PrivateAboutPage />}></Route>
          <Route exact path="feed" element={<DreamFeedPage />}></Route>
          <Route exact path="me" element={<CurrentUserPage />}></Route>
          <Route
            exact
            path="new"
            element={<DreamSubmitPage setModalVisible={setModalVisible} />}
          ></Route>
          <Route exact path="dream/*" element={<DreamViewPage />}></Route>
          <Route
            exact
            path="user/*"
            element={<UserViewPage setModalVisible={setModalVisible} />}
          ></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
        <FooterNav setModalVisible={setModalVisible}></FooterNav>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="/" element={<PublicLandingPage />}></Route>
          <Route
            exact
            path="dream/*"
            element={
              <div className="userpage">
                <h3>you must log in to view dreams</h3>
                <button
                  onClick={(_) => {
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                      navigator.userAgent
                    )
                      ? instance.loginRedirect(loginRequest)
                      : instance.loginPopup(loginRequest);
                  }}
                  className="loginbutton"
                >
                  log in/ sign up
                </button>
              </div>
            }
          ></Route>
          <Route
            exact
            path="user/*"
            element={
              <div className="userpage">
                <h3>you must log in to view users</h3>
                <button
                  onClick={(_) => {
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                      navigator.userAgent
                    )
                      ? instance.loginRedirect(loginRequest)
                      : instance.loginPopup(loginRequest);
                  }}
                  className="loginbutton"
                >
                  log in/ sign up
                </button>
              </div>
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
