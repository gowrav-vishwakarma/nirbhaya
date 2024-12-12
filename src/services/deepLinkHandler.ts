import { App } from '@capacitor/app';
import { Router } from 'vue-router'; // Import your Vue Router instance

export function setupDeepLinks(router: Router) {
  console.log('deeplink: init');
  App.addListener('appUrlOpen', (event) => {
    const url = new URL(event.url);
    const path = url.pathname;
    alert('deeplink url open');
    console.log('deeplink: App opened with URL:', event.url, event);

    // Example: Route to different pages based on the path
    if (path.startsWith('/deeplink/')) {
      // const id = path.split('/deeplink/')[1];
      router.push('/deeplink/123');
    }
    //else if (path === '/otherpath') {
    //   router.push('/otherpath');
    // }
    else {
      console.warn('deeplink: Unknown deep link path:', path);
    }
  });
}
