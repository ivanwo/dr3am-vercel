import React, { useEffect, useState } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
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
      <HeaderNav instance={instance} accounts={accounts} />
      <AuthenticatedTemplate>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateLandingPage
                instance={instance}
                accounts={accounts}
              />
            }
          ></Route>
          <Route
            path="/about"
            element={
              <PrivateAboutPage instance={instance} accounts={accounts} />
            }
          ></Route>
          <Route
            path="/feed"
            element={<DreamFeed instance={instance} accounts={accounts} />}
          ></Route>
          <Route
            path="/me"
            element={<UserPage instance={instance} accounts={accounts} />}
          ></Route>
          <Route
            path="/new"
            element={
              <DreamSubmitForm instance={instance} accounts={accounts} />
            }
          ></Route>
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
    </BrowserRouter>
  );
};
const PrivateAboutPage = ({ instance, accounts }) => {
  return (
    <>
      <h1>about project</h1>
      <p>maybe i slap some graphs here?</p>
      <p>data reports from the last month?</p>
      <p>how to sleep and dream better?</p>
      <FooterNav instance={instance} accounts={accounts}></FooterNav>
    </>
  );
};
const PrivateLandingPage = ({ instance, accounts}) => {
  let [token, setToken] = useState({});
  let [usernameIsFree, setUsernameIsFree] = useState(false);
  let [completeUser, setCompleteUser] = useState(false);
  let [currentUser, setCurrentUser] = useState({signupcompleted:false});
  let [formData, setFormData] = useState({
    RowKey: accounts[0].localAccountId,
    region: "detroit",
    username: "",
    termsofservice: "",
    adultuser: "",
  });
  useEffect((_) => {
    // get token when the user first gets to the page
    let tempToken = "";
    instance
      .acquireTokenSilent({
        // determine correct scope and parameterize from msalConfig
        scopes: ["https://storage.azure.com/user_impersonation"],
        account: accounts[0],
      })
      .then((response) => {
        console.log(response);
        tempToken = response.idToken;
        setToken(response.idToken);
      }).then(nextResponse => {
        let userData = fetch(`${apiUri}/user`, {
          method: "GET", 
          headers: {
            Authorization: `bearer ${tempToken}` // has to be temp token because react's state setting is too slow for this shit lol
          }
        }).then((response) => response.json())
        .then((nextResponse) => setCurrentUser(nextResponse));
      });
    // if it expires, take them back out and give them a notification about that
    // use new token to check if user account is completed. if not, show them the form
  }, []);

  let requestAccountCreation = (event) => {
    event.preventDefault();
    // if username isn't free don't bother submitting form to back end
    if (!usernameIsFree) {
      alert("please choose free and valid username");
      return;
    }
    // check region
    // check if they agreed to the TOS
    if (!formData.termsofservice) {
      alert("you must swear the oath to use the service");
      return;
    }
    if (!formData.adultuser) {
      alert("you cannot be a child here");
      return;
    }
    // submit to back end for approval
    console.log("valid form configuration, submitting to api");
    let submitResult = fetch(`${apiUri}/user`, {
      // let fetchResult = fetch("http://localhost:3000/dreams", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // change to form data
    })
      .then((response) => response.json())
      .then((nextResponse) => {
        console.log(nextResponse);
      }).then(anotherResponse => {
        let userData = fetch(`${apiUri}/user`, {
        method: "GET", 
        headers: {
          Authorization: `bearer ${token}` // has to be temp token because react's state setting is too slow for this shit lol
        }
      }).then((response) => response.json())
      .then((nextResponse) => setCurrentUser(nextResponse));
    });
  };

  let checkUsername = (_) => {
    let problem = false;
    if (formData.username.length < 4 || formData.username.length > 10) {
      // TODO: build out alert utility class
      alert("username must be 4-10 characters");
      problem = true;
    }
    if (/[^a-zA-Z0-9]/.test(formData.username)) {
      alert("username cannot contain special characters");
      problem = true;
    }
    // don't waste time checking a bad username with the back end
    if (!problem) {
      let submitResult = fetch(`${apiUri}/username/${formData.username}`, {
        // let fetchResult = fetch("http://localhost:3000/dreams", {
        method: "GET",
        headers: {
          Authorization: `bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((nextResponse) => {
          if (nextResponse.status) {
            setUsernameIsFree(true);
            alert("username is valid and available!");
          } else {
            setUsernameIsFree(false);
            alert("username is already taken");
          }
        });
    } else setUsernameIsFree(false);
  };

  let updateFormData = (event) => {
    console.log(`${event.target.id} : ${event.target.value}`);
    // if it's the username check if it's taken
    if (event.target.id == "username") {
      // TODO: auto check if username is taken
    }
    // in all cases, update form data
    let newFormData = { ...formData };
    // fucking checkboxes work differently i guess, their value attribute ALWAYS RETURNS ON whether they're checked or not...
    if (event.target.type == "checkbox")
      newFormData[event.target.id] = event.target.checked;
    else newFormData[event.target.id] = event.target.value;
    setFormData({ ...newFormData });
  };

  // TODO: this is where the beta code would be validated!!!!
  return (
    <>
    <button onClick={_ => console.log(currentUser)}>current user</button>
      {currentUser.signupcompleted ? (
        <>
          <div>
            <h3>account is fully completed</h3>
          </div>
          <FooterNav instance={instance} accounts={accounts}></FooterNav>
        </>
      ) : (
        <div>
          <h3>email validated!</h3>
          <p>
            we just need a couple more factoids before we can set your
            unconscious free
          </p>
          <button onClick={_ => console.log(token)}>me token</button>
          <button onClick={(_) => console.log(accounts[0])}>who me</button>
          <button onClick={(_) => console.log(formData)}>form data</button>
          <form onSubmit={requestAccountCreation} id="accountform">
            <label>
              username:{" "}
              <input
                id="username"
                onChange={updateFormData}
                className={usernameIsFree ? "usernamevalid" : "usernameinvalid"}
              ></input>
              <button onClick={(_) => checkUsername()} type="button">
                check username
              </button>
            </label>
            {/* TODO: replace drop down selector with a location service auto-mapping. */}
            <label>
              conscious region:
              <select id="region" onChange={updateFormData}>
                <option value="detroit" selected>
                  detroit
                </option>
                <option value="traverse city">traverse city</option>
                <option value="holland">holland</option>
              </select>
            </label>
            <label title="tough shit, idiot!">don't see your region?</label>
            <label>
              i have read and agree to the{" "}
              <a href="https://www.google.com/search?client=firefox-b-1-d&q=how+to+write+a+terms+of+service+agreement+for+a+website">
                terms of service
              </a>
              <input
                type="checkbox"
                id="termsofservice"
                onChange={updateFormData}
              ></input>
            </label>
            <label>
              i am 18 years of age or older
              <input
                type="checkbox"
                id="adultuser"
                onChange={updateFormData}
              ></input>
            </label>
            <button onClick={requestAccountCreation}>sign me up!</button>
            <button
              onClick={(_) =>
                console.log("i should remove this before i'm done")
              }
              type="button"
            >
              never mind, i've changed my mind
            </button>
          </form>
        </div>
      )}
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
        {!dreamList ? (
          <></>
        ) : (
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
      <FooterNav instance={instance} accounts={accounts}></FooterNav>
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
      <FooterNav instance={instance} accounts={accounts}></FooterNav>
    </div>
  );
};

const PublicLandingPage = ({ instance, accounts }) => {
  return (
    <div>
      <h2>hot dreams in your area!!</h2>
      <p>
        track your dreams, view free range local dreams, view collective
        unconscious trends!
      </p>
      <p>
        dr3am.space is a platform that will facilitate these and other
        activities.
      </p>
      <div className="random dream">
        <h3>random dream</h3>
        <p>think about how to implement this without opening the api...</p>
      </div>
      <a
        onClick={(_) => instance.loginPopup(loginRequest)}
        className="footerlink"
      >
        log in/ sign up
      </a>
    </div>
  );
};

const UserPage = ({ instance, accounts }) => {
  return <>me page</>;
};

const PageNotFound = (_) => {
  return <h1>404 time babyyyy</h1>;
};

const HeaderNav = ({ instance, accounts }) => {
  let location = useLocation();
  return (
    <h1>
      <Link to="/" className={location.pathname == "/" ? "activelogo" : ""}>
        DR3AM.SPACE
      </Link>
    </h1>
  );
};

const FooterNav = ({ instance, accounts }) => {
  let location = useLocation();

  return (
    <nav id="navfooter">
      <Link
        to="about"
        className={
          "footerlink" + (location.pathname == "/about" ? " activelink" : "")
        }
      >
        about
      </Link>
      <Link
        to="me"
        className={
          "footerlink" + (location.pathname == "/me" ? " activelink" : "")
        }
      >
        {accounts[0]?.idTokenClaims.given_name}'s dreams
      </Link>
      <Link
        to="new"
        className={
          "footerlink" + (location.pathname == "/new" ? " activelink" : "")
        }
      >
        new dream
      </Link>
      <Link
        to="feed"
        className={
          "footerlink" + (location.pathname == "/feed" ? " activelink" : "")
        }
      >
        feed
      </Link>
      <a
        className="footerlink"
        onClick={(_) => instance.logoutRedirect({ postLogoutRedirectUri: "/" })} // let user pick their own logout redirect? lmao
      >
        log out
      </a>
    </nav>
  );
};

export default App;
