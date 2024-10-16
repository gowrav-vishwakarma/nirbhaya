<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToCreateReel = () => {
  router.push('/create-reel');
};
</script>

<template>
  <q-page-sticky position="top-right" :offset="[18, 18]">
    <q-icon style="font-size: 35px; margin-left: 30px;" name="mdi-camera-outline" color="white"
      @click="navigateToCreateReel" />
    <!-- <q-tooltip>Create new incident reel</q-tooltip> -->
    <!-- <q-icon style="font-size: 50px;" name="mdi-camera-enhance" color="primary" @click="navigateToCreateReel" /> -->
  </q-page-sticky>
</template>
