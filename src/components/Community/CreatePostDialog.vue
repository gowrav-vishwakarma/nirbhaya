<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Create Post</div>
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
            <div class="text-weight-bold">SOS Bharat Community</div>
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
          <div v-if="form.tags.length === 0" class="text-grey-6">
            No tags added yet
          </div>
        </div>

        <div class="q-mt-md">
          <q-select
            v-model="selectedLocationId"
            :options="[
              ...savedLocations,
              { id: -1, name: 'Select on Map', location: null },
            ]"
            option-value="id"
            option-label="name"
            label="Select Location (to primarily display this post)"
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
                    {{ scope.opt.location.coordinates.join(', ') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <LocationSelectorDialog
            v-model="showLocationSelector"
            :zoom="17"
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

          <q-select
            v-if="isBusinessPost"
            v-model="form.businessCategory"
            :options="businessCategories"
            label="Select Business Category"
            class="q-mb-md"
            emit-value
            option-value="value"
            option-label="label"
            map-options
            :filter="filterBusinessCategories"
            :rules="[(val) => !!val || 'Please select a category']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results found
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <template v-if="scope.opt.group">
                <q-item-label
                  header
                  class="text-weight-bold bg-grey-2 q-pa-sm"
                  :key="scope.opt.id"
                >
                  {{ scope.opt.group }}
                </q-item-label>
              </template>
              <template v-else>
                <q-item v-bind="scope.itemProps" :key="scope.opt.id">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </template>
          </q-select>
        </div>

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
                  : `Add Photo (${selectedFiles.length}/4)`
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
            :style="{
              'max-width': previewUrls.length === 1 ? '300px' : 'none',
            }"
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
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          unelevated
          color="primary"
          :disable="!isValid || isSubmitting"
          @click="submitPost"
          class="full-width"
          :loading="isSubmitting"
        >
          <span style="font-size: 14px; font-weight: 800">
            {{ isSubmitting ? 'Posting...' : 'Post' }}
          </span>
          <template v-slot:loading>
            <q-spinner />
          </template>
          <i
            v-if="!isSubmitting"
            class="fas fa-long-arrow-alt-right"
            style="font-size: 17px; font-weight: 900; margin-left: 5px"
          ></i>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { Geolocation } from '@capacitor/geolocation';
import LocationSelectorDialog from '../Location/LocationSelectorDialog.vue';
import businessCategoriesData from 'src/jsondata/businessCategories.json';

const userStore = useUserStore();

/// <reference types="@types/google.maps" />

const $q = useQuasar();
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'post-created'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const form = ref({
  title: '',
  description: '',
  mediaUrls: [] as string[],
  videoUrl: '',
  tags: [] as string[],
  location: {
    type: 'Point',
    coordinates: [0, 0],
  },
  showLocation: false,
  businessCategory: null as string | null,
});

const tagInput = ref('');

const titleCharCount = computed(() => {
  return form.value.title.length;
});

const descriptionCharCount = computed(() => {
  return form.value.description.length;
});

const isValid = computed(() => {
  const hasTitle = form.value.title.trim().length > 0;
  const hasDescription = form.value.description.trim().length > 0;
  const hasMedia = selectedFiles.value.length > 0;

  // Check if at least one field has content
  const hasContent = hasTitle || hasDescription || hasMedia;

  // Check if the content meets length restrictions
  const validLength =
    form.value.title.length <= 50 && form.value.description.length <= 1000;

  return hasContent && validLength;
});

const canAddMoreTags = computed(() => {
  return form.value.tags.length < 5;
});

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !form.value.tags.includes(tag) && canAddMoreTags.value) {
    form.value.tags.push(tag);
  } else if (!canAddMoreTags.value) {
    console.log('Maximum 5 tags allowed');

    // $q.notify({
    //   color: 'warning',
    //   message: 'Maximum 5 tags allowed',
    //   icon: 'warning'
    // });
  }
  tagInput.value = '';
};

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag);
};

const fileInput = ref<HTMLInputElement | null>(null);

const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);

const canAddMoreImages = computed(() => {
  return selectedFiles.value.length < 4;
});

