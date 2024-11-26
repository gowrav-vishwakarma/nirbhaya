import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useMediaPermissions() {
  const activeStreams = ref<MediaStream[]>([]);
  const router = useRouter();

  // Check if current route is restricted
  const isRestrictedRoute = () => {
    const restrictedRoutes = ['/', '/sos'];
    return restrictedRoutes.includes(router.currentRoute.value.path);
  };

  // Override getUserMedia to prevent media access on restricted routes
  const overrideGetUserMedia = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia is not supported in this browser.');
      return; // Exit if not supported
    }

    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );

    navigator.mediaDevices.getUserMedia = async function (
      constraints: MediaStreamConstraints
    ) {
      if (isRestrictedRoute()) {
        console.log('Blocking media access on restricted route');
        return Promise.reject(new Error('Media access blocked on this route'));
      }
      const stream = await originalGetUserMedia(constraints);
      activeStreams.value.push(stream);
      return stream;
    };
  };

  const stopAllMediaStreams = async () => {
    try {
      // Stop all tracks from activeStreams
      activeStreams.value.forEach((stream) => {
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      });
      activeStreams.value = [];

      // Find and stop all media elements
      const mediaElements = document.querySelectorAll('video, audio');
      mediaElements.forEach((element) => {
        const mediaElement = element as HTMLMediaElement;
        if (mediaElement.srcObject) {
          const stream = mediaElement.srcObject as MediaStream;
          stream.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
          mediaElement.srcObject = null;
        }
        mediaElement.pause();
        mediaElement.src = '';
      });

      // Query and stop any remaining tracks
      document.querySelectorAll('*').forEach((element) => {
        if (element instanceof HTMLMediaElement && element.srcObject) {
          const stream = element.srcObject as MediaStream;
          stream.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
        }
      });
    } catch (error) {
      console.warn('Error while stopping media streams:', error);
    }
  };

  // Initialize the override when the composable is used
  overrideGetUserMedia();

  return {
    stopAllMediaStreams,
    activeStreams,
    isRestrictedRoute,
  };
}
