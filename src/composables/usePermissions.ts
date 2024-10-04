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
    { name: 'common.microphone', granted: false, denied: false }, // Add microphone permission
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
      permissions.value[index] = {
        ...permissions.value[index],
        granted,
        denied,
      };
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
              // Additional check for location availability
              if (result.location === 'granted') {
                try {
                  await Geolocation.getCurrentPosition();
                  // If we can get the current position, the permission is truly granted
                  updatePermissionStatus(permission.name, true, false);
                } catch (error) {
                  console.error('Error getting current position:', error);
                  // If we can't get the position, the permission might be restricted
                  updatePermissionStatus(permission.name, false, true);
                }
              }
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
            // Additional check for location availability
            if (result.state === 'granted') {
              try {
                await new Promise((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                // If we can get the current position, the permission is truly granted
                updatePermissionStatus(permission.name, true, false);
              } catch (error) {
                console.error('Error getting current position:', error);
                // If we can't get the position, the permission might be restricted
                updatePermissionStatus(permission.name, false, true);
              }
            }
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
          // Add microphone permission check
          if (permission.name === 'common.microphone') {
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
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

      // Add microphone permission request
      if (permissionName === 'common.microphone') {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          result = { state: 'granted' };
        } catch {
          result = { state: 'denied' };
        }
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
      // Add microphone permission activation
      if (permissionName === 'microphone') {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw new Error('Media Devices API not available');
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