const resizeImage = (file: File): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        const aspectRatio = width / height;

        // Target size is 1MB (1048576 bytes)
        const MAX_SIZE = 1048576;

        // Start with maximum dimensions while maintaining aspect ratio
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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality 0.7 and adjust if needed
        let quality = 0.7;
        const compressImage = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // If the blob is still too large and quality can be reduced
              if (blob.size > MAX_SIZE && q > 0.1) {
                // Reduce quality by 0.1 and try again
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

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const isProcessingImages = ref(false);

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
        const remainingSlots = 4 - selectedFiles.value.length;
        const filesToAdd = Array.from(files).slice(0, remainingSlots);

        if (files.length > remainingSlots) {
          // $q.notify({
          //   color: 'warning',
          //   message: 'Maximum 4 images allowed',
          //   icon: 'warning'
          // });
          console.log('Maximum 4 images allowed');
        }

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
        } finally {
          isProcessingImages.value = false;
        }
      } else {
        isProcessingImages.value = false;
      }
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

interface SavedLocation {
  id: number;
  name: string;
  location: {
    type: string;
    coordinates: number[];
  };
  timestamp: string | null;
}

const selectedLocationId = ref<number | null>(null);
const savedLocations = ref<SavedLocation[]>([]);
const isLoadingLocations = ref(true);

const loadSavedLocations = async () => {
  isLoadingLocations.value = true;
  try {
    // Reset saved locations
    savedLocations.value = [];

    // Add current location as first option with placeholder coordinates
    savedLocations.value = [
      {
        id: 0,
        name: 'Current Location',
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        timestamp: null,
        isBusinessLocation: false,
      },
    ];

    // Add user's saved locations
    if (userStore.user?.locations) {
      const userLocations = userStore.user.locations.map((loc) => ({
        id: Math.random(),
        name: loc.name || 'Saved Location',
        location: {
          type: 'Point',
          coordinates: loc.location.coordinates,
        },
        timestamp: null,
        isBusinessLocation: loc.isBusinessLocation || false,
      })) as SavedLocation[];

      savedLocations.value = [...savedLocations.value, ...userLocations];
    }
  } finally {
    isLoadingLocations.value = false;
  }
};

const getCurrentLocation = async () => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    if (position) {
      if (savedLocations.value.length > 0) {
        savedLocations.value[0].location.coordinates = [
          position.coords.longitude,
          position.coords.latitude,
        ];
      }

      // Only set current location if no location is currently selected
      if (selectedLocationId.value === null) {
        selectedLocationId.value = 0;
        // Update form location only when setting to current location
        form.value.location = savedLocations.value[0].location;
      }
    }
  } catch (error) {
    // Remove current location option if we can't get the location
    savedLocations.value = savedLocations.value.filter((loc) => loc.id !== 0);

    // If current location was selected or no location is selected,
    // select the first saved location if available
    if (selectedLocationId.value === 0 || selectedLocationId.value === null) {
      const firstSavedLocation = savedLocations.value[0];
      if (firstSavedLocation) {
        selectedLocationId.value = firstSavedLocation.id;
        form.value.location = firstSavedLocation.location;
      }
    }

    console.error('Error getting current location:', error);
  }
};

// Add a watch for dialog open state
watch(
  () => isOpen.value,
  async (newValue) => {
    if (newValue) {
      // Reset form when dialog opens
      form.value = {
        title: '',
        description: '',
        mediaUrls: [],
        videoUrl: '',
        tags: [],
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        showLocation: false,
        businessCategory: null,
      };

      // Reset files and previews
      selectedFiles.value = [];
      previewUrls.value.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.value = [];

      // Reset location selection
      selectedLocationId.value = null;

      // Load locations and set current location
      await loadSavedLocations();
      await getCurrentLocation();

      // Set to current location by default
      if (savedLocations.value.length > 0) {
        selectedLocationId.value = 0; // Current location has id 0
      }
    }
  }
);

// Add a watch for selectedLocationId to update form location when selection changes
watch(
  () => selectedLocationId.value,
  (newValue) => {
    if (newValue === -1) {
      showLocationSelector.value = true;
      return;
    }

    const selectedLocation = savedLocations.value.find(
      (loc) => loc.id === newValue
    );
    if (selectedLocation) {
      form.value.location = selectedLocation.location;
      isBusinessPost.value = selectedLocation.isBusinessLocation || false;
    }
  }
);

const isSubmitting = ref(false);

const hasBusinessLocation = computed(() => {
  return savedLocations.value.some((loc) => loc.isBusinessLocation);
});

const isBusinessPost = ref(false);

