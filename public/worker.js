const registerServiceWorker = async () => {

  if ('serviceWorker' in navigator) {
    try {
      let result = await navigator.serviceWorker.register(
        '/worker.js',
        {
          scope: '/worker.js',
        }
      ).then(registration => {
        window.registration = registration
      });
      if (window.registration.installing) {
        console.log('Service worker installing');
      } else if (window.registration.waiting) {
        console.log('Service worker installed');
      } else if (window.registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

self.addEventListener('push', e => {

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
// …

registerServiceWorker();
