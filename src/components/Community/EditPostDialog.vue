<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Edit Post</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator class="q-my-md" />

      <q-card-section class="col q-pt-none scroll">
        <div class="row items-center q-mb-md">
          <q-avatar size="40px">
            <img src="/sos_logo_1080_1080.png" />
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-weight-bold">{{ post.userName }}</div>
            <q-btn
              dense
              flat
              size="sm"
              icon="fas fa-globe-americas"
              label="Public"
            />
          </div>
        </div>

        <q-input
          v-model="form.title"
          label="Title"
          class="q-mb-md"
          maxlength="50"
          :rules="[
            (val) => val.length <= 50 || 'Title cannot exceed 50 characters',
          ]"
        >
          <template v-slot:hint> {{ titleCharCount }}/50 characters </template>
        </q-input>

        <q-input
          outlined
          v-model="form.description"
          type="textarea"
          label="Description"
          placeholder="What do you want to share?"
          autogrow
          class="description-input q-mb-md"
          :input-style="{
            minHeight: '150px',
            fontSize: '16px',
            lineHeight: '1.5',
          }"
          :rows="6"
          maxlength="1000"
          :rules="[
            (val) =>
              val.length <= 1000 || 'Description cannot exceed 1000 characters',
          ]"
        >
          <template v-slot:hint>
            {{ descriptionCharCount }}/1000 characters
          </template>
        </q-input>

        <!-- Tags Input -->
        <q-input
          v-model="tagInput"
          label="Add tags (press Enter to add)"
          @keyup.enter="addTag"
          class="q-mt-md"
          :disable="!canAddMoreTags"
          :hint="
            canAddMoreTags ? 'Add up to 5 tags' : 'Maximum tags limit reached'
          "
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="add"
              @click="addTag"
              :disable="!canAddMoreTags"
            />
          </template>
        </q-input>

        <!-- Tags Display -->
        <div class="q-mt-sm row q-gutter-xs">
          <q-chip
            v-for="tag in form.tags"
            :key="tag"
            removable
            @remove="removeTag(tag)"
            color="primary"
            text-color="white"
          >
            #{{ tag }}
          </q-chip>
        </div>

        <div class="q-mt-md">
          <!-- Show current location text -->
          <div class="text-caption q-mb-sm">
            Current Location: {{ currentLocationText }}
          </div>

          <q-select
            v-model="selectedLocationId"
            :options="locationOptions"
            option-value="id"
            option-label="name"
            label="Select New Location"
            emit-value
            map-options
            class="q-mb-md"
            :loading="isLoadingLocations"
            :disable="isLoadingLocations"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.location">
                    {{ formatLocationCoords(scope.opt.location.coordinates) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <LocationSelectorDialog
            v-model="showLocationSelector"
            @location-selected="handleLocationSelected"
          />

          <q-checkbox
            v-model="isBusinessPost"
            label="Business Post"
            v-if="hasBusinessLocation"
            class="q-mb-md"
          />
          <q-checkbox
            v-model="form.showLocation"
            label="Show location on post"
            class="q-mb-md"
          />
        </div>

        <!-- Image Management -->
        <div class="row q-mt-lg">
          <q-btn
            flat
            color="primary"
            class="full-width"
            @click="handleMediaUpload"
            :loading="isProcessingImages"
            :disable="isProcessingImages || !canAddMoreImages"
          >
            <div class="row items-center">
              <q-icon name="far fa-image" size="24px" class="q-mr-sm" />
              {{
                isProcessingImages
                  ? 'Processing...'
                  : `Add Photo (${totalImages}/4)`
              }}
            </div>
          </q-btn>
        </div>

        <!-- Image Preview Section -->
        <div v-if="previewUrls.length > 0" class="row q-mt-md q-gutter-x-sm">
          <div
            v-for="(url, index) in previewUrls"
            :key="index"
            :class="{
              'col-6': previewUrls.length <= 2,
              'col-4': previewUrls.length === 3,
              'col-3': previewUrls.length === 4,
            }"
            class="relative-position"
          >
            <q-img
              :src="url"
              class="rounded-borders"
              style="aspect-ratio: 1; object-fit: cover"
            >
              <div class="absolute-top-right q-pa-xs">
                <q-btn
                  round
                  dense
                  color="grey-7"
                  icon="close"
                  size="sm"
                  @click="removeImage(index)"
                />
              </div>
            </q-img>
          </div>
        </div>

        <!-- Existing Images -->
        <div v-if="existingImages.length > 0" class="row q-mt-md q-gutter-x-sm">
          <div
            v-for="(url, index) in existingImages"
            :key="'existing-' + index"
            :class="{
              'col-6': existingImages.length <= 2,
              'col-4': existingImages.length === 3,
              'col-3': existingImages.length === 4,
            }"
            class="relative-position"
          >
            <q-img
              :src="imageCdn + url"
              class="rounded-borders"
              style="aspect-ratio: 1; object-fit: cover"
            >
              <div class="absolute-top-right q-pa-xs">
                <q-btn
                  round
                  dense
                  color="grey-7"
                  icon="close"
                  size="sm"
                  @click="removeExistingImage(index)"
                />
              </div>
            </q-img>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          unelevated
          color="primary"
          :disable="!isValid || isSubmitting"
          @click="submitUpdate"
          class="full-width"
          :loading="isSubmitting"
        >
          <span style="font-size: 14px; font-weight: 800">
            {{ isSubmitting ? 'Updating...' : 'Update' }}
          </span>
          <template v-slot:loading>
            <q-spinner />
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import LocationSelectorDialog from '../Location/LocationSelectorDialog.vue';
import type { CommunityPost } from 'src/types/CommunityPost';
import { Geolocation } from '@capacitor/geolocation';

