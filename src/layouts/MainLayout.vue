<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="home"
          aria-label="Home"
          @click="goToDashboardPage"
        />

        <q-toolbar-title class="text-h6">
          <q-icon name="shout" />
          <span class="text-weight-bold">Shout out</span>
        </q-toolbar-title>

        <div>
          <q-btn
            flat
            dense
            round
            icon="notifications"
            aria-label="Notifications"
            @click="goToNotificationsPage"
          >
            <q-badge color="red" floating v-if="unreadNotificationCount > 0">
              {{ unreadNotificationCount }}
            </q-badge>
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

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';

const router = useRouter();
const { unreadNotificationCount } = useBackgroundNotifications();

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
.bg-primary {
  background-color: #1976d2 !important;
}

.text-primary {
  color: #1976d2 !important;
}
</style>
