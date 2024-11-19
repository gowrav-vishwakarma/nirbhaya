<template>
  <div>
    <!-- <h6 class="q-ma-none">{{ $t('common.language') }}</h6> -->
    <q-select
      :label="$t('common.language')"
      v-model="userStore.language"
      :options="languageOptions"
      outlined
      emit-value
      map-options
      @update:model-value="changeLanguage"
      class="q-mt-sm"
      style="border-radius: 20px"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from 'src/stores/user-store';

const { t, locale } = useI18n();
const userStore = useUserStore();

const languageOptions = computed(() =>
  userStore.availableLanguages.map((lang) => ({
    value: lang,
    label: t(`common.languages.${lang}`), // Updated key reference
  }))
);

const changeLanguage = (lang: string) => {
  userStore.setLanguage(lang);
  locale.value = lang;
};
</script>
