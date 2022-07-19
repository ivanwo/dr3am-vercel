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
  const [modalVisible, setModalVisible] = useState(false);
  const { instance } = useMsal();
  const { accounts } = useMsal();

  useEffect((_) => {
    // on load, no matter what page you're on check if the user is already logged in
    // if session exists in localstorage
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
            let userData = fetch(`${apiUri}/user`, {
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
  }, []);
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
              <PrivateLandingPage instance={instance} accounts={accounts} setModalVisible={setModalVisible}/>
            }
          ></Route>
          <Route
            exact
            path="about"
            element={
              <PrivateAboutPage instance={instance} accounts={accounts} />
            }
          ></Route>
          <Route
            exact
            path="feed"
            element={<DreamFeed instance={instance} accounts={accounts} />}
          ></Route>
          <Route
            exact
            path="me"
            element={<UserPage instance={instance} accounts={accounts} />}
          ></Route>
          <Route
            exact
            path="new"
            element={
              <DreamSubmitForm instance={instance} accounts={accounts} />
            }
          ></Route>
          <Route
            exact
            path="dream/*"
            element={
              <>
                <DreamPage instance={instance} accounts={accounts} />
                <Outlet />
              </>
            }
          ></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
        <FooterNav
          instance={instance}
          accounts={accounts}
          setModalVisible={setModalVisible}
        ></FooterNav>
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

const PrivateAboutPage = ({ instance, accounts }) => {
  return (
    <>
      <h1>about project</h1>
      <p>maybe i slap some graphs here?</p>
      <p>data reports from the last month?</p>
      <p>how to sleep and dream better?</p>
    </>
  );
};

const PrivateLandingPage = ({ instance, accounts, setModalVisible }) => {
  let [token, setToken] = useState({});
  let [usernameIsFree, setUsernameIsFree] = useState(false);
  let [completeUser, setCompleteUser] = useState(false);
  let [currentUser, setCurrentUser] = useState({ signupcompleted: null });
  let [formData, setFormData] = useState({
    RowKey: accounts[0].localAccountId,
    region: "detroit",
    username: "",
    termsofservice: "",
    adultuser: "",
  });
  // TODO: move this up to the root app level
  useEffect((_) => {
    // get token when the user first gets to the page
    let tempToken = "";
    if (!msalConfig.idToken == "") {
      setToken(msalConfig.idToken);
      setCompleteUser(true);
      setCurrentUser(msalConfig.currentUser);
    } else
      instance
        .acquireTokenSilent({
          // determine correct scope and parameterize from msalConfig
          scopes: ["https://storage.azure.com/user_impersonation"],
          account: accounts[0],
        })
        .then((response) => {
          console.log(response);
          tempToken = response.idToken;
          msalConfig.idToken = response.idToken;
          localStorage.setItem("idToken", response.idToken);
          setToken(response.idToken);
        })
        .then((nextResponse) => {
          let userData = fetch(`${apiUri}/user`, {
            method: "GET",
            headers: {
              Authorization: `bearer ${tempToken}`, // has to be temp token because react's state setting is too slow for this shit lol
            },
          })
            .then((response) => response.json())
            .then((nextResponse) => {
              if (nextResponse.signupcompleted)
                msalConfig.currentUser = nextResponse;
              setCurrentUser(nextResponse);
              localStorage.setItem("currentUser", JSON.stringify(nextResponse));
            });
        });
    // if it expires, take them back out and give them a notification about that
    // use new token to check if user account is completed. if not, show them the form
  }, []);

  let requestAccountCreation = (event) => {
    event.preventDefault();
    // if username isn't free don't bother submitting form to back end
    if (!usernameIsFree) {
      // alert("please choose free and valid username");
      msalConfig.modal.title = "please choose a valid and free username";
      setModalVisible(true);
      return;
    }
    // check region
    // check if they agreed to the TOS
    if (!formData.termsofservice) {
      // alert("you must swear the oath to use the service");
      msalConfig.modal.title = "you must swear the oath to use the service";
      setModalVisible(true);
      return;
    }
    if (!formData.adultuser) {
      // alert("you cannot be a child here");
      msalConfig.modal.title = "you cannot be a child here";
      setModalVisible(true);
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
      })
      .then((anotherResponse) => {
        let userData = fetch(`${apiUri}/user`, {
          method: "GET",
          headers: {
            Authorization: `bearer ${token}`, // has to be temp token because react's state setting is too slow for this shit lol
          },
        })
          .then((response) => response.json())
          .then((nextResponse) => {
            if (nextResponse.signupcompleted) {
              msalConfig.currentUser = nextResponse;
              setCurrentUser(nextResponse);
              localStorage.setItem("currentUser", JSON.stringify(nextResponse));
            }
          });
      });
  };

  let checkUsername = (_) => {
    let problem = false;
    if (formData.username.length < 4 || formData.username.length > 10) {
      // TODO: build out alert utility class
      // alert("username must be 4-10 characters");
      msalConfig.modal.title = "username must be 4-10 characters";
      setModalVisible(true);
      problem = true;
    }
    if (/[^a-zA-Z0-9]/.test(formData.username)) {
      // alert("username cannot contain special characters");
      msalConfig.modal.title = "username cannot contain special characters";
      setModalVisible(true);
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

      msalConfig.modal.title = "username is valid and available!";
      setModalVisible(true);
            // alert("username is valid and available!");
          } else {
            setUsernameIsFree(false);
      msalConfig.modal.title = "username is already taken";
      setModalVisible(true);
            // alert("username is already taken");
          }
        });
    } else setUsernameIsFree(false);
  };

  let updateFormData = (event) => {
    // console.log(`${event.target.id} : ${event.target.value}`);
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
  if (currentUser.signupcompleted == null) return <>loading...</>;
  else
    return (
      <>
        {/* <button onClick={(_) => console.log(currentUser)}>current user</button> */}
        {currentUser.signupcompleted ? (
          <>
            <div>
              <h3>
                account is fully completed! feel free to use the options on the
                nav below
              </h3>
              <h4>news element?</h4>
              <ul>
                <li>new features</li>
                <li>patching schedule</li>
                <li>optimizations</li>
              </ul>
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
            <form onSubmit={requestAccountCreation} id="accountform">
              <label>
                username:{" "}
                <input
                  id="username"
                  onChange={updateFormData}
                  className={
                    usernameIsFree ? "usernamevalid" : "usernameinvalid"
                  }
                ></input>
                <button onClick={(_) => checkUsername()} type="button">
                  check username
                </button>
              </label>
              {/* TODO: replace drop down selector with a location service auto-mapping. */}
              <label>
                conscious region:
                <select id="region" onChange={updateFormData}>
                  <option value="detroit" defaultValue={true}>
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
const DreamPage = ({ instance, accounts }) => {
  let [dreamId, setDreamId] = useState(
    // for browserrouter
    // window.location.pathname.replace("/dream/", "")
    // for hashrouter
    window.location.href.split("/")[window.location.href.split("/").length - 1]
  );
  let [dreamContent, setDreamContent] = useState({});

  useEffect((_) => {
    instance
      .acquireTokenSilent({
        // determine correct scope and parameterize from msalConfig
        scopes: ["https://storage.azure.com/user_impersonation"],
        account: accounts[0],
      })
      .then((response) => {
        let bearerHeader = `bearer ${response.idToken}`;
        let userData = fetch(`${apiUri}/dream/${dreamId}`, {
          method: "GET",
          headers: {
            Authorization: bearerHeader,
          },
        })
          .then((response) => response.json())
          .then((nextResponse) => {
            setDreamContent(nextResponse);
          });
      });
  }, []);

  return (
    <div>
      <Link to="/feed">
        <h4>
          <b className="bigbold">⬅</b> back to feed
        </h4>
      </Link>
      {/* <h1>individual dream page</h1> */}
      {dreamContent.rowKey == null ? (
        <p>loading...</p>
      ) : (
        <div>
          <table className="datatable">
            <thead>
              <tr>
                <th>key</th>
                <th>value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(dreamContent).map((key) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{dreamContent[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
        {dreamList.length == 0 ? (
          <p>loading...</p>
        ) : (
          dreamList.map((dreamObject) => (
            <div key={dreamObject.rowKey} className="dreamobject">
              <div className="bottomborder">
                <div className="dreamheader">
                  <p>{dreamObject.user} </p>
                  <p>{dreamObject.location}</p>
                  <Link to={"../dream/" + dreamObject.rowKey}>
                    {dreamObject.rowKey}
                  </Link>
                </div>
              </div>
              <div className="bottomborder">
                <div className="dreamheader">
                  <h4 className="dreammood">{dreamObject.mood}</h4>
                  <h3 className="dreamtitle">{dreamObject.dreamtitle} </h3>
                </div>
              </div>
              <p>{dreamObject.dreamcontent}</p>
              <p>{dreamObject.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DreamSubmitForm = ({ instance, accounts }) => {
  let navigate = useNavigate();
  let [formData, setFormData] = useState({
    location: msalConfig.currentUser.region,
    mood: "🤮",
    user: msalConfig.currentUser.username,
  });
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
          method: "POST",
          headers: {
            Authorization: bearerHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // change to form data
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status == "created") {
              navigate(`../dream/${data.dreamId}`);
            } else {
              // dream creation failed
              alert(
                "dream submit issue, please adjust data or contact support"
              );
            }
          });
        // TODO: error handling around dream submit result
        //      201 -> created successfully, redirect to feed?
        //      500 -> server error, try again later
        //      400 -> exists already, too many requests, unauthorized, etc (auto logout?)
      });
  };
  let updateFormData = (event) => {
    console.log(`${event.target.id} : ${event.target.value}`);
    let newFormData = { ...formData };
    if (event.target.type == "checkbox")
      newFormData[event.target.id] = event.target.checked;
    else newFormData[event.target.id] = event.target.value;
    setFormData(newFormData);
  };
  let validateDream = (_) => {
    //
    // TODO: add route to api to determine timestamp of last dream submitted by user
    // edit: actually, we can just prevent the submit event on the back end and account for that behavior here
  };

  return (
    <div className="dreamsubmitpage">
      <h3>dream submit form</h3>
      <form onSubmit={submitDream} id="dreamsubmitform">
        <label>
          dream took place in {msalConfig.currentUser.region}?{" "}
          <input
            type="checkbox"
            id="local"
            defaultChecked={true}
            onInput={updateFormData}
          ></input>
        </label>
        <div id="moodselector">
          <label>dream mood</label>
          <ul id="moodselectorlist">
            <li
              onClick={(_) => setFormData({ ...formData, mood: "🤮" })}
              className={
                "moodchoice" + (formData.mood == "🤮" ? " activemood" : "")
              }
            >
              🤮
            </li>
            <li
              onClick={(_) => setFormData({ ...formData, mood: "💀" })}
              className={
                "moodchoice" + (formData.mood == "💀" ? " activemood" : "")
              }
            >
              💀
            </li>
            <li
              onClick={(_) => setFormData({ ...formData, mood: "🥰" })}
              className={
                "moodchoice" + (formData.mood == "🥰" ? " activemood" : "")
              }
            >
              🥰
            </li>
            <li
              onClick={(_) => setFormData({ ...formData, mood: "😭" })}
              className={
                "moodchoice" + (formData.mood == "😭" ? " activemood" : "")
              }
            >
              😭
            </li>
            <li
              onClick={(_) => setFormData({ ...formData, mood: "🍆" })}
              className={
                "moodchoice" + (formData.mood == "🍆" ? " activemood" : "")
              }
            >
              🍆
            </li>
            <li
              onClick={(_) => setFormData({ ...formData, mood: "🗿" })}
              className={
                "moodchoice" + (formData.mood == "🗿" ? " activemood" : "")
              }
            >
              🗿
            </li>
          </ul>
        </div>
        <label>title</label>
        <input onInput={updateFormData} id="dreamtitle"></input>
        <label>content</label>
        <textarea onInput={updateFormData} id="dreamcontent"></textarea>
        <button type="submit">submit dream</button>
      </form>
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
  );
};

const UserPage = ({ instance, accounts }) => {
  const [usersDreams, setUsersDreams] = useState([]);

  useEffect((_) => {
    instance
      .acquireTokenSilent({
        // determine correct scope and parameterize from msalConfig
        scopes: ["https://storage.azure.com/user_impersonation"],
        account: accounts[0],
      })
      .then((response) => {
        let bearerHeader = `bearer ${response.idToken}`;
        //   TODO: edit parameters of url to specify which subset of dreams to load
        let submitResult = fetch(
          `${apiUri}/dreams/${msalConfig.currentUser.username}`,
          {
            // let fetchResult = fetch("http://localhost:3000/dreams", {
            method: "GET",
            headers: {
              Authorization: bearerHeader,
            },
          }
        )
          .then((response) => response.json())
          .then((nextResponse) => setUsersDreams(nextResponse.dreams));
      });
  }, []);

  return (
    <div className="userpage">
      <h3>about {msalConfig.currentUser.username}</h3>
      <table className="datatable">
        <thead>
          <tr>
            <th>key</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(msalConfig.currentUser).map((key) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{`${msalConfig.currentUser[key]}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>{msalConfig.currentUser.username}'s dreams</h3>
      {usersDreams.length == 0 ? (
        <p>loading...</p>
      ) : (
        usersDreams.map((dreamObject) => (
          <div key={dreamObject.rowKey} className="dreamobject">
            <div className="bottomborder">
              <div className="dreamheader">
                <Link to={"../dream/" + dreamObject.rowKey}>
                  <p>{dreamObject.user} </p>
                  <p>{dreamObject.location}</p>
                  <p>{dreamObject.rowKey}</p>
                </Link>
              </div>
            </div>
            <div className="bottomborder">
              <div className="dreamheader">
                <h4 className="dreammood">{dreamObject.mood}</h4>
                <h3 className="dreamtitle">{dreamObject.dreamtitle} </h3>
              </div>
            </div>
            <p>{dreamObject.dreamcontent}</p>
            <p>{dreamObject.timestamp}</p>
          </div>
        ))
      )}
    </div>
  );
};

const PageNotFound = (_) => {
  return <h1>404 time babyyyy</h1>;
};

const Modal = ({ modalVisible, setModalVisible }) => {
  useEffect((_) => {
    console.log(modalVisible);
  }, []);

  return (
    <div className={"modalbacker" + (modalVisible ? "" : " modalinvisible")}>
      <div className={"modal" + (modalVisible ? "" : " modalinvisible")}>
        <h1>{msalConfig.modal.title}</h1>
        <p>{msalConfig.modal.message}</p>
        <button onClick={(_) => setModalVisible(false)}>
          {msalConfig.modal.confirmtext}
        </button>
      </div>
    </div>
  );
};

const HeaderNav = ({ instance, accounts }) => {
  let location = useLocation();
  return (
    <h1 id="headernav">
      <Link to="/" className={location.pathname == "/" ? "activelogo" : ""}>
        DR3AM.SPACE
      </Link>
    </h1>
  );
};

const FooterNav = ({ instance, accounts, setModalVisible }) => {
  let location = useLocation();

  let toggleModal = _ => 
  {
    // msalConfig.modal.title = msalConfig.modal.title + " wef ef ";
    setModalVisible(true);
  }

  return (
    <>
      {msalConfig.currentUser.signupcompleted ? (
        <nav id="navfooter">
          <Link
            to="about"
            className={
              "footerlink" +
              (location.pathname == "/about" ? " activelink" : "")
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
            {msalConfig.currentUser.username}'s dreams
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
            onClick={(_) =>
              instance.logoutRedirect({ postLogoutRedirectUri: "/" })
            } // let user pick their own logout redirect? lmao
          >
            log out
          </a>
          {/* <a className="footerlink" onClick={(_) => toggleModal()}>
            modal
          </a> */}
        </nav>
      ) : (
        <></>
      )}
    </>
  );
};

export default App;
