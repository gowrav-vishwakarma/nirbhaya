<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { iosVersion, androidVersion } from '../../package.json';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const handleDownloadComplete = () => {
  console.log('Download complete');
  // Handle the download complete event
};

const handleUpdateAvailable = () => {
  console.log('Update available');
  // Handle the update available event
};

// Register event listeners
CapacitorUpdater.addListener('downloadComplete', handleDownloadComplete);
CapacitorUpdater.addListener('updateAvailable', handleUpdateAvailable);

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
}

const openStoreUrl = (androidUrl: string, iosUrl: string) => {
  const url = $q.platform.is.ios ? iosUrl : androidUrl;
  window.open(url, '_blank');
};

const checkVersion = async () => {
  const version = $q.platform.is.ios ? iosVersion : androidVersion;
  const isApp = $q.platform.is.ios
    ? true
    : $q.platform.is.android
    ? true
    : false;

  try {
    const response = await api.post<VersionResponse>('check-version', {
      currentVersion: version,
    });

    const {
      // latestVersion,
      latestIosVersion,
      latestAndroidVersion,
      forceUpdate,
      // minimumVersion,
      androidUpdateUrl,
      iosUpdateUrl,
      skipUpdate,
    } = response.data;

    if (skipUpdate) {
      return;
    }

    const appVersion = $q.platform.is.ios
      ? latestIosVersion
      : latestAndroidVersion;
    if (isApp && forceUpdate && version !== appVersion) {
      await downloadNewVersion();
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
    } else if (isApp && version !== appVersion) {
      await downloadNewVersion();
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
const downloadNewVersion = async () => {
  try {
    console.log('capgo update: init step1');
    // if (updateAvailable) {
    console.log('capgo update: downloading step3');
    const downloadLog = await CapacitorUpdater.download({
      version: '0.0.221',
      url: 'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/app-versions/com.xavoc.shoutout_0.0.220.zip',
    }).then((data) => {
      console.log('capgo update: setting step4', data);
      CapacitorUpdater.set(data);
    });
    console.log('downloadLog', downloadLog);
    //   alert('App updated successfully! Restart to apply changes.');
    // }
  } catch (error) {
    console.error('Update check failed', error);
  }
};

onMounted(() => {
  CapacitorUpdater.notifyAppReady();
  checkVersion();
});
</script>

<template>
  <div></div>
</template>
