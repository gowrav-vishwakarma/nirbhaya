import { ref } from 'vue';

export function useAudioHandler() {
  const audioStream = ref<MediaStream | null>(null);

  const startAudioStream = async (): Promise<boolean> => {
    try {
      if (!audioStream.value) {
        audioStream.value = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }
      console.log('Audio stream started successfully');
      return true;
    } catch (error) {
      console.error('Failed to get audio stream:', error);
      return false;
    }
  };

  const stopAudioStream = () => {
    if (audioStream.value) {
      audioStream.value.getTracks().forEach((track) => track.stop());
      audioStream.value = null;
    }
  };

  return {
    audioStream,
    startAudioStream,
    stopAudioStream,
  };
}
