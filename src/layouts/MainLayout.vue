<template>
  <q-layout view="lHh Lpr lFf" class="mainlayout-page-bg-color" style="z-index: 11">
    <q-header
      :class="['text-white', isScrolled ? 'header-bg-color' : 'background-color-transparent', { 'hidden': isHeaderHide }]">
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
          <q-btn flat round aria-label="Profile" @click="goToAccountPage" v-if="userStore.isLoggedIn">
            <div>
              <q-icon name="person"></q-icon>
            </div>
          </q-btn>
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

    <q-page-container class="">
      <router-view />
    </q-page-container>
    <q-footer class="text-white background-color-transparent" style="padding: 4px; padding-bottom: 5px"
      v-if="userStore.isLoggedIn && !isFooterHide">
      <q-toolbar class="footer-toolbar">
        <q-btn class="" flat aria-label="Nearby Volunteers" :disabled="!userStore.isLoggedIn"
          @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()">
          <div>
            <q-icon name="home" class="font-size-25"></q-icon>
            <p class="q-ma-none q-pa-none  font-size-11">Home</p>
          </div>
        </q-btn>
        <q-space />

        <q-btn class="q-pa-none" flat aria-label="Nearby Volunteers" :disabled="!userStore.isLoggedIn"
          @click="goToVolunteersPage">
          <div>
            <q-icon name="emoji_people" class="font-size-25"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11">Nearby</p>
          </div>
        </q-btn>

        <q-space />
        <q-btn class="q-pa-none q-ml-sm" flat aria-label="Incidents" @click="goToReelsPage"
          :disabled="!userStore.isLoggedIn">
          <div>
            <q-icon name="video_file" class="font-size-25"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11">Incidents</p>
          </div>
        </q-btn>
        <q-space />
        <q-btn class="q-pa-none q-ml-sm" flat aria-label="Incidents" @click="goToNewsPage"
          :disabled="!userStore.isLoggedIn">
          <div>
            <i class="fas fa-newspaper" style=" font-size: 18px;"></i>
            <p class="q-ma-none q-pa-none font-size-11">News</p>
          </div>
        </q-btn>
        <q-space />

        <q-btn flat aria-label="Community" @click="goToCommunityPage" :disabled="!userStore.isLoggedIn">
          <div>
            <q-icon name="diversity_3" class="font-size-25"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11">Community</p>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { version } from 'src/../package.json';

const router = useRouter();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();
const userStore = useUserStore();
const { locale } = useI18n();
const drawer = ref(false);
const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};
// Register and unregister the scroll event listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  locale.value = userStore.language;
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
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

const goToReelsPage = () => {
  router.push('/incident-reels');
  drawer.value = false;
};
const goToNewsPage = () => {
  router.push('/all-news');
  drawer.value = false;
};
// Computed property to check if the current route is 'create-reel'
const isHeaderHide = computed(() => {
  const path = router.currentRoute.value.fullPath;
  console.log('router.currentRoute.value.fullPath:', path);
  return ['/create-reel', '/incident-reels'].includes(path) || /^\/news\/\d+$/.test(path);
});
const isFooterHide = computed(() => {
  console.log('router.currentRoute.value.fullPath....', router.currentRoute.value.fullPath);
  return ['/create-reel',].includes(router.currentRoute.value.fullPath);
});

</script>
<style lang="scss" scoped>
.mainlayout-page-bg-color {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
}

.background-color-transparent {
  background-color: #00000000;
}

.hidden {
  display: none;
  /* CSS class to hide elements */
}

.font-size-11 {
  font-size: 9px;
  font-weight: 700;
}

.font-size-26 {
  font-size: 26px;
}

.footer-toolbar {
  border-radius: 10px;
  background-color: rgb(208 10 78);
  display: flex;
  justify-content: flex-end;
  box-shadow: 0px 4px 8px rgba(78, 25, 25, 0.699);
}

.bg-green {
  background-color: green !important;
}

.background-color-transparent {
  background-color: transparent !important;
}

.header-bg-color {
  background-color: 'rgb(208 10 78)';
  border-radius: 0 03px 3px;
}
</style>
