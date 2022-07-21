import React, { useEffect, useState } from "react";
import Dream from "../components/Dream";
import { useMsal } from "@azure/msal-react";
import { msalConfig } from "../../settings/msalConfig";

const CurrentUserPage = (_) => {
  const [usersDreams, setUsersDreams] = useState();
  let { instance, accounts } = useMsal();

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
          `${msalConfig.apiUri}/dreams/${msalConfig.currentUser.username}`,
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
      <span>todo: add settings controls here</span>
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

export default CurrentUserPage;
