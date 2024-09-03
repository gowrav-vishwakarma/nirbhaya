import { register } from 'register-service-worker';
import { Notify } from 'quasar';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register('/firebase-messaging-sw.js', {
  // Ensure this path is correct
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(registration) {
    console.log('Service worker is active.');
    // Removed initializeWebPush call
  },

  registered(registration) {
    console.log('Service worker has been registered.');
  },

  cached(/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound(registration) {
    console.log('New content is downloading.');
    Notify.create({
      message: 'A new version is available',
      caption: 'Please refresh to update.',
      color: 'info',
      actions: [
        {
          label: 'Refresh',
          color: 'white',
          handler: () => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        },
      ],
    });
  },

  updated(registration) {
    console.log('New content is available; please refresh.');
    Notify.create({
      message: 'App updated',
      caption:
        'New version is ready. Please refresh to use the latest version.',
      color: 'positive',
      actions: [
        {
          label: 'Refresh',
          color: 'white',
          handler: () => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        },
      ],
    });
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});

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
          if (typeof window !== 'undefined') {
            window.location.href = '/#/sos';
          }
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
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  (navigator.serviceWorker as ServiceWorkerContainer).addEventListener(
    'message',
    handleIncomingMessage
  );
}

// Export the showNotification function
export { showNotification };
