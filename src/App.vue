<template>
  <router-view />
</template>

<script setup lang="ts">
import { Smartlook } from '@awesome-cordova-plugins/smartlook';
import { onMounted } from 'vue';

// Set up Smartlook with your API key
onMounted(async () => {
  Smartlook.setProjectKey({ key: '056d4905ebd5ce473f5ad5fa953788424054cd60' });
  Smartlook.start();
  console.log('smartlook hello');
  const isRecording = await Smartlook.isRecording();
  console.log('isRecording', isRecording);
});
</script>
