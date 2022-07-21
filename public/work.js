let apiUri;
switch (window.location.host) {
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

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      window.registration = await navigator.serviceWorker.register(
        "/worker.js",
        {
          scope: "/worker.js",
        }
      )//.then(registration => {window.registration = registration});
      if (window.registration.installing) {
        console.log("Service worker installing");
      } else if (window.registration.waiting) {
        console.log("Service worker installed");
      } else if (window.registration.active) {
        // if (Notification.permission != "granted")
        //   await Notification.requestPermission();

        // window.registration.pushManager
        //   .subscribe({ userVisibilityOnly: true })
        //   .then((subscription) => {
        //     console.log(subscription);
        //     fetch(`${apiUri}/subscribe`, {
        //       method: "POST",
        //       body: JSON.stringify(subscription),
        //       headers: {
        //         "content-type": "application/json",
        //       },
        //     });
        //   });
        console.log("Service worker active");
      }
    } catch (error) {
      console.trace(error);
      console.error(`Registration failed with ${error}`);
    }
  }
};
self.addEventListener("push", e => {
    const data = e.data.json();
    window.registration.showNotification(
        data.title, // title of the notification
        {
            body: "Push notification from section.io", //the body of the push notification
            image: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
            icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/" // icon 
        }
    );
});
registerServiceWorker();
