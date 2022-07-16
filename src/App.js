import React, { useEffect, useState } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { loginRequest } from "../settings/msalConfig";

const env = window.location.host;
let apiUri = "";
switch (env) {
  case "dr3am.space":
    apiUri = "https://api.dr3am.space";
    break;
  case "dev.dr3am.space":
    apiUri = "https://dev.api.dr3am.space";
    break;
  case "localhost:9500":
    apiUri = "http://localhost:3000";
    break;
  default:
    apiUri = "https://api.imdb.com";
    break;
}

const App = () => {
  const { instance } = useMsal();
  const { accounts } = useMsal();
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
            element={
              <PrivateLandingPage instance={instance} accounts={accounts} />
            }
          ></Route>
          <Route path="/about" element={<PrivateAboutPage instance={instance} accounts={accounts} />}></Route>
          <Route path="/feed" element={<DreamFeed instance={instance} accounts={accounts} />}></Route>
          <Route path="/me" element={<UserPage instance={instance} accounts={accounts} />}></Route>
          <Route path="/new" element={<DreamSubmitForm instance={instance} accounts={accounts} />}></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
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
      <FooterNav instance={instance} accounts={accounts}></FooterNav>
    </BrowserRouter>
  );
};
const PrivateAboutPage = ({ instance, accounts }) => {
    return(<><h1>about project</h1>
    <p>maybe i slap some graphs here?</p>
    <p>data reports from the last month?</p>
    <p>how to sleep and dream better?</p></>)
}
const PrivateLandingPage = ({ instance, accounts }) => {
  let sendWebRequest = async (_) => {
    instance
      .acquireTokenSilent({
        // TODO: move scope get back to auth config?
        // scopes: ["https://storage.azure.com/user_impersonation"],
        scopes: ["openid"],
        // scopes: ["User.Read"],
        account: accounts[0],
      })
      .then((response) => {
        let bearerHeader = `bearer ${response.idToken}`; // using idToken, need to adjust scope to get authToken
        console.log(response);
        // send fetch request with bearer token as "Authorization" header
        let data = fetch(`${apiUri}/i`, {
          method: "GET",
          headers: {
            Authorization: bearerHeader,
          },
        }).then((response) => response.json());
      });
  };
  return (
    <>
      <p>logged in as {accounts[0]?.idTokenClaims.given_name}</p>
      <p>until testing is concluded, all functionality will be displayed </p>
      <div className="random dream">
        <h3>random dream</h3>
        <p>think about how to implement this without opening the api...</p>
      </div>
      <div className="accountInformation">
        <h3>account information</h3>
      </div>
      <button onClick={(_) => console.log(instance.getAllAccounts())}>
        who me
      </button>
      <button onClick={(_) => sendWebRequest()}>web request</button>
    </>
  );
};
const DreamFeed = ({ instance, accounts }) => {
  let [dreamList, setDreamList] = useState([]);

  useEffect((_) => {
    populateDreamFeed();
  }, []);

  let populateDreamFeed = (_) => {
    console.log("loading feed");
    instance
      .acquireTokenSilent({
        // determine correct scope and parameterize from msalConfig
        scopes: ["https://storage.azure.com/user_impersonation"],
        account: accounts[0],
      })
      .then((response) => {
        let bearerHeader = `bearer ${response.idToken}`;
        //   TODO: edit parameters of url to specify which subset of dreams to load
        let submitResult = fetch(`${apiUri}/dreams`, {
          // let fetchResult = fetch("http://localhost:3000/dreams", {
          method: "GET",
          headers: {
            Authorization: bearerHeader, 
          },
        })
          .then((response) => response.json())
          .then((nextResponse) => setDreamList(nextResponse.dreams));
        // TODO: error handling around dream submit result
        //      201 -> created successfully, redirect to feed?
        //      500 -> server error, try again later
        //      400 -> exists already, too many requests, unauthorized, etc (auto logout?)
      });
  };

  return (
    <div className="dreamfeedholder">
      <h3>your dream feed</h3>
      <div className="dreamsortselector">
        <p>sort by:</p>
        <button>closest</button>
        <button>highest engagement</button>
        <button onClick={(_) => populateDreamFeed()}>refresh feed</button>
      </div>
      <div className="dreamfeed">
        {!dreamList ?(<></>): (
          dreamList.map((dreamObject) => (
            <div key={dreamObject.rowKey} className="dreamobject">
              <h5>{dreamObject.dreamtitle}</h5>
              <p>{dreamObject.location}</p>
              <p>{dreamObject.rowkey}</p>
              <p>{dreamObject.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
const DreamSubmitForm = ({ instance, accounts }) => {
  let [formData, setFormData] = useState({ location: "undefined" });
  let submitDream = async (event) => {
    event.preventDefault();
    console.log("submitting dream");
    instance
      .acquireTokenSilent({
        // determine correct scope and parameterize from msalConfig
        scopes: ["https://storage.azure.com/user_impersonation"],
        account: accounts[0],
      })
      .then((response) => {
        let bearerHeader = `bearer ${response.idToken}`;
        let submitResult = fetch(`${apiUri}/dream`, {
          // let submitResult = fetch("http://localhost:3000/dream", {
          method: "POST",
          headers: {
            Authorization: bearerHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // change to form data
        })
          .then((res) => res.json())
          .then((data) => console.log(data));
        // TODO: error handling around dream submit result
        //      201 -> created successfully, redirect to feed?
        //      500 -> server error, try again later
        //      400 -> exists already, too many requests, unauthorized, etc (auto logout?)
      });
  };
  let updateFormData = (event) => {
    let newFormData = { ...formData };
    newFormData[event.target.id] = event.target.value;
    setFormData({ ...newFormData });
  };
  let validateDream = (_) => {
    //
    // TODO: add route to api to determine timestamp of last dream submitted by user
    // edit: actually, we can just prevent the submit eve
  };
  return (
    <div className="dreamsubmitform">
      <h3>dream submit form</h3>
      <form onSubmit={submitDream}>
        <input onInput={updateFormData} id="dreamtitle"></input>
        <button>submit</button>
      </form>
    </div>
  );
};

const PublicLandingPage = ({ instance, accounts }) => {
  return (
    <div>
      <h1>DR3AM.SPACE</h1>
      <h2>hot dreams in your area</h2>
      <p>
        track your dreams, view free range local dreams, view collective
        unconscious trends!
      </p>
      <p>
        dr3am.space is a platform that will facilitate these and other
        activities.
      </p>
    </div>
  );
};

const UserPage = ({instance, accounts}) => {
    return <>me page</>
}

const PageNotFound = (_) => {
  return <h1>404 time babyyyy</h1>;
};

// TODO: conditional options based on if the user is logged in or not
const FooterNav = ({ instance, accounts }) => {
  let location = useLocation();

  // more options for a logged in user in the nav menu
  if (accounts[0])
    return (
      <nav id="navfooter">
        {/* <Link to="about" className={currentLocation == "/about" ? "footerlink activelink" : "footerlink"}> */}
        <Link to="about" className={"footerlink"+ (location.pathname == "/about" ? " activelink" : "")}>
          about
        </Link>
        <Link to="me" className={"footerlink"+ (location.pathname == "/me" ? " activelink" : "")}>
          {accounts[0]?.idTokenClaims.given_name}'s dreams
        </Link>
        <Link to="new" className={"footerlink"+ (location.pathname == "/new" ? " activelink" : "")}>
          new dream
        </Link>
        <Link to="feed" className={"footerlink"+ (location.pathname == "/feed" ? " activelink" : "")}>feed</Link>
        <a
          className="footerlink"
          onClick={(_) =>
            instance.logoutRedirect({ postLogoutRedirectUri: "/" })
          } // let user pick their own logout redirect? lmao
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
