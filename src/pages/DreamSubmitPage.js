import React, {useEffect, useState } from 'react';
import { msalConfig } from '../../settings/msalConfig';
import { useNavigate } from 'react-router-dom';

const DreamSubmitPage = ({ instance, accounts, setModalVisible }) => {
    let navigate = useNavigate();
    let [formData, setFormData] = useState({
      location: msalConfig.currentUser.region,
      mood: "🤮",
      user: msalConfig.currentUser.username,
      userzodiac: msalConfig.currentUser.zodiac
    });
    let [currentlySubmitting, setCurrentlySubmitting] = useState(false);
  
    let submitDream = async (event) => {
      event.preventDefault();
      setCurrentlySubmitting(true);
      if (!validateDream()) {
        setCurrentlySubmitting(false);
        return;
      }
      console.log("submitting dream");
      instance
        .acquireTokenSilent({
          // determine correct scope and parameterize from msalConfig
          scopes: ["https://storage.azure.com/user_impersonation"],
          account: accounts[0],
        })
        .then((response) => {
          let bearerHeader = `bearer ${response.idToken}`;
          let submitResult = fetch(`${msalConfig.apiUri}/dream`, {
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
                setCurrentlySubmitting(false);
                msalConfig.modal.title = "dream submit issue";
                msalConfig.modal.message =
                  "please adjust data or contact support";
                setModalVisible(true);
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
      if (formData.dreamtitle == null) {
        msalConfig.modal.title = "empty dream title";
        msalConfig.modal.message = "please adjust dream data and try again";
        setModalVisible(true);
        return false;
      }
      if (formData.dreamcontent == null) {
        msalConfig.modal.title = "empty dream content";
        msalConfig.modal.message = "please adjust dream data and try again";
        setModalVisible(true);
        return false;
      }
      if (formData.dreamtitle.length < 4) {
        msalConfig.modal.title = "dream title too short";
        msalConfig.modal.message = "please add characters and try again";
        setModalVisible(true);
        return false;
      }
      if (formData.dreamtitle.length > 25) {
        msalConfig.modal.title = "dream title too long";
        msalConfig.modal.message = "please remove characters and try again";
        setModalVisible(true);
        return false;
      }
      if (formData.dreamcontent.length < 40) {
        msalConfig.modal.title = "dream content too short";
        msalConfig.modal.message = "please add characters and try again";
        setModalVisible(true);
        return false;
      }
      if (formData.dreamcontent.length > 400) {
        msalConfig.modal.title = "dream content too long";
        msalConfig.modal.message = "please add characters and try again";
        setModalVisible(true);
        return false;
      }
      return true;
    };
  
    return (
      <div className="dreamsubmitpage">
        {currentlySubmitting ? (
          <>submitting...</>
        ) : (
          <>
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
          </>
        )}{" "}
      </div>
    );
  };

  export default DreamSubmitPage;