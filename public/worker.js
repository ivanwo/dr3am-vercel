let apiUri;
switch (window.location.host) {
  case "dr3am.space":
    apiUri = "https://api.dr3am.space";
    break;
  case "dev.dr3am.space":
    apiUri = "https://dev.api.dr3am.space";
    break;
  case "localhost:9501":
    apiUri = "http://localhost:3000";
    break;
  default:
    apiUri = "https://api.imdb.com";
    break;
}

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      window.registration = await navigator.serviceWorker.register(
        "/worker.js",
        {
          scope: "/worker.js",
        }
      );
      if (window.registration.installing) {
        console.log("Service worker installing");
      } else if (window.registration.waiting) {
        console.log("Service worker installed");
      } else if (window.registration.active) {
        // if(Notification.permission != "granted")
        //   await Notification.requestPermission();

        // window.registration.pushManager.subscribe({userVisibilityOnly: true})
        // .then(subscription => {
        //   console.log(subscription);
        //   fetch(`${apiUri}/subscribe`, {
        //   method: "POST",
        //   body: JSON.stringify(subscription),
        //   headers : {
        //     "content-type" : "application/json"
        //   }
        // })
        // });
        console.log("Service worker active");
      }
    } catch (error) {
      console.trace(error);
      console.error(`Registration failed with ${error}`);
    }
  }
};

//Event that shows a notification when is received by push
// self.addEventListener("push", (event) => {
//   console.log("push event");
//   const data = event.data.json();
//   // window.registration.showNotification(data.title, {
//   //   body: data.body,
//   //   icon: "/layout/src/android-chrome-192x192.png",
//   // });
// });

// const deleteCache = async key => {
//   await caches.delete(key)
// }

// const deleteOldCaches = async () => {
//    const cacheKeepList = ['v2'];
//    const keyList = await caches.keys()
//    const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key))
//    await Promise.all(cachesToDelete.map(deleteCache));
// }

// self.addEventListener('activate', (event) => {
//   event.waitUntil(deleteOldCaches());
// });

registerServiceWorker();
