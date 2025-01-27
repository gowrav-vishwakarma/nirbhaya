<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { iosVersion, androidVersion } from '../../package.json';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const $q = useQuasar();

interface VersionResponse {
  latestVersion: string;
  latestIosVersion: string;
  latestAndroidVersion: string;
  forceUpdate: boolean;
  minimumVersion: string;
  androidUpdateUrl: string;
  iosUpdateUrl: string;
  skipUpdate: boolean;
  testVersion: Record<number, string>;
}

const openStoreUrl = (androidUrl: string, iosUrl: string) => {
  const url = $q.platform.is.ios ? iosUrl : androidUrl;
  window.open(url, '_blank');
};

const handleUpdate = async (version: string, forceUpdate: boolean) => {
  try {
    // Construct the bundle URL using version
    const bundleUrl = `https://your-cdn-url/sos_${version}.zip`;

    // Download the bundle
    const bundle = await CapacitorUpdater.download({
      url: bundleUrl,
      version: version
    });

    if (forceUpdate) {
      // For force updates, immediately apply the update
      await CapacitorUpdater.set(bundle);
    } else {
      // For optional updates, show confirmation dialog
      $q.dialog({
        title: 'Update Available',
        message: 'A new version is available. Would you like to update now?',
        ok: {
          label: 'Update',
          color: 'primary',
        },
        cancel: {
          label: 'Later',
          color: 'grey',
        },
      }).onOk(async () => {
        await CapacitorUpdater.set(bundle);
      });
    }
  } catch (error) {
    console.error('Failed to update:', error);
    // Fallback to store update if live update fails
    const storeUrl = $q.platform.is.ios ? iosUpdateUrl : androidUpdateUrl;
    openStoreUrl(androidUpdateUrl, storeUrl);
  }
};

const checkVersion = async () => {
  const version = $q.platform.is.ios ? iosVersion : androidVersion;
  const isApp = $q.platform.is.ios || $q.platform.is.android;

  if (!isApp) return;

  try {
    // Notify that the app is ready to receive updates
    await CapacitorUpdater.notifyAppReady();

    const response = await api.post<VersionResponse>('check-version', {
      currentVersion: version,
    });

    const {
      latestIosVersion,
      latestAndroidVersion,
      forceUpdate,
      androidUpdateUrl,
      iosUpdateUrl,
      skipUpdate,
      testVersion
    } = response.data;

    if (skipUpdate) return;

    // Get user ID from your auth system
    const userId = /* get logged in user ID */;

    // Check if user has a test version
    if (userId && testVersion[userId]) {
      await handleUpdate(testVersion[userId], forceUpdate);
      return;
    }

    // Otherwise use platform specific version
    const appVersion = $q.platform.is.ios ? latestIosVersion : latestAndroidVersion;
    if (version !== appVersion) {
      await handleUpdate(appVersion, forceUpdate);
    }

  } catch (error) {
    console.error('Failed to check version:', error);
  }
};

// Listen for download events
onMounted(() => {
  CapacitorUpdater.addListener('download', (info) => {
    console.log('Download progress:', info.percent);
  });

  CapacitorUpdater.addListener('updateFailed', (info) => {
    console.error('Update failed:', info);
    // Show error message to user
    $q.notify({
      type: 'negative',
      message: 'Update failed. Please try again later.'
    });
  });

  void checkVersion();
});

onUnmounted(() => {
  // Clean up listeners
  CapacitorUpdater.removeAllListeners();
});
</script>

<template>
  <div></div>
</template>
