<template>
  <q-card v-if="!allPermissionsGranted" class="permissions-card q-mb-md">
    <q-card-section>
      <h6 class="text-h6 text-weight-bold q-mb-sm q-ma-none">
        {{ $t('common.missingPermissions') }}
      </h6>
      <q-list>
        <q-item
          v-for="permission in permissionsToShow"
          :key="permission.name"
          class="q-mb-sm"
        >
          <q-item-section avatar>
            <q-icon
              :name="getPermissionIcon(permission.name)"
              color="primary"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(permission.name) }}</q-item-label>
            <q-item-label caption>{{
              $t(permission.name + 'PermissionHelp')
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="!permission.granted && !permission.denied"
              :label="$t('common.request')"
              color="primary"
              outline
              @click="handleRequestPermission(permission.name)"
            />
            <q-btn
              v-else-if="permission.denied"
              :label="$t('common.helpFor')"
              color="secondary"
              outline
              @click="goToHelp(permission.name)"
            />
            <q-icon v-else name="check" color="positive" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePermissions } from 'src/composables/usePermissions';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const router = useRouter();
const $q = useQuasar();

const {
  permissions,
  allPermissionsGranted,
  requestPermission,
  checkPermissions,
} = usePermissions();

const permissionsToShow = computed(() =>
  permissions.value.filter((p) => p.name !== 'common.microphone' || !p.granted)
);

const icons = {
  'common.location': 'place',
  'common.camera': 'camera_alt',
  'common.notifications': 'notifications',
  'common.microphone': 'mic',
};

const getPermissionIcon = (permissionName: string): string =>
  icons[permissionName] || 'help';

const goToHelp = (permissionName: string) => {
  router.push({ path: '/help', query: { section: permissionName } });
};

const handleRequestPermission = async (permissionName: string) => {
  try {
    const granted = await requestPermission(permissionName);
    if (!granted) {
      $q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'warning',
        message: t('common.permissionRequestFailed'),
        position:'top-right'

      });
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'error',
      message: t('common.unexpectedError'),
      position:'top-right'

    });
  }
};

onMounted(checkPermissions);
</script>

<style lang="scss" scoped>
.permissions-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
