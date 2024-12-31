<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized
  >
    <q-card class="dialog-card">
      <q-card-section class="row items-center">
        <div class="text-h6">Manage Catalog</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Left side - Settings -->
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1">Catalog Settings</div>

                <div class="q-mt-md">
                  <q-toggle
                    v-model="catalogData.hasCatalog"
                    label="Enable Product Catalog"
                    color="primary"
                  />
                </div>

                <div class="q-mt-md">
                  <q-toggle
                    v-model="catalogData.doesDelivery"
                    label="Provide Delivery"
                    color="primary"
                  />
                </div>

                <div class="q-mt-md" v-if="catalogData.doesDelivery">
                  <q-input
                    v-model="catalogData.deliveryText"
                    label="Delivery Information"
                    filled
                    hint="Delivery terms, minimum order value etc."
                  />

                  <q-input
                    v-model.number="catalogData.deliveryRange"
                    label="Delivery Range"
                    filled
                    type="number"
                    suffix="meters"
                    class="q-mt-sm"
                    :rules="[
                      (val) => val > 0 || 'Range must be greater than 0',
                      (val) =>
                        val <= 10000 || 'Maximum range is 10km (10000 meters)',
                    ]"
                  />
                </div>

                <div class="q-mt-md">
                  <q-btn
                    label="Save Settings"
                    color="primary"
                    :loading="saving"
                    @click="saveCatalogSettings"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Right side - Catalog Items -->
          <div class="col-12 col-md-8">
            <q-card flat bordered>
              <q-card-section>
                <div class="row items-center">
                  <div class="text-subtitle1">Catalog Items</div>
                  <q-space />
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Add Item"
                    @click="openItemDialog()"
                  />
                </div>

                <div class="q-mt-md">
                  <q-list separator>
                    <q-item
                      v-for="item in catalogData.catalogItems"
                      :key="item.id"
                      class="q-py-md"
                    >
                      <q-item-section avatar>
                        <q-img
                          :src="item.imageUrl ? imageCdn + item.imageUrl : ''"
                          style="width: 100px; height: 100px"
                          fit="cover"
                          class="cursor-pointer"
                          @click="showZoomImage(item.imageUrl)"
                        />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label>{{ item.title }}</q-item-label>
                        <q-item-label caption
                          >Sequence: {{ item.sequence }}</q-item-label
                        >
                      </q-item-section>

                      <q-item-section side>
                        <div class="row q-gutter-sm">
                          <q-btn
                            flat
                            round
                            color="primary"
                            icon="edit"
                            @click="openItemDialog(item)"
                          />
                          <q-btn
                            flat
                            round
                            color="negative"
                            icon="delete"
                            @click="confirmDelete(item)"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Item Dialog -->
    <q-dialog v-model="itemDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editingItem ? 'Edit' : 'Add' }} Item</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="itemForm.title"
            label="Title"
            filled
            :rules="[(val) => !!val || 'Title is required']"
          />

          <div class="q-mt-md">
            <q-img
              v-if="imagePreview"
              :src="imagePreview"
              style="height: 200px; max-width: 300px"
              class="q-mb-sm"
            />

            <q-file
              v-model="selectedFile"
              label="Upload Image"
              filled
              accept="image/*"
              @update:model-value="handleFileSelect"
              :rules="[(v) => !!v || 'Image is required']"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </div>

          <q-input
            v-model.number="itemForm.sequence"
            label="Sequence"
            filled
            type="number"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            :label="editingItem ? 'Save' : 'Add'"
            color="primary"
            :loading="savingItem"
            @click="saveItem"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Zoom Dialog -->
    <q-dialog v-model="zoomDialog">
      <q-card class="zoom-dialog">
        <q-card-section class="row items-center">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-img :src="zoomImageUrl" style="max-height: 90vh" fit="contain" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const loading = ref(false);
const saving = ref(false);
const itemDialog = ref(false);
const savingItem = ref(false);
const editingItem = ref<any>(null);

