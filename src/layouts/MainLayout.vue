<template>
  <q-layout view="hHh LpR lff" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title
          class="text-h6"
          @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()"
        >
          <q-icon name="campaign" size="2em" />
          <span class="text-weight-bold">{{ $t('common.appname') }}</span>
        </q-toolbar-title>

        <div>
          <q-btn
            flat
            dense
            round
            icon="notifications"
            aria-label="Notifications"
            @click="refreshNotifications"
            :disabled="!userStore.isLoggedIn"
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

    <q-footer class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          round
          icon="engineering"
          aria-label="Nearby Volunteers"
          @click="goToVolunteersPage"
          label="Nearby Volunteers"
          :disabled="!userStore.isLoggedIn"
        />
        <q-space />
        <q-btn
          flat
          round
          icon="notifications"
          aria-label="Community"
          @click="goToCommunityPage"
          label="Community"
          :disabled="!userStore.isLoggedIn"
        />
        <q-space />
        <q-btn
          flat
          round
          icon="person"
          aria-label="Profile"
          @click="goToAccountPage"
          label="Profile"
          :disabled="!userStore.isLoggedIn"
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
import { ref } from 'vue';

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