const businessCategories = computed(() => {
  const categories = businessCategoriesData;

  // Transform the categories into a flat list with group headers and unique keys
  return categories.reduce((acc, category, categoryIndex) => {
    return [
      ...acc,
      {
        group: category.group,
        id: `group_${categoryIndex}`,
        value: `group_${categoryIndex}`,
      },
      ...category.options.map((opt, optIndex) => ({
        ...opt,
        groupName: category.group,
        id: `${categoryIndex}_${optIndex}`,
      })),
    ];
  }, [] as Array<any>);
});

const submitPost = async () => {
  try {
    isSubmitting.value = true;

    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('postType', 'community');
    formData.append('status', 'active');
    formData.append('location', JSON.stringify(form.value.location));
    formData.append('showLocation', String(form.value.showLocation));
    formData.append('tags', JSON.stringify(form.value.tags));
    formData.append('userId', String(userStore.user?.id || ''));
    formData.append(
      'userName',
      isBusinessPost.value
        ? userStore.user?.businessName || ''
        : userStore.user?.name || ''
    );
    formData.append('isBusinessPost', String(isBusinessPost.value));

    // Add whatsappNumber if it's a business post
    if (isBusinessPost.value && userStore.user?.whatsappNumber) {
      formData.append('whatsappNumber', userStore.user.whatsappNumber);
    }

    // Append each file
    selectedFiles.value.forEach((file, index) => {
      formData.append(`media_${index}`, file);
    });

    if (isBusinessPost.value && form.value.businessCategory) {
      formData.append('businessCategory', form.value.businessCategory);
    }

    await api.post('/posts/post-create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Reset form and images
    form.value = {
      title: '',
      description: '',
      mediaUrls: [],
      videoUrl: '',
      tags: [],
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      showLocation: true,
      businessCategory: null,
    };
    selectedFiles.value = [];
    previewUrls.value.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.value = [];

    isOpen.value = false;
    emit('post-created');
  } catch (error) {
    console.error('Error creating post:', error);
    // $q.notify({
    //   color: 'negative',
    //   message: 'Failed to create post',
    //   icon: 'error'
    // });
  } finally {
    isSubmitting.value = false;
  }
};

// Add new watch for isBusinessPost
watch(
  () => isBusinessPost.value,
  (newValue) => {
    if (newValue) {
      // Find first business location
      const businessLocation = savedLocations.value.find(
        (loc) => loc.isBusinessLocation
      );
      if (businessLocation) {
        selectedLocationId.value = businessLocation.id;
        form.value.showLocation = true;
      }
    } else {
      // Find first non-business location
      const nonBusinessLocation = savedLocations.value.find(
        (loc) => !loc.isBusinessLocation
      );
      if (nonBusinessLocation) {
        selectedLocationId.value = nonBusinessLocation.id;
      }
    }
  }
);

const showLocationSelector = ref(false);

const handleLocationSelected = (location: {
  type: string;
  coordinates: number[];
}) => {
  // Add the selected location to saved locations
  const newLocation = {
    id: Date.now(), // Generate a unique ID
    name: 'Custom Location',
    location: location,
    timestamp: null,
    isBusinessLocation: false,
  };

  savedLocations.value = [...savedLocations.value, newLocation];
  selectedLocationId.value = newLocation.id;
  form.value.location = location;
};

// Add to your watch for isBusinessPost:
watch(
  () => isBusinessPost.value,
  (newValue) => {
    if (!newValue) {
      form.value.businessCategory = null;
    }
  }
);

const filterBusinessCategories = (
  val: string,
  update: (callback: () => void) => void
) => {
  if (val === '') {
    update(() => {
      // Return all categories when search is empty
      return;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    const filtered = businessCategories.value.filter((item) => {
      // Don't filter group headers
      if (item.group) return true;

      // Search in both label and group name
      return (
        item.label?.toLowerCase().includes(needle) ||
        item.groupName?.toLowerCase().includes(needle)
      );
    });

    // Make sure we keep group headers for any matching items
    const groupsWithMatches = new Set(
      filtered.filter((item) => !item.group).map((item) => item.groupName)
    );

    return filtered.filter(
      (item) => !item.group || groupsWithMatches.has(item.group)
    );
  });
};
</script>

<style scoped>
.q-dialog__inner {
  min-width: 80vw;
}

.description-input :deep(.q-field__native) {
  min-height: 150px;
  padding: 12px;
}

.description-input :deep(.q-field__control) {
  height: auto;
  min-height: 150px;
}
</style>
