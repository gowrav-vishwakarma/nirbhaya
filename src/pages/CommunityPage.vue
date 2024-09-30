<template>
  <q-page class="flex flex-center">
    <LanguageSelector />
    <div class="column items-center q-pa-md">
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

      <!-- New Suggestions Section -->
      <q-card class="q-mt-md q-pa-lg" style="max-width: 600px; width: 100%">
        <q-card-section>
          <h2 class="text-h5 q-mb-md">{{ t('community.suggestions') }}</h2>
          <q-list>
            <q-item v-for="suggestion in suggestions" :key="suggestion.id">
              <q-item-section>
                <q-item-label>{{
                  $t('community.suggestionTopics.' + suggestion.topic)
                }}</q-item-label>
                <q-item-label caption>{{ suggestion.content }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  @click="editSuggestion(suggestion)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn
            color="primary"
            class="q-mt-md"
            @click="openSuggestionDialog"
            :disable="suggestions.length >= 5"
          >
            {{ t('community.addSuggestion') }}
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="suggestionDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingSuggestion
                ? t('community.editSuggestion')
                : t('community.addSuggestion')
            }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="newSuggestion.topic"
            :options="topicOptions"
            :label="t('community.suggestionTopic')"
            emit-value
            map-options
          />
          <q-input
            v-model="newSuggestion.content"
            :label="t('community.suggestionContent')"
            type="textarea"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            :label="t('common.save')"
            color="primary"
            @click="saveSuggestion"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { api } from 'src/boot/axios';

const { t } = useI18n();

const suggestions = ref([]);
const suggestionDialog = ref(false);
const editingSuggestion = ref(null);
const newSuggestion = ref({ topic: '', content: '' });

const topicOptions = [
  { label: t('community.suggestionTopics.app_feature'), value: 'app_feature' },
  { label: t('community.suggestionTopics.safety_tip'), value: 'safety_tip' },
  {
    label: t('community.suggestionTopics.community_improvement'),
    value: 'community_improvement',
  },
  { label: t('community.suggestionTopics.other'), value: 'other' },
];

onMounted(async () => {
  await fetchSuggestions();
});

async function fetchSuggestions() {
  try {
    const response = await api.get('/auth/suggestions');
    suggestions.value = response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}

function openSuggestionDialog() {
  editingSuggestion.value = null;
  newSuggestion.value = { topic: '', content: '' };
  suggestionDialog.value = true;
}

function editSuggestion(suggestion) {
  editingSuggestion.value = suggestion;
  newSuggestion.value = { ...suggestion };
  suggestionDialog.value = true;
}

async function saveSuggestion() {
  try {
    if (editingSuggestion.value) {
      await api.put(
        `/auth/suggestions/${editingSuggestion.value.id}`,
        newSuggestion.value
      );
    } else {
      await api.post('/auth/suggestions', newSuggestion.value);
    }
    await fetchSuggestions();
  } catch (error) {
    console.error('Error saving suggestion:', error);
  }
}
</script>
