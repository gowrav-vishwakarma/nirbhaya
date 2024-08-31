import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export const useLanguageStore = defineStore(
  'language',
  () => {
    const { locale } = useI18n();
    const currentLanguage = ref(
      localStorage.getItem('userLanguage') || 'en-US'
    );

    const setLanguage = (lang: string) => {
      currentLanguage.value = lang;
      locale.value = lang;
      localStorage.setItem('userLanguage', lang);
    };

    const availableLanguages = ['en-US', 'hi-IN', 'gu-IN'];

    watch(currentLanguage, (newLang) => {
      locale.value = newLang;
    });

    return {
      currentLanguage,
      setLanguage,
      availableLanguages,
    };
  },
  {
    persist: {
      key: 'nirdhaya-user',
    },
  }
);
