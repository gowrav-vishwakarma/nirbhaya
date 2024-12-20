<template>
  <q-page>
    <LanguageSelector />
    <q-banner class="bg-primary text-white">
      <h4>{{ t('community.offerTitle') }}</h4>
      <h6>{{ t('community.offerSubtitle') }}</h6>
      <h6>{{ t('community.offerDescription') }}</h6>
    </q-banner>

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

    <q-card class="q-mt-md">
      <q-card-section>
        <p>{{ t('community.introText') }}</p>
      </q-card-section>

      <q-card-section> </q-card-section>

      <q-card-section>
        <form @submit.prevent="joinMovement">
          <q-input
            v-model="inspiration"
            :label="t('community.inspirationLabel')"
            class="q-mb-md"
            outlined
            :rules="[(val) => !!val || t('common.fieldRequired')]"
          />
          <q-select
            v-model="contribution"
            :label="t('community.contributionLabel')"
            :options="contributionOptions"
            class="q-mb-md"
            outlined
            :rules="[(val) => !!val || t('common.fieldRequired')]"
          />
          <q-input
            type="textarea"
            v-model="skills"
            :label="t('community.skillsLabel')"
            class="q-mb-md"
            outlined
            :rules="[(val) => !!val || t('common.fieldRequired')]"
          />
          <q-select
            v-model="time"
            :label="t('community.timeLabel')"
            :options="timeOptions"
            class="q-mb-md"
            outlined
            :rules="[(val) => !!val || t('common.fieldRequired')]"
          />
          <q-card-actions>
            <q-btn
              type="submit"
              :label="t('community.joinButton')"
              color="primary"
              class="q-mx-auto"
            />
          </q-card-actions>
          <q-banner class="q-mt-md">
            <p>{{ t('community.reminderText') }}</p>
            <p>{{ t('community.privacyAssurance') }}</p>
          </q-banner>
        </form>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <h3>{{ t('community.testimonials') }}</h3>
        <p>{{ t('community.testimonial1') }}</p>
        <p>{{ t('community.testimonial2') }}</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useI18n } from 'vue-i18n';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { useQuasar } from 'quasar';

const router = useRouter();
const userStore = useUserStore();
const { t, tm } = useI18n();
const $q = useQuasar();

onMounted(() => {
  if (userStore.user.hasJoinedCommunity) {
    router.push('/joined-community');
  }
});

const inspiration = ref('');
const contribution = ref('');
const skills = ref('');
const time = ref('');

const contributionOptions = computed(() =>
  Object.values(tm('community.contributionOptions'))
);
const timeOptions = computed(() => Object.values(tm('community.timeOptions')));

// Logic for joining the movement
const joinMovement = async () => {
  if (
    !inspiration.value ||
    !contribution.value ||
    !skills.value ||
    !time.value
  ) {
    $q.notify({
      color: 'negative',
      message: t('common.fillAllFields'),
      icon: 'warning',
      position:'top-right'
    });
    return;
  }

  try {
    await api.post('/auth/apply-community', {
      inspiration: inspiration.value,
      contribution: contribution.value,
      skills: skills.value,
      time: time.value,
    });
    userStore.updateUser({ hasJoinedCommunity: true });
    router.push('/joined-community');
  } catch (error) {
    console.error('Error joining community:', error);
    $q.notify({
      color: 'negative',
      message: t('common.errorJoiningCommunity'),
      icon: 'error',
      position:'top-right'
    });
  }
};
</script>

<style scoped>
.input-field {
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  background-color: #f9f9f9;
}
</style>
