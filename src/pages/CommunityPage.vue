<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <q-page class="flex flex-center">
    <div class="column items-center q-pa-md">
      <h1 class="text-h2 text-weight-bold q-mb-md text-center">
        {{ t('community.title') }}
      </h1>

      <q-card class="q-pa-lg q-mb-md" style="max-width: 600px; width: 100%">
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
      </q-card>

      <q-card class="q-pa-lg" style="max-width: 600px; width: 100%">
        <q-card-section>
          <h2 class="text-h5 q-mb-md">{{ t('community.stayConnected') }}</h2>
          <p class="text-body1 q-mb-md">
            {{ t('community.stayUpdated') }}
          </p>
          <ul>
            <li class="q-mb-sm">
              <q-icon
                name="fab fa-whatsapp"
                color="green"
                size="sm"
                class="q-mr-sm"
              />
              {{ t('community.whatsapp') }}:
              <a
                href="https://whatsapp.com/channel/0029VajP3n042DcoI4F6t52L"
                target="_blank"
                class="text-primary"
                >{{ t('community.whatsappLink') }}</a
              >
            </li>
            <li class="q-mb-sm">
              <q-icon
                name="fab fa-instagram"
                color="purple"
                size="sm"
                class="q-mr-sm"
              />
              {{ t('community.instagram') }}:
              <a
                href="https://instagram.com/{{ t('community.instagramHandle') }}"
                class="text-primary"
                target="_blank"
                >{{ t('community.instagramHandle') }}</a
              >
            </li>
            <li class="q-mb-sm">
              <q-icon
                name="fab fa-twitter"
                color="blue"
                size="sm"
                class="q-mr-sm"
              />
              {{ t('community.twitter') }}:
              <a
                href="https://twitter.com/{{ t('community.twitterHandle') }}"
                class="text-primary"
                target="_blank"
                >{{ t('community.twitterHandle') }}</a
              >
            </li>
            <!-- youtube channel -->
            <li class="q-mb-sm">
              <q-icon
                name="fab fa-youtube"
                color="red"
                size="sm"
                class="q-mr-sm"
              />
              {{ t('community.youtube') }}:
              <a
                href="https://youtube.com/{{ t('community.youtubeHandle') }}"
                class="text-primary"
                target="_blank"
                >{{ t('community.youtubeHandle') }}</a
              >
            </li>
          </ul>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
