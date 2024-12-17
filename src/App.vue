<template>
  <router-view />
</template>

<script setup lang="ts">
// import { useRouter } from 'vue-router';

// const router = useRouter();
// const url = 'https://sosbharat.com/link?page=deeplink&ab=22';
// const url = 'https://sosbharat.com/link?page=sos-bharat-community-post&key1=value1&id=123';

// Call the existing listener logic
// const urlObj = new URL(url);
// const path = urlObj.pathname;
// const params = Object.fromEntries(urlObj.searchParams.entries());
// const pageName = path.split('/').pop() ?? '';

// const targetPageName = params.page || ''; // Default to empty if not found
// const seoFrendly = params.seoFrendly || true; // Default to true for seo frendly

// console.log('Simulated deeplink:', url);
// console.log('deeplink: Extracted Page Name:', pageName);
// console.log('deeplink: Extracted target Page Name:', targetPageName);
// console.log('deeplink: Extracted Parameters:', params);
// console.log('deeplink: seo frendly:', params.seoFrendly);

// Example routing logic
// if (pageName.startsWith('link')) {
//   const seoFrendly = params.seoFrendly === 'true' || !params.seoFrendly; // Set to true if 'true' or not set

//   delete params.seoFrendly;
//   delete params.page;

//   console.log('deeplink: seoFrendly', seoFrendly);

//   const { ...remainingParams } = params; // Destructure to separate page from remaining params
//   const newPath = targetPageName ? `/${targetPageName}` : '';

//   if (seoFrendly == true) {
//     const seoFriendlyParams = Object.values(remainingParams).join('/');
//     const finalPath = seoFriendlyParams
//       ? `${newPath}/${seoFriendlyParams}`
//       : newPath; // Append values to the path if they exist
//     router.push(finalPath);
//     console.log(`deeplink: Redirecting to: ${finalPath}`);
//   } else {
//     const queryParams = new URLSearchParams(remainingParams).toString(); // Convert remaining params to query string
//     const finalPath = queryParams ? `${newPath}/${queryParams}` : newPath; // Append values to the path if they exist
//     router.push(finalPath);
//     console.log(`deeplink: Redirecting to: ${finalPath}`);
//   }
// }
</script>
