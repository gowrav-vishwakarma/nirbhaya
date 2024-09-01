/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  const defaultNavigationRoute = new NavigationRoute(
    async () => {
      try {
        // Attempt to fetch and return the index.html file
        return await fetch('index.html');
      } catch (error) {
        // If fetch fails, return a default response
        return new Response('Offline page', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      }
    },
    {
      denylist: [/sw\.js$/, /workbox-(.)*\.js$/],
    }
  );

  registerRoute(defaultNavigationRoute);
}

// Modify the push event listener
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-128x128.png',
    badge: '/icons/icon-128x128.png',
    data: {
      url: '/#/sos',
    },
    actions: [
      {
        action: 'go-to-sos',
        title: 'Go to SOS',
      },
    ],
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options,
          });
        });
      }),
    ])
  );
});

// Modify the notificationclick event listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'go-to-sos') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/#/sos') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/#/sos');
        }
      })
    );
  }
});
