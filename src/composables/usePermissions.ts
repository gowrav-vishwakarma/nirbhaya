import { ref, Ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';

// Remove Microphone import

interface Permission {
  name: string;
  granted: boolean;
  denied: boolean;
}

export function usePermissions() {
  const permissions: Ref<Permission[]> = ref([
    { name: 'common.location', granted: false, denied: false },
    { name: 'common.camera', granted: false, denied: false },
    { name: 'common.notifications', granted: false, denied: false },
  ]);

  const allPermissionsGranted = computed(() =>
    permissions.value.every((permission) => permission.granted)
  );

  const updatePermissionStatus = (
    name: string,
    granted: boolean,
    denied: boolean
  ) => {
    const index = permissions.value.findIndex((p) => p.name === name);
    if (index !== -1) {
      permissions.value[index].granted = granted;
      permissions.value[index].denied = denied;
    }
  };

  const checkPermissions = async () => {
    for (const permission of permissions.value) {
      try {
        let result;
        if (Capacitor.isNativePlatform()) {
          switch (permission.name) {
            case 'common.location':
              result = await Geolocation.checkPermissions();
              updatePermissionStatus(
                permission.name,
                result.location === 'granted',
                result.location === 'denied'
              );
              break;
            case 'common.camera':
              result = await Camera.checkPermissions();
              updatePermissionStatus(
                permission.name,
                result.camera === 'granted',
                result.camera === 'denied'
              );
              break;
            case 'common.notifications':
              result = await PushNotifications.checkPermissions();
              updatePermissionStatus(
                permission.name,
                result.receive === 'granted',
                result.receive === 'denied'
              );
              break;
          }
        } else {
          // Web API fallback
          if (permission.name === 'common.location') {
            result = await navigator.permissions.query({ name: 'geolocation' });
            updatePermissionStatus(
              permission.name,
              result.state === 'granted',
              result.state === 'denied'
            );
          } else if (permission.name === 'common.notifications') {
            updatePermissionStatus(
              permission.name,
              Notification.permission === 'granted',
              Notification.permission === 'denied'
            );
          } else if (permission.name === 'common.camera') {
            try {
              await navigator.mediaDevices.getUserMedia({ video: true });
              updatePermissionStatus(permission.name, true, false);
            } catch {
              updatePermissionStatus(permission.name, false, true);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking ${permission.name} permission:`, error);
      }
    }
  };

  const requestPermission = async (permissionName: string) => {
    try {
      let result;
      if (Capacitor.isNativePlatform()) {
        switch (permissionName) {
          case 'common.location':
            result = await Geolocation.requestPermissions();
            break;
          case 'common.camera':
            result = await Camera.requestPermissions();
            break;
          case 'common.notifications':
            result = await PushNotifications.requestPermissions();
            if (result.receive === 'granted') {
              await PushNotifications.register();
            }
            break;
        }
      } else {
        // Web API fallback
        switch (permissionName) {
          case 'common.location':
            result = await navigator.permissions.query({ name: 'geolocation' });
            break;
          case 'common.camera':
            result = await navigator.mediaDevices.getUserMedia({ video: true });
            break;
          case 'common.notifications':
            result = await Notification.requestPermission();
            break;
        }
      }

      updatePermissionStatus(
        permissionName,
        result?.state === 'granted' || result === 'granted',
        result?.state === 'denied' || result === 'denied'
      );
      return result?.state === 'granted' || result === 'granted';
    } catch (error) {
      console.error(`Error requesting ${permissionName} permission:`, error);
      updatePermissionStatus(permissionName, false, true);
      return false;
    }
  };

  const activatePermission = async (permissionName: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        switch (permissionName) {
          case 'location':
            await Geolocation.watchPosition(
              { enableHighAccuracy: true },
              () => {
                console.log('Location permission activated');
              }
            );
            break;
          case 'camera':
            // Camera permission covers both video and audio
            await Camera.requestPermissions();
            break;
          // Remove microphone case
          case 'notifications':
            await PushNotifications.register();
            break;
        }
      } else {
        // Web API fallback
        switch (permissionName) {
          case 'location':
            if (navigator.geolocation) {
              await navigator.geolocation.watchPosition(() => {
                console.log('Location permission activated');
              });
            } else {
              throw new Error('Geolocation API not available');
            }
            break;
          case 'camera':
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
            } else {
              throw new Error('Media Devices API not available');
            }
            break;
          case 'notifications':
            if ('Notification' in window) {
              await Notification.requestPermission();
            } else {
              throw new Error('Notifications API not available');
            }
            break;
        }
      }
      updatePermissionStatus(permissionName, true, false);
      return true;
    } catch (error) {
      console.error(`Error activating ${permissionName} permission:`, error);
      return false;
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
