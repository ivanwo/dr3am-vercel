import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { msalConfig } from '../../settings/msalConfig';
import FooterNav from '../components/FooterNav';

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
    let navigate = useNavigate();

    // TODO: move this up to the root app level
    useEffect((_) => {
      if (accounts[0] == null) navigate(`../`);
      console.log(accounts);
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
            let userData = fetch(`${msalConfig.apiUri}/user`, {
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
        msalConfig.modal.message = "";
        setModalVisible(true);
        return;
      }
      // check region
      // check if they agreed to the TOS
      if (!formData.termsofservice) {
        // alert("you must swear the oath to use the service");
        msalConfig.modal.title = "you must swear the oath to use the service";
        msalConfig.modal.message = "";
        setModalVisible(true);
        return;
      }
      // calculate age
      let birthday = new Date(formData.birthday);
      let month_diff = Date.now() - birthday.getTime();
      let age_dt = new Date(month_diff);
      let year = age_dt.getUTCFullYear();
      let age = Math.abs(year - 1970);
      if(age < 18)
      {
        msalConfig.modal.title = "you cannot be a child here";
        msalConfig.modal.message = "";
        formData.adultuser = false;
        setModalVisible(true);
        return;
      }
      
      // if (!formData.adultuser) {
      //   // alert("you cannot be a child here");
      //   msalConfig.modal.title = "you cannot be a child here";
      //   msalConfig.modal.message = "";
      //   setModalVisible(true);
      //   return;
      // }
      // submit to back end for approval
      console.log("valid form configuration, submitting to api");
      let submitResult = fetch(`${msalConfig.apiUri}/user`, {
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
          let userData = fetch(`${msalConfig.apiUri}/user`, {
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
        msalConfig.modal.message = "";
        setModalVisible(true);
        problem = true;
      }
      if (/[^a-zA-Z0-9]/.test(formData.username)) {
        // alert("username cannot contain special characters");
        msalConfig.modal.title = "username cannot contain special characters";
        msalConfig.modal.message = "";
        setModalVisible(true);
        problem = true;
      }
      // don't waste time checking a bad username with the back end
      if (!problem) {
        let submitResult = fetch(`${msalConfig.apiUri}/username/${formData.username}`, {
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
              msalConfig.modal.message = "";
              setModalVisible(true);
              // alert("username is valid and available!");
            } else {
              setUsernameIsFree(false);
              msalConfig.modal.title = "username is already taken";
              msalConfig.modal.message = "";
              setModalVisible(true);
              // alert("username is already taken");
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
                <label
                  title="tough shit, idiot!"
                  onClick={(_) => {
                    msalConfig.modal.title = "tough shit, idiot!";
                    msalConfig.modal.message = "";
                    setModalVisible(true);
                  }}
                >
                  don't see your region?
                </label>
                <div>
                  <label for="birthday"> date of birth </label>
                  <input type="date" id="birthday" name="birthday" onChange={updateFormData} />
                </div>
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

  export default PrivateLandingPage;