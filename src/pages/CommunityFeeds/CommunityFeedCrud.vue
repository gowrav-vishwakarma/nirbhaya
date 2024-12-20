<template>
  <q-page padding>
    <!-- Add/Edit Form -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Edit Feed' : 'Add New Feed' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="form.title" label="Title" :rules="[val => !!val || 'Title is required']" />

          <q-input v-model="form.content" type="textarea" label="Content"
            :rules="[val => !!val || 'Content is required']" />

          <q-file v-model="form.mediaFiles" label="Media Files" multiple accept="image/*,video/*" :loading="loading">
            <template v-slot:append>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div v-if="form.mediaUrls.length" class="row q-gutter-sm">
            <div v-for="(url, index) in form.mediaUrls" :key="index" class="col-auto">
              <q-img :src="url" style="height: 140px; width: 140px; border-radius: 8px;">
                <div class="absolute-top-right q-pa-xs">
                  <q-btn round flat dense color="negative" icon="close" @click="removeMedia(index)"
                    class="bg-grey-8 bg-opacity-50" />
                </div>
              </q-img>
            </div>
          </div>

          <q-select v-model="form.category" :options="['general', 'emergency', 'alert', 'news']" label="Category" />

          <q-select v-model="form.tags" multiple use-input use-chips input-debounce="0" label="Tags"
            @new-value="createTag" />

          <q-input v-model="form.location" label="Location" readonly
            :value="form.location ? `${form.location.coordinates[0]}, ${form.location.coordinates[1]}` : ''">
            <template v-slot:append>
              <q-btn icon="location_on" @click="getCurrentLocation" />
            </template>
          </q-input>

          <q-toggle v-model="form.isEmergency" label="Mark as Emergency" />

          <div class="row justify-end q-gutter-sm">
            <q-btn type="button" color="grey" label="Cancel" @click="resetForm" />
            <q-btn type="submit" color="primary" :label="isEditing ? 'Update' : 'Submit'" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Table with Pagination -->
    <q-table :rows="feeds" :columns="columns" row-key="id" :loading="loading" v-model:pagination="pagination">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn flat round color="primary" icon="edit" @click="editFeed(props.row)" />
            <q-btn flat round color="negative" icon="delete" @click="deleteFeed(props.row.id)" />
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';



const userStore = useUserStore();
const $q = useQuasar();
const loading = ref(false);
const isEditing = ref(false);
const feeds = ref<[]>([]);
const media = ref()

// First, let's fix the form interface to properly type the fields
interface FeedForm {
  id: number | null;
  title: string;
  content: string;
  mediaUrls: string[];
  mediaFiles: File[];
  uploadedUrls: string[];
  category: string;
  tags: string[];
  location: {
    type: string;
    coordinates: number[];
  } | null;
  locations: any[];
  isEmergency: boolean;
}

const form = ref<FeedForm>({
  id: null,
  title: '',
  content: '',
  mediaUrls: [],
  mediaFiles: [],
  uploadedUrls: [],
  category: 'general',
  tags: [],
  location: null,
  locations: [],
  isEmergency: false,
});

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'title', label: 'Title', field: 'title' },
  { name: 'category', label: 'Category', field: 'category' },
  { name: 'isEmergency', label: 'Emergency', field: 'isEmergency' },
  { name: 'likesCount', label: 'Likes', field: 'likesCount' },
  { name: 'commentsCount', label: 'Comments', field: 'commentsCount' },
  { name: 'status', label: 'Status', field: 'status' },
  { name: 'actions', label: 'Actions', field: 'actions' },
];

const locationDisplay = computed(() => {
  if (!form.value.location) return '';
  const coords = form.value.location.coordinates;
  return `${coords[0]}, ${coords[1]}`;
});

const pagination = ref({
  page: 1,
  rowsPerPage: 10, // Number of rows per page
  rowsNumber: 0, // Total number of rows, to be set after fetching data
});


async function loadFeeds() {
  try {
    loading.value = true;
    const response = await api.get('/news/news', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
      },
    });
    feeds.value = response.data;
    pagination.value.rowsNumber = response.data.length; // Adjust if total is not available
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to load feeds',
      position:'top-right'
    });
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  try {
    loading.value = true;

    // Create form data for media files
    const formData = await handleMediaUpload(form.value.mediaFiles);

    // Prepare payload data and append it to formData
    const payload = {
      ...form.value,
      userId: userStore.user.id
    };

    Object.keys(payload).forEach(key => {
      if (key !== 'mediaFiles') {
        formData.append(key, payload[key]);
      }
    });

    // Now formData contains both the payload and media files
    const url = isEditing.value
      ? `/api/community-feeds/${form.value.id}`
      : '/news/create-news';

    const method = isEditing.value ? 'put' : 'post';

    await api[method](url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const successMessage = isEditing.value ? 'Feed updated successfully' : 'Feed created successfully';
    $q.notify({ color: 'positive', message: successMessage, position:'top-right' });
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Failed to create or update feed', position:'top-right' });
  } finally {
    loading.value = false;
  }
}

async function handleMediaUpload(files: File[]) {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('files', file));
  return formData;
}


function editFeed(feed: Partial<FeedForm>) {
  isEditing.value = true;
  form.value = {
    ...form.value,
    ...feed,
    mediaFiles: [], // Reset media files when editing
    mediaUrls: feed.mediaUrls || []
  };
}

async function deleteFeed(id: number) {
  try {
    await $q.dialog({
      title: 'Confirm',
      message: 'Are you sure you want to delete this feed?',
      cancel: true,
    });

    await api.delete(`/api/community-feeds/${id}`);
    $q.notify({ color: 'black', message: 'Feed deleted successfully', position:'top-right' });
    await loadFeeds();
  } catch (error) {
    if (error) {
      $q.notify({
        color: 'negative',
        message: 'Delete operation failed',
        position:'top-right'
      });
    }
  }
}

async function getCurrentLocation() {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    form.value.location = {
      type: 'Point',
      coordinates: [position.coords.longitude, position.coords.latitude],
    };
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to get location',
      position:'top-right'
    });
  }
}

// Update the handleMediaUpload function to immediately upload files

function createTag(val: string, done: (val?: string) => void) {
  if (val.length > 0) {
    if (!form.value.tags.includes(val)) {
      form.value.tags.push(val);
    }
    done(val);
  }
}

function resetForm() {
  isEditing.value = false;
  form.value = {
    id: null,
    title: '',
    content: '',
    mediaUrls: [],
    mediaFiles: [],
    uploadedUrls: [],
    category: 'general',
    tags: [],
    location: null,
    locations: [],
    isEmergency: false,
  };
}

// Update the removeMedia function to handle both local files and URLs
function removeMedia(index: number) {
  form.value.mediaUrls.splice(index, 1);
  form.value.mediaFiles.splice(index, 1);
}

onMounted(() => {
  loadFeeds();
});
</script>

<style scoped>
.q-table {
  background: white;
}
</style>
