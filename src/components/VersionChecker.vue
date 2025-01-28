<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { iosVersion, androidVersion } from '../../package.json';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Device } from '@capacitor/device';

CapacitorUpdater.notifyAppReady();

const handleDownloadComplete = async (data:any) => {
    console.log('capgo update: Download complete',JSON.stringify(data));
  // Handle the download complete event
  await CapacitorUpdater.set(data.bundle);
    console.log('capgo update: set works function',JSON.stringify(data));
  await CapacitorUpdater.notifyAppReady();
  const currentBundle = await CapacitorUpdater.current();
  const capgo_version = currentBundle.bundle.version;
    console.log('capgo update: capgo version after set', capgo_version);
  CapacitorUpdater.reload();
};

const handleUpdateAvailable = () => {
  console.log('capgo update: Update available');
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
  const currentBundle = await CapacitorUpdater.current();
  const capgo_version = currentBundle.bundle.version;
  console.log('capgo update: capgo version', capgo_version);

  const version = $q.platform.is.ios ? iosVersion : androidVersion;
  const isApp = $q.platform.is.ios
    ? true
    : $q.platform.is.android
    ? true
    : false;

  try {
    const { identifier } = await Device.getId();
    const response = await api.post<VersionResponse>('check-version', {
      currentVersion: version,
      deviceId:identifier
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
      $q.dialog({
        title: 'Update Required',
        message:
          'A new version ('+capgo_version+') is available. You must update the app to continue using it.',
        persistent: true,
        ok: {
          label: 'Update Now',
          color: 'primary',
        },
      }).onOk(async () => {
        if( !forceUpdate && capgo_version != appVersion)
          await downloadNewVersion(appVersion);
        else
          openStoreUrl(androidUpdateUrl, iosUpdateUrl);
      });
    } else if (isApp && version !== appVersion) {

      $q.dialog({
        title: 'Update Available',
        message:
          'A new version ('+capgo_version+') of the app is available. Would you like to update?',
        ok: {
          label: 'Update',
          color: 'primary',
        },
        cancel: {
          label: 'Later',
          color: 'grey',
        },
      }).onOk(async () => {
        if(!forceUpdate && capgo_version != appVersion)
          await downloadNewVersion(appVersion);
        else
          openStoreUrl(androidUpdateUrl, iosUpdateUrl);
      });
    }
  } catch (error) {
    console.error('Failed to check version:', error);
  }
};
const downloadNewVersion = async (newVersion:string) => {
  try {
    console.log('capgo update: init step1');
    const downloadUrl = 'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/app-versions/com.xavoc.shoutout_'+newVersion+'.zip';
    const downloadLog = await CapacitorUpdater.download({
      version: newVersion,
      url: downloadUrl
    });
    console.log('capgo update: downloaded', JSON.stringify(downloadLog));
  } catch (error) {
    console.error('Update check failed', error);
    // Additional logging for debugging

  }
};

onMounted(() => {
  checkVersion();
});
</script>

<template>
  <div></div>
</template>
