const registerServiceWorker = async () => {

  if ('serviceWorker' in navigator) {
    try {
      window.registration = await navigator.serviceWorker.register(
        '/worker.js',
        {
          scope: '/worker.js',
        }
      );
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

// …

registerServiceWorker();
