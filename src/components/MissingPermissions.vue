<template>
  <q-card v-if="!allPermissionsGranted" class="permissions-card q-mb-md">
    <q-card-section>
      <h6 class="text-h6 text-weight-bold q-mb-sm">
        {{ $t('common.missingPermissions') }}
      </h6>
      <q-list>
        <q-item
          v-for="permission in permissions"
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
              @click="requestPermission(permission.name)"
            />
            <q-btn
              v-if="permission.denied"
              :label="$t('common.helpFor')"
              color="secondary"
              outline
              @click="goToHelp(permission.name)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePermissions } from 'src/composables/usePermissions';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const {
  permissions,
  allPermissionsGranted,
  requestPermission,
  checkPermissions,
} = usePermissions();

const goToHelp = (permissionName: string) => {
  router.push({ path: '/help', query: { section: permissionName } });
};

const getPermissionIcon = (permissionName: string) => {
  const icons = {
    location: 'place',
    camera: 'camera_alt',
    microphone: 'mic',
    notification: 'notifications',
  };
  return icons[permissionName] || 'help';
};

onMounted(async () => {
  await checkPermissions();
});
</script>

<style lang="scss" scoped>
.permissions-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
