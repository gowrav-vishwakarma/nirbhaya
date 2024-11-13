<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- News List -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6">News Management</div>
            <q-space />
            <q-btn color="primary" label="Add News" @click="openNewsDialog()" />
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="news"
              :columns="columns"
              row-key="id"
              :loading="loading"
              v-model:pagination="pagination"
              @request="onRequest"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn-group flat>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="translate"
                      @click="openTranslationDialog(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      @click="openNewsDialog(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="confirmDelete(props.row)"
                    />
                  </q-btn-group>
                </q-td>
              </template>
              <template v-slot:body-cell-translations="props">
                <q-td :props="props">
                  <q-chip
                    v-for="translation in props.row.translations"
                    :key="translation.id"
                    :label="getLanguageLabel(translation.languageCode)"
                    class="q-ma-xs"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- News Dialog -->
    <q-dialog v-model="newsDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editingNews ? 'Edit News' : 'Add News' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveNews" class="q-gutter-md">
            <q-select
              v-model="newsForm.defaultLanguage"
              :options="languageOptions"
              label="Default Language"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Language is required']"
            />

            <q-select
              v-model="newsForm.categories"
              :options="newsCategories"
              label="Categories"
              emit-value
              map-options
              multiple
              use-chips
              clearable
              :rules="[
                (val) => val.length > 0 || 'At least one category is required',
              ]"
            >
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  @remove="scope.removeAtIndex(scope.index)"
                  :label="
                    newsCategories.find((cat) => cat.value === scope.opt)?.label
                  "
                  color="primary"
                  text-color="white"
                  class="q-ma-xs"
                />
              </template>
            </q-select>

            <q-input
              v-model="newsForm.title"
              label="Title"
              :rules="[(val) => !!val || 'Title is required']"
            />

            <q-input
              v-model="newsForm.content"
              type="textarea"
              label="Content"
              :rules="[(val) => !!val || 'Content is required']"
            />

            <q-input
              v-model="newsForm.source"
              label="Source URL"
              type="url"
              hint="Enter the source URL of the news (optional)"
            />

            <q-file
              v-model="newsForm.mediaFiles"
              label="Media Files"
              multiple
              accept="image/*,video/*"
            >
              <template v-slot:append>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="grey" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                :label="editingNews ? 'Update' : 'Save'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Translation Dialog -->
    <q-dialog v-model="translationDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Manage Translations</div>
        </q-card-section>

        <q-card-section>
          <!-- Existing Translations -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Existing Translations</div>
            <q-list bordered separator>
              <q-item
                v-for="translation in currentNewsTranslations"
                :key="translation.id"
              >
                <q-item-section>
                  <q-item-label>{{
                    getLanguageLabel(translation.languageCode)
                  }}</q-item-label>
                  <q-item-label caption>{{ translation.title }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      @click="editTranslation(translation)"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="deleteTranslation(translation)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Translation Form -->
          <q-form @submit="saveTranslation" class="q-gutter-md">
            <q-select
              v-model="translationForm.languageCode"
              :options="availableLanguageOptions"
              label="Language"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Language is required']"
            />

            <q-input
              v-model="translationForm.title"
              label="Title"
              :rules="[(val) => !!val || 'Title is required']"
            />

            <q-input
              v-model="translationForm.content"
              type="textarea"
              label="Content"
              :rules="[(val) => !!val || 'Content is required']"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="grey" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                :label="
                  editingTranslation ? 'Update Translation' : 'Add Translation'
                "
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const loading = ref(false);
const newsDialog = ref(false);
const translationDialog = ref(false);
const editingNews = ref(false);
const news = ref([]);
const currentNewsTranslations = ref([]);
const editingTranslation = ref(false);

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
];

const newsCategories = [
  { label: 'Politics', value: 'politics' },
  { label: 'Business', value: 'business' },
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Health', value: 'health' },
  { label: 'Sports', value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Education', value: 'education' },
  { label: 'World News', value: 'world_news' },
  { label: 'Local News', value: 'local_news' },
  { label: 'Crime', value: 'crime' },
  { label: 'Environment', value: 'environment' },
  { label: 'Culture', value: 'culture' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Economy', value: 'economy' },
];

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'title', label: 'Title', field: 'title' },
  {
    name: 'defaultLanguage',
    label: 'Default Language',
    field: 'defaultLanguage',
  },
  {
    name: 'categories',
    label: 'Categories',
    field: 'categories',
    format: (val) => {
      const cats = Array.isArray(val) ? val : [];
      return cats
        .map(
          (catValue) =>
            newsCategories.find((cat) => cat.value === catValue)?.label
        )
        .filter(Boolean)
        .join(', ');
    },
  },
  { name: 'status', label: 'Status', field: 'status' },
  { name: 'actions', label: 'Actions', field: 'actions' },
  {
    name: 'translations',
    label: 'Available Translations',
    field: 'translations',
    format: (val) => val?.map((t) => t.languageCode).join(', ') || '-',
  },
];

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const newsForm = ref({
  id: null,
  title: '',
  content: '',
  defaultLanguage: 'en',
  mediaFiles: [],
  categories: [],
  source: '',
});

