<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-h6" @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()">
          <q-icon name="campaign" size="2em" />
          <span class="text-weight-bold">{{ $t('common.appname') }} - {{ version }}</span>
        </q-toolbar-title>

        <div>
          <q-btn flat dense round icon="notifications" aria-label="Notifications" @click="refreshNotifications"
            :disabled="!userStore.isLoggedIn">
            <q-badge color="red" floating v-if="unreadNotificationCount > 0">
              {{ unreadNotificationCount }}
            </q-badge>
          </q-btn>
          <q-btn flat dense round icon="help" aria-label="Help" @click="goToHelpPage" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" class="bg-grey-2" :persistent="true" bordered>
      <q-list>
        <q-item @click="goToHomePage" clickable>
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item @click="goToAboutUsPage" clickable>
          <q-item-section>About Us</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-primary text-white" style="padding: 5px;">
      <q-toolbar style=" border-radius: 10px; background-color: rgb(208 10 78);">
        <q-btn class=" q-pa-none" flat aria-label="Nearby Volunteers" @click="goToVolunteersPage"
          :disabled="!userStore.isLoggedIn">
          <div>
            <q-icon name="emoji_people" style="font-size: 40px;"></q-icon>
            <p class="q-ma-none q-pa-none" style="font-family: sans-serif;">Nearby</p>
          </div>
        </q-btn>
        <q-space />
        <q-btn flat aria-label="Community" @click="goToCommunityPage" :disabled="!userStore.isLoggedIn">
          <div>
            <q-icon name="diversity_3" style="font-size: 40px;"></q-icon>
            <p class="q-ma-none q-pa-none" style="font-family: sans-serif;">Community</p>
          </div>
        </q-btn>
        <q-space />
        <q-btn flat aria-label="Profile" @click="goToAccountPage" :disabled="!userStore.isLoggedIn">
          <div>
            <q-icon name="person" style="font-size: 40px;"></q-icon>
            <p class="q-ma-none q-pa-none" style="font-family: sans-serif;">Profile</p>
          </div>
        </q-btn>
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
import { ref } from 'vue';
import { version } from 'src/../package.json';

const router = useRouter();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();
const userStore = useUserStore();
const { locale } = useI18n();
const drawer = ref(false);

onMounted(() => {
  locale.value = userStore.language;
});

const toggleDrawer = () => {
  drawer.value = !drawer.value; // Method to toggle drawer visibility
};

const goToAccountPage = () => {
  router.push('/account');
};

const goToDashboardPage = () => {
  router.push('/sos');
};

const goToLoginPage = () => {
  router.push('/login');
};

const refreshNotifications = async () => {
  await fetchUnreadNotificationCount();
  goToNotificationsPage(true);
};

const goToNotificationsPage = () => {
  const timestamp = Date.now();
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
  router.push('/volunteers');
};

const goToCommunityPage = () => {
  router.push('/community');
};

const goToHomePage = () => {
  router.push('/home');
  drawer.value = false;
};

const goToAboutUsPage = () => {
  router.push('/about-us');
  drawer.value = false;
};
</script>