const props = defineProps<{
  modelValue: boolean;
  post: CommunityPost;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'post-updated'): void;
}>();

const userStore = useUserStore();
const $q = useQuasar();

const imageCdn =
  'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/';

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Initialize form with post data
const form = ref({
  title: props.post.title,
  description: props.post.description,
  tags: props.post.tags || [],
  showLocation: props.post.showLocation,
  location: props.post.location
    ? {
        type: 'Point',
        coordinates: [props.post.location.x, props.post.location.y],
      }
    : null,
});

const existingImages = ref(props.post.mediaUrls || []);
const deletedImages = ref<string[]>([]);

// Add missing refs
const tagInput = ref('');
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const isProcessingImages = ref(false);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const showLocationSelector = ref(false);
const isLoadingLocations = ref(false);
const selectedLocationId = ref<string | number | null>(
  props.post.location ? 'post-location' : null
);
const savedLocations = ref([
  { id: 0, name: 'Current Location' },
  ...(userStore.user?.locations?.map((loc) => ({
    id: Math.random(),
    name: loc.name,
    location: loc.location,
    isBusinessLocation: loc.isBusinessLocation,
  })) || []),
  ...(props.post.location
    ? [
        {
          id: Math.random(),
          name: 'Post Location',
          location: {
            type: 'Point',
            coordinates: [props.post.location.x, props.post.location.y],
          },
          isBusinessLocation: props.post.isBusinessPost,
        },
      ]
    : []),
  { id: -1, name: 'Select on Map' },
]);
const isBusinessPost = ref(props.post.isBusinessPost || false);

// Add computed properties
const titleCharCount = computed(() => form.value.title.length);
const descriptionCharCount = computed(() => form.value.description.length);
const canAddMoreTags = computed(() => form.value.tags.length < 5);
const canAddMoreImages = computed(() => totalImages.value < 4);
const hasBusinessLocation = computed(() => {
  return (
    userStore.user?.locations?.some((loc) => loc.isBusinessLocation) || false
  );
});

const isValid = computed(() => {
  const hasTitle = form.value.title.trim().length > 0;
  const hasDescription = form.value.description.trim().length > 0;
  const validLength =
    form.value.title.length <= 50 && form.value.description.length <= 1000;
  return hasTitle && hasDescription && validLength;
});

// Add tag handling methods
const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !form.value.tags.includes(tag) && canAddMoreTags.value) {
    form.value.tags.push(tag);
  }
  tagInput.value = '';
};

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag);
};

// Add image handling methods
const handleMediaUpload = () => {
  isProcessingImages.value = true;

  if (!fileInput.value) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      'image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const remainingSlots = 4 - totalImages.value;
        const filesToAdd = Array.from(files).slice(0, remainingSlots);

        try {
          for (const file of filesToAdd) {
            if (!file.type.match(/^image\/(jpeg|png|gif|webp|heic|heif)$/)) {
              $q.notify({
                color: 'negative',
                message: 'Only image files are allowed',
                icon: 'error',
                position: 'top-right',
              });
              continue;
            }

            const resizedBlob = await resizeImage(file);
            const resizedFile = new File([resizedBlob], file.name, {
              type: file.type,
            });

            selectedFiles.value.push(resizedFile);
            const url = URL.createObjectURL(resizedBlob);
            previewUrls.value.push(url);
          }
        } catch (error) {
          console.error('Error processing images:', error);
          $q.notify({
            color: 'negative',
            message: 'Error processing images',
            icon: 'error',
            position: 'top-right',
          });
        }
      }
      isProcessingImages.value = false;
    };
    input.oncancel = () => {
      isProcessingImages.value = false;
    };
    fileInput.value = input;
  }

  if (canAddMoreImages.value) {
    fileInput.value.click();
  } else {
    isProcessingImages.value = false;
  }
};

