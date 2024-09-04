<template>
  <q-page>
    <q-card
      class="q-mt-lg"
      style="
        background-color: white;
        border-radius: 20px 20px 0 0;
        height: 100%;
        bottom: 0;
        left: 0;
        top: 5px;
        width: 100%;
        overflow-y: auto;
      "
      v-if="userStore?.user"
    >
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="profile" label="Profile" />
        <q-tab name="volunteering" label="Volunteering" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="profile">
          <ProfilePage />
        </q-tab-panel>

        <q-tab-panel name="volunteering">
          <VolunteeringPage />
        </q-tab-panel>
      </q-tab-panels>

      <!-- Logout button -->
      <div class="q-pa-md">
        <q-btn @click="logout" style="width: 100%" class="bg-red text-white">
          <b class="q-ml-xs q-my-md">{{ $t('logout') }}</b>
        </q-btn>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import ProfilePage from './ProfilePage.vue';
import VolunteeringPage from './VolunteeringPage.vue';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();
const tab = ref('profile');

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    $q.notify({
      color: 'warning',
      message: t('pleaseLoginFirst'),
      icon: 'warning',
    });
  }
});

const logout = async () => {
  try {
    userStore.clearUser();
    router.push('/login');
    $q.notify({
      color: 'positive',
      message: t('logoutSuccess'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error logging out', error);
    $q.notify({
      color: 'negative',
      message: t('logoutError'),
      icon: 'error',
    });
  }
};
</script>

<style scoped>
/* Add any scoped styles here */
</style>
