<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card class="dashboard-card q-pa-lg">
      <h5 class="text-primary q-mb-xl">
        {{ $t('welcome', { name: userName }) }}
      </h5>

      <div class="flex justify-center q-mb-xl">
        <q-btn
          round
          color="red"
          size="xl"
          class="sos-button"
          @click="initiateSOSMode"
        >
          <span class="text-h5 text-weight-bold">SOS</span>
        </q-btn>
      </div>

      <div v-if="!allPermissionsGranted" class="q-mt-lg">
        <h6 class="text-center text-grey-8">{{ $t('missingPermissions') }}</h6>
        <div
          v-for="permission in permissions"
          :key="permission.name"
          class="q-mt-sm"
        >
          <q-btn
            v-if="!permission.granted && !permission.denied"
            :label="$t('request', { permission: $t(permission.name) })"
            color="primary"
            outline
            @click="requestPermission(permission.name)"
            class="full-width"
          />
          <q-btn
            v-if="permission.denied"
            :label="$t('helpFor', { permission: $t(permission.name) })"
            color="secondary"
            outline
            @click="goToHelp(permission.name)"
            class="full-width"
          />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserForm } from 'src/composables/use-user-form';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePermissions } from 'src/composables/usePermissions';
import { useUserStore } from 'src/stores/user-store';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const userStore = useUserStore();
const userName = ref('User');

const {
  permissions,
  allPermissionsGranted,
  checkPermissions,
  requestPermission,
} = usePermissions();

const initiateSOSMode = async () => {
  try {
    await sendInitialSOSRequest();
    router.push('sos-mode');
  } catch (error) {
    console.error('Failed to send initial SOS request:', error);
    $q.notify({
      color: 'negative',
      message: t('sosRequestFailed'),
      icon: 'error',
    });
  }
};

const { validateAndSubmit, callbacks } = useUserForm('auth/sos-update', {
  status: 'created',
});

callbacks.onSuccess = () => {
  console.log('SOS log started');
};

const sendInitialSOSRequest = async () => {
  validateAndSubmit();
  console.log('Sending initial SOS request');
};

onMounted(async () => {
  await checkPermissions();
  userName.value = userStore.user.name || 'User';
});

const goToHelp = (permissionName: string) => {
  router.push({ path: '/help', query: { section: permissionName } });
};
</script>

<style scoped>
.dashboard-card {
  max-width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sos-button {
  width: 150px;
  height: 150px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
}
</style>
