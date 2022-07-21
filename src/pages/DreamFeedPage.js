import React, { useState, useEffect } from "react";
import { msalConfig } from "../../settings/msalConfig";
import { useMsal } from "@azure/msal-react";
import Dream from "../components/Dream";

const DreamFeedPage = (_) => {
  let { instance, accounts } = useMsal();
  let [fetching, setFetching] = useState(false);
  let [dreamList, setDreamList] = useState([]);

  useEffect((_) => {
    populateDreamFeed();
  }, []);

  let populateDreamFeed = (_) => {
    setFetching(true);
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
        let submitResult = fetch(`${msalConfig.apiUri}/dreams`, {
          // let fetchResult = fetch("http://localhost:3000/dreams", {
          method: "GET",
          headers: {
            Authorization: bearerHeader,
          },
        })
          .then((response) => response.json())
          .then((nextResponse) => {
            setDreamList(nextResponse.dreams);
            setFetching(false);
          });
        // TODO: error handling around dream submit result
        //      201 -> created successfully, redirect to feed?
        //      500 -> server error, try again later
        //      400 -> exists already, too many requests, unauthorized, etc (auto logout?)
      });
  };

  return (
    <div className="dreamfeedpage">
      <h3>your dream feed</h3>
      <div className="dreamsortselector">
        <p>sort by:</p>
        <button>closest</button>
        <button>highest engagement</button>
        <button onClick={(_) => populateDreamFeed()}>refresh feed</button>
      </div>
      <div className="dreamfeed">
        {fetching ? (
          <span>loading...</span>
        ) : (
          <>
            {dreamList.length == 0 ? (
              <span>no dreams</span>
            ) : (
              dreamList.map((dreamObject) => (
                <Dream dream={dreamObject} key={dreamObject.rowKey} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DreamFeedPage;
