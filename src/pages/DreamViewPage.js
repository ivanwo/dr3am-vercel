import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Dream from "../components/Dream";
import { msalConfig } from "../../settings/msalConfig";
import { useMsal } from "@azure/msal-react";

const DreamViewPage = (_) => {
  let { instance, accounts } = useMsal();
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
        let userData = fetch(`${msalConfig.apiUri}/dream/${dreamId}`, {
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
        <Dream dream={dreamContent} />
      )}
    </div>
  );
};

export default DreamViewPage;
