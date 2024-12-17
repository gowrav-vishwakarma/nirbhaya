import { App } from '@capacitor/app';
import { Router } from 'vue-router'; // Import your Vue Router instance

export function setupDeepLinks(router: Router) {
  console.log('deeplink: init');
  /*
    generic deeplink for url with multiple params so that all url will open
    https://sosbharat.com/link/page=name&key1=value1&key2=value2&seofrendly=true
  */

  App.addListener('appUrlOpen', (event) => {
    const urlObj = new URL(event.url);
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams.entries());
    const pageName = path.split('/').pop() ?? '';

    const targetPageName = params.page || ''; // Default to empty if not found
    // const seoFrendly = params.seoFrendly || true; // Default to true for seo frendly

    console.log('Simulated deeplink:', event.url);
    console.log('deeplink: Extracted Page Name:', pageName);
    console.log('deeplink: Extracted target Page Name:', targetPageName);
    console.log('deeplink: Extracted Parameters:', params);
    console.log('deeplink: seo frendly:', params.seoFrendly);

    // Example routing logic
    if (pageName.startsWith('link')) {
      const seoFrendly = params.seoFrendly === 'true' || !params.seoFrendly; // Set to true if 'true' or not set

      delete params.seoFrendly;
      delete params.page;

      console.log('deeplink: seoFrendly', seoFrendly);

      const { ...remainingParams } = params; // Destructure to separate page from remaining params
      const newPath = targetPageName ? `/${targetPageName}` : '';
      console.log('deeplink: remainingParams', remainingParams);

      if (seoFrendly == true) {
        const seoFriendlyParams = Object.values(remainingParams).join('/');
        const finalPath = seoFriendlyParams
          ? `${newPath}/${seoFriendlyParams}`
          : newPath; // Append values to the path if they exist
        router.push(finalPath);
        console.log(`deeplink: Redirecting to: ${finalPath}`);
      } else {
        const queryParams = new URLSearchParams(remainingParams).toString(); // Convert remaining params to query string
        const finalPath = queryParams ? `${newPath}/${queryParams}` : newPath; // Append values to the path if they exist
        router.push(finalPath);
        console.log(`deeplink: Redirecting to: ${finalPath}`);
      }
    } else {
      console.warn('deeplink: Unknown deep link path:', path);
    }
  });
}
