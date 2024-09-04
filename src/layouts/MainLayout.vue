<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-h6" @click="goToDashboardPage">
          <q-icon name="campaign" size="2em" />
          <span class="text-weight-bold">{{ $t('app.name') }}</span>
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
import { useUserStore } from 'src/stores/user-store';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { unreadNotificationCount } = useBackgroundNotifications();
const userStore = useUserStore();
const { locale } = useI18n();

onMounted(() => {
  locale.value = userStore.language;
});

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
