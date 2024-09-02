<template>
  <q-layout view="lHh Lpr lFf" style="background-color: #ec7063">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="home"
          aria-label="Home"
          @click="goToDashboardPage"
        />
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->

        <q-toolbar-title> Nirbhaya </q-toolbar-title>

        <div>
          <q-btn
            flat
            dense
            round
            icon="notifications"
            aria-label="Notifications"
            @click="goToNotificationsPage"
          >
            <q-badge color="red" floating>{{ notificationCount }}</q-badge>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="help"
            aria-label="Help"
            @click="goToHelpPage"
          />
          <q-btn
            flat
            dense
            round
            icon="person"
            aria-label="Profile"
            @click="goToAccountPage"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const notificationCount = ref(5); // Example count, replace with actual logic

const goToAccountPage = () => {
  router.push('/account');
};

const goToDashboardPage = () => {
  router.push('/dashboard');
};

const goToNotificationsPage = () => {
  router.push('/notifications');
};

const goToHelpPage = () => {
  router.push('/help');
};
</script>
<style>
.primaryBackGroundColor {
  background-color: #ec7063;
}

.primarytextColor {
  background-color: #ec7063;
}
</style>
