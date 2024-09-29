<template>
  <q-page class="flex flex-center">
    <LanguageSelector />
    <div class="column items-center q-pa-md">
      <q-banner class="bg-primary text-white">
        <h4>{{ t('community.offerTitle') }}</h4>
        <h6>{{ t('community.offerSubtitle') }}</h6>
        <h6>{{ t('community.offerDescription') }}</h6>
      </q-banner>

      <!-- <q-card class="q-pa-lg q-mb-md" style="max-width: 600px; width: 100%">
        <q-card-section>
          <p class="text-body1 q-mb-md">
            {{ t('community.thankYou') }}
          </p>
          <p class="text-body1 q-mb-md">
            {{ t('community.underConstruction') }}
          </p>
          <p class="text-body1 q-mb-md">
            {{ t('community.privacyNote') }}
          </p>
        </q-card-section>
      </q-card> -->

      <q-card class="q-pa-lg" style="max-width: 600px; width: 100%">
        <q-card-section>
          <h2 class="text-h5 q-mb-md">{{ t('community.stayConnected') }}</h2>
          <p class="text-body1 q-mb-md">
            {{ t('community.stayUpdated') }}
          </p>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mdi-whatsapp" color="green" size="sm" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('community.whatsapp') }}</q-item-label>
                  <q-item-label caption>
                    <a
                      :href="t('community.whatsappLink')"
                      target="_blank"
                      class="text-primary"
                      >Click To Join</a
                    >
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mdi-instagram" color="purple" size="sm" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('community.instagram') }}</q-item-label>
                  <q-item-label caption>
                    <a
                      :href="`https://instagram.com/${t(
                        'community.instagramHandle'
                      )}`"
                      class="text-primary"
                      target="_blank"
                      >{{ t('community.instagramHandle') }}</a
                    >
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="fa-solid fa-ambulance" color="blue" size="sm" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('community.twitter') }}</q-item-label>
                  <q-item-label caption>
                    <a
                      :href="`https://twitter.com/${t(
                        'community.twitterHandle'
                      )}`"
                      class="text-primary"
                      target="_blank"
                      >{{ t('community.twitterHandle') }}</a
                    >
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mdi-youtube" color="red" size="sm" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('community.youtube') }}</q-item-label>
                  <q-item-label caption>
                    <a
                      :href="`https://youtube.com/@${t(
                        'community.youtubeHandle'
                      )}`"
                      class="text-primary"
                      target="_blank"
                      >@{{ t('community.youtubeHandle') }}</a
                    >
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import LanguageSelector from 'src/components/LanguageSelector.vue';

const { t } = useI18n();
</script>
