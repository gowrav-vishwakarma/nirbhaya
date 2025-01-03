<template>
  <q-page class="">
    <div class="account-card bg-transparent q-mt-lg" v-if="userStore?.user">
      <q-tabs v-model="tab" dense class="text-white q-mt-md" active-color="white" indicator-color="white"
        align="justify" narrow-indicator>
        <q-tab :name="'profile'" :label="$t('common.profile')" />
        <q-tab :name="'volunteering'" :label="$t('common.volunteering')" />
        <q-tab :name="'impact'" :label="$t('common.communityImpact')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <q-tab-panel name="profile">
          <ProfilePage />
        </q-tab-panel>

        <q-tab-panel name="volunteering">
          <VolunteeringPage />
        </q-tab-panel>

        <q-tab-panel name="impact">
          <CommunityImpactPage />
        </q-tab-panel>
      </q-tab-panels>

      <div class="q-pa-md">
        <q-btn @click="logout" color="red" class="full-width">
          <b>{{ $t('common.logout') }}</b>
        </q-btn>
      </div>
    </div>
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
import CommunityImpactPage from './CommunityImpactPage.vue';
import { api } from 'src/boot/axios';

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
      message: t('common.pleaseLoginFirst'),
      icon: 'warning',
      position:'top-right'
    });
  }
});

const logout = async () => {
  try {
    await api.post('/auth/logout');
    userStore.logout(); // This will clear both in-memory and persisted state
    router.push('/login');
    $q.notify({
      color: 'black',
      message: t('common.logoutSuccess'),
      icon: 'check',
      position:'top-right'
    });
  } catch (error) {
    console.error('Error logging out', error);
    $q.notify({
      color: 'negative',
      message: t('common.logoutError'),
      icon: 'error',
      position:'top-right'
    });
  }
};
</script>

<style scoped>
.account-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.bg-transparent {
  background-color: 00000000;
}
</style>
