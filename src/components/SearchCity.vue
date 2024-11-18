<template>
  <q-select v-model="selectedCity" :label="t('common.city')" outlined dense :error="!!error" :error-message="error"
    use-input input-debounce="0" :options="cityOptions" @filter="filterCities" behavior="menu"
    @update:model-value="updateCity" :option-label="formatCityLabel">
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No city found...
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, onMounted, PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';

interface City {
  officename: string;
  pincode: string;
  statename: string;
}

const { t } = useI18n();

const props = defineProps<{
  modelValue: City | null;
  error?: string;
  initialValue?: City | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: City | null): void;
  (e: 'cityData', value: City): void;
}>();

const selectedCity = ref<City | null>(null);
const cityOptions = ref<City[]>([]);

onMounted(() => {
  if (props.initialValue) {
    selectedCity.value = props.initialValue;
    cityOptions.value = [props.initialValue];
  } else if (props.modelValue) {
    selectedCity.value = props.modelValue;
    cityOptions.value = [props.modelValue];
  }
});

watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    selectedCity.value = newValue;
    if (!cityOptions.value.some(city => city.officename === newValue.officename)) {
      cityOptions.value = [newValue];
    }
  }
}, { immediate: true });

const updateCity = (value: City | null) => {
  selectedCity.value = value;
  emit('update:modelValue', value);
  if (value) {
    emit('cityData', value);
  }
};

const filterCities = async (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      cityOptions.value = [];
    });
    return;
  }

  try {
    const response = await api.get(`search/cities?q=${val}`);
    update(() => {
      cityOptions.value = response.data.map((city: any) => ({
        officename: city.officename,
        pincode: city.pincode,
        statename: city.statename
      }));
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    update(() => {
      cityOptions.value = [];
    });
  }
};

const formatCityLabel = (city: City | null) => {
  if (!city) return '';
  return `${city.officename}, ${city.statename} - ${city.pincode}`;
};
</script>
