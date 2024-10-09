import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export function useEmergencyServices() {
  const { t } = useI18n();

  const emergencyServices = ref([
    {
      name: 'common.police',
      visibleName: 'Police Station',
      icon: 'local_police',
      number: '100',
      color: '#800080',
    },
    {
      name: 'common.womenHelpline',
      visibleName: 'Women Helpline',
      icon: 'woman',
      number: '1091',
      color: '#808080',
    },
    {
      name: 'common.ambulance',
      visibleName: 'Ambulance',
      icon: 'emergency',
      number: '108',
      color: '#000080',
    },
    {
      name: 'common.fireDepartment',
      icon: 'local_fire_department',
      visibleName: 'Fire Department',
      number: '101',
      color: '#808000',
    },
  ]);

  const callEmergencyService = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return {
    emergencyServices,
    callEmergencyService,
  };
}
