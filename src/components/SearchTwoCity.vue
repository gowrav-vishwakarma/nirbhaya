<template>
    <q-select v-model="selectedCity"  outlined dense :error="!!error" :error-message="error"
      clearable use-input input-debounce="0" :options="cityOptions" @filter="filterCities" behavior="menu"
      @update:model-value="updateCity" :option-label="formatCityLabel" :disable="disabled" menu-style="max-height: 60vh">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> Search City </q-item-section>
        </q-item>
      </template>
    </q-select>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { api } from 'src/boot/axios';
  
  const { t } = useI18n();
  
  const props = defineProps({
    modelValue: {
      default: null,
    },
    error: {
      type: String,
      default: undefined,
    },
    initialValue: {
      default: null,
    },
    selectedState: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  
  const emit = defineEmits(['update:modelValue', 'cityData']);
  
  const selectedCity = ref(null);
  const cityOptions = ref([]);
  
  onMounted(() => {
    if (props.initialValue) {
      selectedCity.value = props.initialValue;
      cityOptions.value = [props.initialValue];
    } else if (props.modelValue) {
      selectedCity.value = props.modelValue;
      cityOptions.value = [props.modelValue];
    }
  });
  
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue && typeof newValue === 'object') {
        selectedCity.value = newValue;
        if (
          !cityOptions.value.some(
            (city) => city.officename === newValue.officename
          )
        ) {
          cityOptions.value = [newValue];
        }
      }
    },
    { immediate: true }
  );
  
  const updateCity = (value) => {
    selectedCity.value = value;
    emit('update:modelValue', value);
    if (value) {
      emit('cityData', value);
    }
  };
  
  const filterCities = async (val, update) => {
    if (val === '') {
      update(() => {
        cityOptions.value = [];
      });
      return;
    }
  
    try {
      const response = await api.get(
        `search/cities?q=${val}&state=${props.selectedState}`
      );
      update(() => {
        // Create a Map to store unique districts
        const uniqueDistricts = new Map();
  
        response.data.forEach((city) => {
          // Use tolowarcode as the key to ensure uniqueness
          uniqueDistricts.set(city.tolowarcode, {
            officename: city.district.charAt(0).toUpperCase() + city.district.slice(1).toLowerCase(),
            pincode: city.pincode,
            statename: city.statename,
          });
        });
  
  
        // Convert Map values back to array and then apply state filter
        cityOptions.value = Array.from(uniqueDistricts.values()).filter(
          (city) =>
            city.statename.toLowerCase() === props.selectedState.toLowerCase()
        );
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      update(() => {
        cityOptions.value = [];
      });
    }
  };
  
  const formatCityLabel = (city) => {
    if (!city) return '';
    const capitalizedOfficename = city.officename.charAt(0).toUpperCase() + city.officename.slice(1);
    return `${capitalizedOfficename}, ${city.statename}`;
  };
  </script>
  