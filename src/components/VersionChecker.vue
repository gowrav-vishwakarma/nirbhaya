<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { version } from '../../package.json';

const $q = useQuasar();

interface VersionResponse {
  latestVersion: string;
  forceUpdate: boolean;
  minimumVersion: string;
  androidUpdateUrl: string;
  iosUpdateUrl: string;
}

const openStoreUrl = (androidUrl: string, iosUrl: string) => {
  const url = $q.platform.is.ios ? iosUrl : androidUrl;
  window.open(url, '_blank');
};

const checkVersion = async () => {
  try {
    const response = await api.post<VersionResponse>('check-version', {
      currentVersion: version,
    });

    const {
      latestVersion,
      forceUpdate,
      minimumVersion,
      androidUpdateUrl,
      iosUpdateUrl,
      skipUpdate,
    } = response.data;

    if (skipUpdate) {
      return;
    }

    if (forceUpdate) {
      $q.dialog({
        title: 'Update Required',
        message:
          'A new version is available. You must update the app to continue using it.',
        persistent: true,
        ok: {
          label: 'Update Now',
          color: 'primary',
        },
      }).onOk(() => {
        openStoreUrl(androidUpdateUrl, iosUpdateUrl);
      });
    } else if (version !== latestVersion) {
      $q.dialog({
        title: 'Update Available',
        message:
          'A new version of the app is available. Would you like to update?',
        ok: {
          label: 'Update',
          color: 'primary',
        },
        cancel: {
          label: 'Later',
          color: 'grey',
        },
      }).onOk(() => {
        openStoreUrl(androidUpdateUrl, iosUpdateUrl);
      });
    }
  } catch (error) {
    console.error('Failed to check version:', error);
  }
};

onMounted(() => {
  void checkVersion();
});
</script>

<template>
  <div></div>
</template>
