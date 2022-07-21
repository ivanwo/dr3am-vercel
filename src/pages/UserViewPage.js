import React, { useState, useEffect } from "react";
import Dream from "../components/Dream";
import { msalConfig } from "../../settings/msalConfig";
import { useMsal } from "@azure/msal-react";

const UserViewPage = (_) => {
  let { instance, accounts } = useMsal();
  const [username, setUsername] = useState(
    window.location.href.split("/")[window.location.href.split("/").length - 1]
  );
  const [usersDreams, setUsersDreams] = useState();

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
        let submitResult = fetch(`${msalConfig.apiUri}/dreams/${username}`, {
          // let fetchResult = fetch("http://localhost:3000/dreams", {
          method: "GET",
          headers: {
            Authorization: bearerHeader,
          },
        })
          .then((response) => response.json())
          .then((nextResponse) => setUsersDreams(nextResponse.dreams));
      });
  }, []);

  return (
    <div>
      {" "}
      <h3>{username}'s dreams</h3>
      {usersDreams == null ? (
        <p>loading...</p>
      ) : (
        <div className="dreamfeed">
          {usersDreams.length == 0 ? (
            <p>no dreams yet</p>
          ) : (
            usersDreams.map((dreamObject) => (
              <Dream dream={dreamObject} key={dreamObject.rowKey} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserViewPage;
