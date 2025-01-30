<template>
  <router-view />
</template>

<script setup lang="ts">
import { Smartlook } from '@awesome-cordova-plugins/smartlook';
import { onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';

// Set up Smartlook with your API key
onMounted(async () => {
  if (
    Capacitor.getPlatform() === 'android' ||
    Capacitor.getPlatform() === 'ios'
  ) {
    try {
      Smartlook.setProjectKey({
        key: process.env.SMARTLOOK_PROJECT_KEY || '',
      });
      Smartlook.start();
      console.log('smartlook hello');
      const isRecording = await Smartlook.isRecording();
      console.log('smartlook isRecording', isRecording);
    } catch (Error) {
      console.log('Smartlook erro is not initialized', Error);
    }
  } else {
    console.log('Smartlook is not initialized on web or PWA');
  }
});
</script>
