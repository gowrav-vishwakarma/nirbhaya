import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserForm } from './use-user-form';

export function useSOSMode() {
  const router = useRouter();
  const contactsOnly = ref(false);

  const { values, validateAndSubmit, callbacks } = useUserForm(
    'sos/sos-update',
    {
      status: 'created',
      contactsOnly: contactsOnly.value,
    }
  );

  callbacks.onSuccess = (response) => {
    console.log('SOS log started');
    if (response && response.sosEventId) {
      router.push({
        name: 'sos-mode',
        query: {
          sosEventId: response.sosEventId,
          contactsOnly: contactsOnly.value.toString(),
        },
      });
    }
    return response;
  };

  const sendInitialSOSRequest = async () => {
    values.value.contactsOnly = contactsOnly.value;
    await validateAndSubmit();
  };

  const initiateSOSMode = async (contactsOnlyMode: boolean) => {
    contactsOnly.value = contactsOnlyMode;
    const response = await sendInitialSOSRequest();
    if (response && response.sosEventId) {
      localStorage.setItem('sosEventId', response.sosEventId);
      localStorage.setItem('contactsOnly', contactsOnly.value.toString());
      router.push({
        name: 'sos-mode',
      });
    }
  };

  return {
    initiateSOSMode,
  };
}
