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
            @click="refreshNotifications"
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
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          round
          icon="engineering"
          aria-label="Nearby Volunteers"
          @click="goToVolunteersPage"
          label="Nearby Volunteers"
        />
        <q-space />
        <q-btn
          flat
          round
          icon="notifications"
          aria-label="Community"
          @click="goToCommunityPage"
          label="Community"
        />
        <q-space />
        <q-btn
          flat
          round
          icon="person"
          aria-label="Profile"
          @click="goToAccountPage"
          label="Profile"
        />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { useUserStore } from 'src/stores/user-store';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();
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

const refreshNotifications = async () => {
  await fetchUnreadNotificationCount();
  goToNotificationsPage(true); // Pass a flag to indicate refresh
};

const goToNotificationsPage = () => {
  const timestamp = Date.now(); // Generate a unique key
  router
    .push({ path: '/notifications', query: { key: timestamp } })
    .catch(() => {
      console.log('forced notification');
    });
};

const goToHelpPage = () => {
  router.push('/help');
};

const goToVolunteersPage = () => {
  // New method for navigation
  router.push('/volunteers');
};

const goToCommunityPage = () => {
  router.push('/community');
};
</script>
