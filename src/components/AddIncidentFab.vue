<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToCreateReel = () => {
  router.push('/create-reel');
};
</script>

<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-fab icon="add" color="primary" @click="navigateToCreateReel">
      <q-tooltip>Create new incident reel</q-tooltip>
    </q-fab>
  </q-page-sticky>
</template>
