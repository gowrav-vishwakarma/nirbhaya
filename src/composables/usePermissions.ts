import { ref, Ref, computed } from 'vue';
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
// Remove Microphone import

interface Permission {
  name: string;
  granted: boolean;
  denied: boolean;
}

export function usePermissions() {
  const permissions: Ref<Permission[]> = ref([
    { name: 'location', granted: false, denied: false },
    { name: 'camera', granted: false, denied: false },
    // Remove microphone permission
    { name: 'notifications', granted: false, denied: false },
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
            case 'location':
              result = await Geolocation.checkPermissions();
              updatePermissionStatus(
                permission.name,
                result.location === 'granted',
                result.location === 'denied'
              );
              break;
            case 'camera':
              result = await Camera.checkPermissions();
              updatePermissionStatus(
                permission.name,
                result.camera === 'granted',
                result.camera === 'denied'
              );
              break;
            case 'notifications':
              result = await Plugins.PushNotifications.checkPermissions();
              updatePermissionStatus(
                permission.name,
                result.receive === 'granted',
                result.receive === 'denied'
              );
              break;
          }
        } else {
          // Web API fallback
          if (permission.name === 'location') {
            result = await navigator.permissions.query({ name: 'geolocation' });
            updatePermissionStatus(
              permission.name,
              result.state === 'granted',
              result.state === 'denied'
            );
          } else if (permission.name === 'notifications') {
            updatePermissionStatus(
              permission.name,
              Notification.permission === 'granted',
              Notification.permission === 'denied'
            );
          } else {
            try {
              await navigator.mediaDevices.getUserMedia({
                video: permission.name === 'camera',
                audio: permission.name === 'microphone',
              });
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
          case 'location':
            result = await Geolocation.requestPermissions();
            break;
          case 'camera':
            result = await Camera.requestPermissions();
            break;
          // Remove microphone case
          case 'notifications':
            result = await Plugins.PushNotifications.requestPermission();
            break;
        }
      } else {
        // Web API fallback
        switch (permissionName) {
          case 'location':
            result = await navigator.permissions.query({ name: 'geolocation' });
            break;
          case 'camera':
            result = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true, // Request audio along with video
            });
            break;
          case 'notifications':
            result = await Notification.requestPermission();
            break;
        }
      }

      updatePermissionStatus(permissionName, true, false);
      return true;
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
            await Plugins.PushNotifications.requestPermission();
            break;
        }
      } else {
        // Web API fallback
        switch (permissionName) {
          case 'location':
            await navigator.geolocation.watchPosition(() => {
              console.log('Location permission activated');
            });
            break;
          case 'camera':
            // For web, request both video and audio
            await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            break;
          case 'notifications':
            await Notification.requestPermission();
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
    activatePermission, // Add this new method to the return object
  };
}