const translationForm = ref({
  newsId: null,
  languageCode: '',
  title: '',
  content: '',
});

async function loadNews() {
  try {
    loading.value = true;
    const response = await api.get('/news/news', {
      params: {
        page: pagination.value.page,
        pageSize: pagination.value.rowsPerPage,
      },
    });
    news.value = response.data.items;
    pagination.value.rowsNumber = response.data.total;
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to load news',
    });
  } finally {
    loading.value = false;
  }
}

function openNewsDialog(newsItem = null) {
  if (newsItem) {
    editingNews.value = true;
    newsForm.value = {
      ...newsItem,
      categories: Array.isArray(newsItem.categories) ? newsItem.categories : [],
      mediaFiles: [],
      source: newsItem.source || '',
    };
  } else {
    editingNews.value = false;
    newsForm.value = {
      id: null,
      title: '',
      content: '',
      defaultLanguage: 'en',
      mediaFiles: [],
      categories: [],
      source: '',
    };
  }
  newsDialog.value = true;
}

function openTranslationDialog(newsItem) {
  currentNewsTranslations.value = newsItem.translations || [];
  editingTranslation.value = false;
  translationForm.value = {
    id: null,
    newsId: newsItem.id,
    languageCode: '',
    title: '',
    content: '',
  };
  translationDialog.value = true;
}

async function saveNews() {
  try {
    loading.value = true;
    const formData = new FormData();

    const categories = Array.isArray(newsForm.value.categories)
      ? newsForm.value.categories
      : [];

    if (editingNews.value && newsForm.value.id) {
      formData.append('id', newsForm.value.id.toString());
    }

    formData.append('title', newsForm.value.title);
    formData.append('content', newsForm.value.content);
    formData.append('defaultLanguage', newsForm.value.defaultLanguage);
    formData.append('categories', JSON.stringify(categories));
    formData.append('source', newsForm.value.source || '');

    if (newsForm.value.mediaFiles) {
      newsForm.value.mediaFiles.forEach((file) => {
        formData.append('files', file);
      });
    }

    if (editingNews.value) {
      await api.put(`/news/update-news/${newsForm.value.id}`, formData);
    } else {
      await api.post('/news/create-news', formData);
    }

    newsDialog.value = false;
    await loadNews();
    $q.notify({
      color: 'positive',
      message: `News ${editingNews.value ? 'updated' : 'created'} successfully`,
    });
  } catch (error) {
    console.error('Save news error:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to save news',
    });
  } finally {
    loading.value = false;
  }
}

async function saveTranslation() {
  try {
    loading.value = true;
    if (editingTranslation.value) {
      await api.put(
        `/news/translations/${translationForm.value.id}`,
        translationForm.value
      );
    } else {
      await api.post('/news/translations', translationForm.value);
    }

    translationDialog.value = false;
    await loadNews();
    $q.notify({
      color: 'positive',
      message: `Translation ${
        editingTranslation.value ? 'updated' : 'saved'
      } successfully`,
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to save translation',
    });
  } finally {
    loading.value = false;
  }
}

async function confirmDelete(newsItem) {
  try {
    $q.dialog({
      title: 'Confirm',
      message: 'Are you sure you want to delete this news?',
      cancel: true,
      persistent: true,
    })
      .onOk(async () => {
        try {
          loading.value = true;
          await api.delete(`/news/${newsItem.id}`);
          await loadNews();
          $q.notify({
            color: 'positive',
            message: 'News deleted successfully',
          });
        } catch (error) {
          $q.notify({
            color: 'negative',
            message: 'Failed to delete news',
          });
        } finally {
          loading.value = false;
        }
      })
      .onCancel(() => {
        console.log('cancelled');
      });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to show delete confirmation',
    });
  }
}

function onRequest(props) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  loadNews();
}

function getLanguageLabel(code: string) {
  return languageOptions.find((opt) => opt.value === code)?.label || code;
}

function editTranslation(translation) {
  editingTranslation.value = true;
  translationForm.value = {
    id: translation.id,
    newsId: translation.newsId,
    languageCode: translation.languageCode,
    title: translation.title,
    content: translation.content,
  };
}

async function deleteTranslation(translation) {
  try {
    await $q
      .dialog({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this translation?',
        cancel: true,
        persistent: true,
      })
      .onOk(async () => {
        await api.delete(`/news/translations/${translation.id}`);
        await loadNews();
        $q.notify({
          color: 'positive',
          message: 'Translation deleted successfully',
        });
      });
  } catch (error) {
    if (error) {
      // Check if error is not from cancel button
      $q.notify({
        color: 'negative',
        message: 'Failed to delete translation',
      });
    }
  }
}

const availableLanguageOptions = computed(() => {
  const usedLanguages = new Set(
    currentNewsTranslations.value.map((t) => t.languageCode)
  );
  return languageOptions.filter(
    (lang) =>
      !usedLanguages.has(lang.value) ||
      lang.value === translationForm.value.languageCode
  );
});

onMounted(() => {
  loadNews();
});
</script>
