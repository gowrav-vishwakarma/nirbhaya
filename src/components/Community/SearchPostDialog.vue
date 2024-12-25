<template>
  <q-dialog v-model="isOpen" position="top">
    <q-card style="width: 100%; max-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Search Posts</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-input
          v-model="searchForm.query"
          label="Search keywords"
          clearable
          class="q-mb-md"
        />

        <q-select
          v-model="searchForm.businessCategory"
          :options="businessCategories"
          label="Business Category"
          clearable
          emit-value
          option-value="value"
          option-label="label"
          map-options
          :filter="filterBusinessCategories"
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
              <q-item-label header class="text-weight-bold bg-grey-2 q-pa-sm">
                {{ scope.opt.group }}
              </q-item-label>
            </template>
            <template v-else>
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Clear" @click="clearSearch" v-close-popup />
        <q-btn flat label="Search" @click="handleSearch" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import businessCategoriesData from 'src/jsondata/businessCategories.json';

const props = defineProps<{
  modelValue: boolean;
  initialQuery?: string;
  initialCategory?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'search',
    params: { query: string; businessCategory: string | null }
  ): void;
  (e: 'clear'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const searchForm = ref({
  query: props.initialQuery || '',
  businessCategory: props.initialCategory || null,
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      searchForm.value = {
        query: props.initialQuery || '',
        businessCategory: props.initialCategory || null,
      };
    }
  }
);

const businessCategories = computed(() => {
  const categories = businessCategoriesData;
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

const filterBusinessCategories = (
  val: string,
  update: (callback: () => void) => void
) => {
  if (val === '') {
    update(() => {
      return;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    const filtered = businessCategories.value.filter((item) => {
      if (item.group) return true;
      return (
        item.label?.toLowerCase().includes(needle) ||
        item.groupName?.toLowerCase().includes(needle)
      );
    });

    const groupsWithMatches = new Set(
      filtered.filter((item) => !item.group).map((item) => item.groupName)
    );

    return filtered.filter(
      (item) => !item.group || groupsWithMatches.has(item.group)
    );
  });
};

const handleSearch = () => {
  emit('search', {
    query: searchForm.value.query,
    businessCategory: searchForm.value.businessCategory,
  });
};

const clearSearch = () => {
  searchForm.value.query = '';
  searchForm.value.businessCategory = null;
  emit('clear');
};
</script>