// Define the image CDN value
const imageCdn =
  'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/';

const itemForm = ref({
  title: '',
  imageUrl: '',
  sequence: 0,
});

const selectedFile = ref<File | null>(null);
const imagePreview = ref<string>('');

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

defineProps<{
  modelValue: boolean;
}>();

interface CatalogItem {
  id: number;
  title: string;
  imageUrl: string;
  sequence: number;
}

interface CatalogData {
  hasCatalog: boolean;
  doesDelivery: boolean;
  deliveryText: string;
  deliveryRange: number;
  catalogItems: CatalogItem[];
}

const catalogData = ref<CatalogData>({
  hasCatalog: false,
  doesDelivery: false,
  deliveryText: '',
  deliveryRange: 1000,
  catalogItems: [],
});

const fetchCatalogData = async () => {
  try {
    loading.value = true;
    const response = await api.get('/community/business-catalog');
    catalogData.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load catalog information',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

const saveCatalogSettings = async () => {
  try {
    saving.value = true;
    await api.post('/community/business-catalog', catalogData.value);

    $q.notify({
      type: 'positive',
      message: 'Catalog settings saved successfully',
      position: 'top',
    });

    emit('update:modelValue', false);
    emit('close');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to save catalog settings',
      position: 'top',
    });
  } finally {
    saving.value = false;
  }
};

const handleFileSelect = (file: File) => {
  if (file) {
    imagePreview.value = URL.createObjectURL(file);
  } else {
    imagePreview.value = '';
  }
};

const openItemDialog = (item?: CatalogItem) => {
  if (item) {
    editingItem.value = item;
    itemForm.value = { ...item };
    imagePreview.value = item.imageUrl;
  } else {
    editingItem.value = null;
    itemForm.value = {
      title: '',
      imageUrl: '',
      sequence: catalogData.value.catalogItems.length,
    };
    imagePreview.value = '';
  }
  selectedFile.value = null;
  itemDialog.value = true;
};

const saveItem = async () => {
  try {
    savingItem.value = true;

    const formData = new FormData();
    formData.append('title', itemForm.value.title);
    formData.append('sequence', String(itemForm.value.sequence));

    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }

    if (editingItem.value) {
      await api.put(
        `/community/catalog-items/${editingItem.value.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } else {
      await api.post('/community/catalog-items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    await fetchCatalogData();
    itemDialog.value = false;

    // Clear the form and preview
    selectedFile.value = null;
    imagePreview.value = '';

    $q.notify({
      type: 'positive',
      message: `Item ${editingItem.value ? 'updated' : 'added'} successfully`,
      position: 'top',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Failed to ${editingItem.value ? 'update' : 'add'} item`,
      position: 'top',
    });
  } finally {
    savingItem.value = false;
  }
};

const confirmDelete = (item: CatalogItem) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this item?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/community/catalog-items/${item.id}`);
      await fetchCatalogData();

      $q.notify({
        type: 'positive',
        message: 'Item deleted successfully',
        position: 'top',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete item',
        position: 'top',
      });
    }
  });
};

// Add new ref for zoom dialog
const zoomDialog = ref(false);
const zoomImageUrl = ref('');

// Add new function to handle image zoom
const showZoomImage = (imageUrl: string) => {
  zoomImageUrl.value = imageCdn + imageUrl;
  zoomDialog.value = true;
};

onMounted(() => {
  fetchCatalogData();
});
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.q-card) {
  overflow: hidden;
}

:deep(.q-img) {
  max-width: 100%;
}

@media (max-width: 599px) {
  .q-card-section {
    padding: 16px;
  }
}

.zoom-dialog {
  min-width: 80vw;
  min-height: 80vh;
  background: rgba(0, 0, 0, 0.8);
}

.zoom-dialog :deep(.q-img) {
  width: 100%;
  height: 100%;
}
</style>
