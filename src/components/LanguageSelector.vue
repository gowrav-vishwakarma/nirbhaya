<template>
  <div>
    <h6 class="q-ma-none q-ml-xs">{{ $t('language') }}</h6>
    <q-select
      v-model="languageStore.currentLanguage"
      :options="languageOptions"
      outlined
      emit-value
      map-options
      @update:model-value="languageStore.setLanguage"
      class="q-mt-sm"
      style="border-radius: 20px"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'src/stores/languageStore';

const { t } = useI18n();
const languageStore = useLanguageStore();

const languageOptions = computed(() =>
  languageStore.availableLanguages.map((lang) => ({
    value: lang,
    label: t(`languages.${lang}`),
  }))
);
</script>
