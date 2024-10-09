import { ref, Ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';

interface Permission {
  name: string;
  granted: boolean;
  denied: boolean;
}

const permissionNames = [
  'common.location',
  'common.camera',
  'common.notifications',
  'common.microphone',
] as const;
type PermissionName = (typeof permissionNames)[number];

export function usePermissions() {
  const permissions: Ref<Permission[]> = ref(
    permissionNames.map((name) => ({ name, granted: false, denied: false }))
  );

  const allPermissionsGranted = computed(() =>
    permissions.value.every((permission) => permission.granted)
  );

  const updatePermissionStatus = (
    name: PermissionName,
    granted: boolean,
    denied: boolean
  ) => {
    const permission = permissions.value.find((p) => p.name === name);
    if (permission) {
      permission.granted = granted;
      permission.denied = denied;
    }
  };

  const checkPermissions = async () => {
    const checkFunctions = {
      'common.location': checkLocationPermission,
      'common.camera': checkCameraPermission,
      'common.notifications': checkNotificationPermission,
      'common.microphone': checkMicrophonePermission,
    };

    await Promise.all(
      permissionNames.map(async (name) => {
        try {
          await checkFunctions[name]();
        } catch (error) {
          console.error(`Error checking ${name} permission:`, error);
        }
      })
    );
  };

  const checkLocationPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const result = await Geolocation.checkPermissions();
      const granted = result.location === 'granted';
      updatePermissionStatus(
        'common.location',
        granted,
        result.location === 'denied'
      );
      if (granted) {
        try {
          await Geolocation.getCurrentPosition();
        } catch (error) {
          console.error('Error getting current position:', error);
          updatePermissionStatus('common.location', false, true);
        }
      }
    } else {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const granted = result.state === 'granted';
      updatePermissionStatus(
        'common.location',
        granted,
        result.state === 'denied'
      );
      if (granted) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
        } catch (error) {
          console.error('Error getting current position:', error);
          updatePermissionStatus('common.location', false, true);
        }
      }
    }
  };

  const checkCameraPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const result = await Camera.checkPermissions();
      updatePermissionStatus(
        'common.camera',
        result.camera === 'granted',
        result.camera === 'denied'
      );
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        updatePermissionStatus('common.camera', true, false);
      } catch {
        updatePermissionStatus('common.camera', false, true);
      }
    }
  };

  const checkNotificationPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const result = await PushNotifications.checkPermissions();
      updatePermissionStatus(
        'common.notifications',
        result.receive === 'granted',
        result.receive === 'denied'
      );
    } else {
      updatePermissionStatus(
        'common.notifications',
        Notification.permission === 'granted',
        Notification.permission === 'denied'
      );
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      updatePermissionStatus('common.microphone', true, false);
    } catch {
      updatePermissionStatus('common.microphone', false, true);
    }
  };

  const requestPermission = async (permissionName: PermissionName) => {
    try {
      let result;
      if (Capacitor.isNativePlatform()) {
        result = await requestNativePermission(permissionName);
      } else {
        result = await requestWebPermission(permissionName);
      }

      const granted = result?.state === 'granted' || result === 'granted';
      const denied = result?.state === 'denied' || result === 'denied';

      updatePermissionStatus(permissionName, granted, denied);
      return granted;
    } catch (error) {
      console.error(`Error requesting ${permissionName} permission:`, error);
      updatePermissionStatus(permissionName, false, true);
      return false;
    }
  };

  const requestNativePermission = async (permissionName: PermissionName) => {
    switch (permissionName) {
      case 'common.location':
        return await Geolocation.requestPermissions();
      case 'common.camera':
        return await Camera.requestPermissions();
      case 'common.notifications':
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
          await PushNotifications.register();
        }
        return result;
      case 'common.microphone':
        return await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  };

  const requestWebPermission = async (permissionName: PermissionName) => {
    switch (permissionName) {
      case 'common.location':
        return await navigator.permissions.query({ name: 'geolocation' });
      case 'common.camera':
        return await navigator.mediaDevices.getUserMedia({ video: true });
      case 'common.notifications':
        return await Notification.requestPermission();
      case 'common.microphone':
        return await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  };

  const activatePermission = async (permissionName: PermissionName) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await activateNativePermission(permissionName);
      } else {
        await activateWebPermission(permissionName);
      }
      updatePermissionStatus(permissionName, true, false);
      return true;
    } catch (error) {
      console.error(`Error activating ${permissionName} permission:`, error);
      return false;
    }
  };

  const activateNativePermission = async (permissionName: PermissionName) => {
    switch (permissionName) {
      case 'common.location':
        await Geolocation.watchPosition({ enableHighAccuracy: true }, () => {
          console.log('Location permission activated');
        });
        break;
      case 'common.camera':
        await Camera.requestPermissions();
        break;
      case 'common.notifications':
        await PushNotifications.register();
        break;
      case 'common.microphone':
        await navigator.mediaDevices.getUserMedia({ audio: true });
        break;
    }
  };

  const activateWebPermission = async (permissionName: PermissionName) => {
    switch (permissionName) {
      case 'common.location':
        if (navigator.geolocation) {
          await navigator.geolocation.watchPosition(() => {
            console.log('Location permission activated');
          });
        } else {
          throw new Error('Geolocation API not available');
        }
        break;
      case 'common.camera':
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } else {
          throw new Error('Media Devices API not available');
        }
        break;
      case 'common.notifications':
        if ('Notification' in window) {
          await Notification.requestPermission();
        } else {
          throw new Error('Notifications API not available');
        }
        break;
      case 'common.microphone':
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw new Error('Media Devices API not available');
        }
        break;
    }
  };

  return {
    permissions,
    allPermissionsGranted,
    checkPermissions,
    requestPermission,
    activatePermission,
  };
}
