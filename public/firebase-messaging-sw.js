importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyATkKRDqPJwPAoH8_MZy9dOD_dEA6VC7tM',
  authDomain: 'shoutout-1e61c.firebaseapp.com',
  projectId: 'shoutout-1e61c',
  storageBucket: 'shoutout-1e61c.appspot.com',
  messagingSenderId: '599043169760',
  appId: '1:599043169760:web:3522088aa2511184455f85',
  measurementId: 'G-L2WNXZ0ZQR',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-128x128.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
