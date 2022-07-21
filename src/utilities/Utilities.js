import { msalConfig } from "../../settings/msalConfig";

// subscribe to push notifications
async function createNotificationSubscription() {
    //wait for service worker installation to be ready
    window.registration.pushManager.subscribe({userVisibilityOnly: true})
    .then(subscription => {
      console.log(subscription);
      fetch(`${apiUri}/subscribe`, {
      method: "POST",
      body: JSON.stringify(subscription),
      headers : {
        "content-type" : "application/json"
      }
    })
  }
)};
// unsubscribe from push notifications
// get new IdToken
// refresh token saved to localStorage
// 

export default createNotificationSubscription;