const removeImage = (index: number) => {
  URL.revokeObjectURL(previewUrls.value[index]);
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

// Add image resizing function
const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const aspectRatio = width / height;
        const MAX_SIZE = 1048576; // 1MB
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = width / aspectRatio;
        }
        if (height > MAX_HEIGHT) {
          height = MAX_HEIGHT;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        const compressImage = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              if (blob.size > MAX_SIZE && q > 0.1) {
                compressImage(q - 0.1);
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            q
          );
        };
        compressImage(quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Add this computed property to show current location text
const currentLocationText = computed(() => {
  if (!form.value.location) return 'No location set';

  // Handle Point format
  if (form.value.location.type === 'Point') {
    const [longitude, latitude] = form.value.location.coordinates;
    return `${latitude}, ${longitude}`;
  }

  return 'No location set';
});

// Update location handling
const handleLocationSelected = async (location: {
  type: string;
  coordinates: number[];
}) => {
  form.value.location = location;
  showLocationSelector.value = false;

  // Update selected location ID to show "Custom Location" in select
  const customLocationId = `custom-${Date.now()}`;
  locationOptions.value.push({
    id: customLocationId,
    name: 'Custom Location',
    location: location,
    isBusinessLocation: false,
  });
  selectedLocationId.value = customLocationId;
};

// Update watcher for selectedLocationId
watch(
  () => selectedLocationId.value,
  async (newValue) => {
    if (newValue === -1) {
      showLocationSelector.value = true;
      return;
    }

    if (newValue === 0) {
      // Handle current location
      try {
        const position = await Geolocation.getCurrentPosition();
        form.value.location = {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude],
        };
      } catch (error) {
        console.error('Error getting current location:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to get current location',
          icon: 'error',
          position: 'top-right',
        });
      }
    } else {
      // Handle saved or custom location selection
      const selectedLocation = locationOptions.value.find(
        (loc) => loc.id === newValue
      );
      if (selectedLocation?.location) {
        form.value.location = selectedLocation.location;
        if (selectedLocation.isBusinessLocation) {
          isBusinessPost.value = true;
        }
      }
    }
  }
);

// Initialize component
// onMounted(async () => {
//   await loadSavedLocations();
// });

// Add computed for total images
const totalImages = computed(() => {
  return existingImages.value.length + selectedFiles.value.length;
});

// Add method to remove existing image
const removeExistingImage = (index: number) => {
  const imageUrl = existingImages.value[index];
  deletedImages.value.push(imageUrl);
  existingImages.value.splice(index, 1);
};

// Update submitUpdate to include all form data
const submitUpdate = async () => {
  try {
    isSubmitting.value = true;
    const formData = new FormData();

    // Match create post format
    formData.append('postId', props.post.id.toString());
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('postType', 'community');
    formData.append('status', 'active');

    // Send location in same format as create
    if (form.value.location) {
      formData.append('location', JSON.stringify(form.value.location)); // Already in {type: 'Point', coordinates: []} format
    }

    formData.append('showLocation', String(form.value.showLocation));
    formData.append('tags', JSON.stringify(form.value.tags));
    formData.append('userId', String(userStore.user?.id));
    formData.append(
      'userName',
      isBusinessPost.value
        ? userStore.user?.businessName || ''
        : userStore.user?.name || ''
    );
    formData.append('isBusinessPost', String(isBusinessPost.value));
    formData.append('deletedImages', JSON.stringify(deletedImages.value));

    // Add whatsappNumber if it's a business post
    if (isBusinessPost.value && userStore.user?.whatsappNumber) {
      formData.append('whatsappNumber', userStore.user.whatsappNumber);
    }

    // Append each new file
    selectedFiles.value.forEach((file, index) => {
      formData.append(`media_${index}`, file);
    });

    await api.post('/posts/post-update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    isOpen.value = false;
    emit('post-updated');

    $q.notify({
      color: 'positive',
      message: 'Post updated successfully',
      icon: 'check',
      position: 'top-right',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to update post',
      icon: 'error',
      position: 'top-right',
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Rest of the component logic...

const formatLocationCoords = (coords: number[]) => {
  if (!coords || coords.length !== 2) return '';
  const [longitude, latitude] = coords;
  return `${latitude}, ${longitude}`;
};

const locationOptions = computed(() => [
  { id: 0, name: 'Current Location' },
  ...(userStore.user?.locations?.map((loc) => ({
    id: Math.random(),
    name: loc.name || 'Saved Location',
    location: loc.location,
    isBusinessLocation: loc.isBusinessLocation,
  })) || []),
  ...(props.post.location
    ? [
        {
          id: 'post-location',
          name: 'Post Location',
          location: {
            type: 'Point',
            coordinates: [props.post.location.x, props.post.location.y],
          },
          isBusinessLocation: props.post.isBusinessPost,
        },
      ]
    : []),
  { id: -1, name: 'Select on Map' },
]);
</script>

<style scoped>
/* Same styles as CreatePostDialog */
</style>
