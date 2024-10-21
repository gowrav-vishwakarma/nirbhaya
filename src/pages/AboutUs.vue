<template>
  <div class="home-page">
    <LanguageSelector />
    <!-- Language selector component -->
    <h3>{{ $t('website.home.title') }}</h3>
    <!-- Updated to use translation key -->
    <p>{{ $t('website.home.description') }}</p>
    <!-- Updated to use translation key -->
    <p>{{ $t('website.home.contribute') }}</p>
    <hr />
    <q-btn to="/login" class="text-white bg-primary" rounded>{{
      $t('website.home.sosApp')
    }}</q-btn>
  </div>
</template>

<script setup lang="ts">
import LanguageSelector from 'src/components/LanguageSelector.vue'; // Importing the language selector
// Logic for Home page can be added here
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}
</style>
