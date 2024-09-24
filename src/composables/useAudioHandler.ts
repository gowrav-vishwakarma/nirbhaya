import { ref } from 'vue';

export function useAudioHandler() {
  const audioStream = ref(null);

  const startAudioStream = async () => {
    if (!audioStream.value) {
      try {
        audioStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Audio stream started');
      } catch (err) {
        console.error('Failed to start audio stream', err);
      }
    }
  };

  const stopAudioStream = () => {
    if (audioStream.value) {
      audioStream.value.getTracks().forEach(track => track.stop());
      audioStream.value = null;
      console.log('Audio stream stopped');
    }
  };

  return {
    audioStream,
    startAudioStream,
    stopAudioStream,
  };
}
