import { register } from 'register-service-worker';
import { Notify } from 'quasar';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(registration) {
    console.log('Service worker is active.');
    initializeWebPush(registration);
  },

  registered(registration) {
    console.log('Service worker has been registered.');
  },

  cached(/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    // console.log('New content is downloading.')
  },

  updated(/* registration */) {
    // console.log('New content is available; please refresh.')
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});

function initializeWebPush(registration: ServiceWorkerRegistration) {
  if ('PushManager' in self) {
    const vapidPublicKey = 'YOUR_PUBLIC_VAPID_KEY'; // Replace with your actual VAPID public key
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })
      .then(function (subscription) {
        console.log('User is subscribed:', subscription);
        // TODO: Send subscription to your server
      })
      .catch(function (err) {
        console.log('Failed to subscribe the user: ', err);
      });
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Add this function to handle showing notifications
function showNotification(title: string, options: NotificationOptions) {
  Notify.create({
    message: title,
    caption: options.body,
    actions: [
      {
        label: 'Go to SOS',
        color: 'red',
        handler: () => {
          window.location.href = '/#/sos';
        },
      },
    ],
  });
}

// Add this function to handle incoming messages from the service worker
function handleIncomingMessage(event: MessageEvent) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    showNotification(title, options);
  }
}

// Listen for messages from the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', handleIncomingMessage);
}

// Export the showNotification function
export { showNotification };
