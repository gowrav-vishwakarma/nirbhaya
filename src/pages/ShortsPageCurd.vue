<template>
  <q-page padding>
    <!-- Form Section -->
    <div class="q-mb-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Incident' : 'Add New Incident' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input v-model="form.title" label="Title" :rules="[val => !!val || 'Title is required']" />

            <q-input v-model="form.description" type="textarea" label="Description"
              :rules="[val => !!val || 'Description is required']" />

            <q-input v-model="form.videoUrl" label="Video URL" :rules="[val => !!val || 'Video URL is required']" />

            <div class="row q-col-gutter-md q-px-md">
              <div class="col-12 col-sm-6">
                <q-select v-model="form.videoSource" :options="['normal', 'youtube']" label="Video Source"
                  :rules="[val => !!val || 'Video source is required']" />
              </div>
              <div class="col-12 col-sm-6">
                <q-select v-model="form.status" :options="['Active', 'InActive']" label="Status"
                  :rules="[val => !!val || 'Status is required']" />
              </div>
            </div>

            <div>
              <q-btn type="submit" color="primary" :label="isEditing ? 'Update' : 'Submit'" />
              <q-btn v-if="isEditing" flat color="red" label="Cancel" class="q-ml-sm" @click="resetForm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Table Section -->
    <q-table :rows="incidents" :columns="columns" row-key="id" :loading="loading">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" @click="editIncident(props.row)" />
          <q-btn flat round color="negative" icon="delete" @click="deleteIncident(props.row.id)" />
        </q-td>
      </template>
      <template v-slot:body-cell-info="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-x-sm">
            <q-badge :color="props.row.status === 'active' ? 'positive' : 'negative'">
              {{ props.row.status }}
            </q-badge>
            <q-badge :color="props.row.videoSource === 'youtube' ? 'red' : 'blue'">
              {{ props.row.videoSource }}
            </q-badge>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface Incident {
  id?: number
  title: string
  description: string
  videoUrl: string
  videoSource: 'normal' | 'youtube'
  status: 'active' | 'inactive'
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
}

const incidents = ref<Incident[]>([])
const loading = ref(false)
const isEditing = ref(false)

const form = ref<Incident>({
  title: '',
  description: '',
  videoUrl: '',
  videoSource: 'normal',
  status: 'active',
  location: {
    type: 'Point',
    coordinates: [0, 0]
  }
})

const columns = [
  { name: 'title', label: 'Title', field: 'title', sortable: true },
  { name: 'description', label: 'Description', field: 'description' },
  { name: 'videoUrl', label: 'Video URL', field: 'videoUrl' },
  {
    name: 'info',
    label: 'Status & Source',
    field: row => ({ status: row.status, videoSource: row.videoSource }),
    sortable: true
  },
  {
    name: 'location',
    label: 'Location',
    field: (row: Incident) => {
      if (row.location?.coordinates && Array.isArray(row.location.coordinates)) {
        return row.location.coordinates.join(', ');
      }
      return 'N/A';
    },
    sortable: true
  },
  { name: 'actions', label: 'Actions', field: 'actions' }
]

const fetchIncidents = async () => {
  loading.value = true
  try {
    const response = await api.get('/incidents/shorts')
    incidents.value = response.data
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to fetch incidents',
      position:'top-right'
    })
  } finally {
    loading.value = false
  }
}

const getCurrentLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude])
      },
      (error) => {
        reject(error)
      }
    )
  })
}

const onSubmit = async () => {
  try {
    try {
      const coordinates = await getCurrentLocation()
      form.value.location = {
        type: 'Point',
        coordinates: coordinates
      }
    } catch (locationError) {
      $q.notify({
        color: 'warning',
        message: 'Could not get location. Using default coordinates.',
        timeout: 2000,
        position:'top-right'
      })
    }

    if (isEditing.value) {
      await api.put(`/incidents/shorts/${form.value.id}`, form.value)
      $q.notify({
        color: 'black',
        message: 'Incident updated successfully with location',
        position:'top-right'
      })
    } else {
      await api.post('/incidents/shorts', form.value)
      $q.notify({
        color: 'black',
        message: 'Incident created successfully with location',
        position:'top-right'
      })
    }
    resetForm()
    await fetchIncidents()
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Operation failed',
      position:'top-right'
    })
  }
}

const editIncident = (incident: Incident) => {
  form.value = {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    videoUrl: incident.videoUrl,
    videoSource: incident.videoSource,
    status: incident.status || 'active',
    location: incident.location || {
      type: 'Point',
      coordinates: [0, 0]
    }
  }
  isEditing.value = true
}

const deleteIncident = async (id: number) => {
  try {
    await api.delete(`/incidents/shorts/${id}`)
    await fetchIncidents()
    $q.notify({
      color: 'black',
      message: 'Incident deleted successfully',
      position:'top-right'

    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to delete incident',
      position:'top-right'
    })
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    videoUrl: '',
    videoSource: 'normal',
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    }
  }
  isEditing.value = false
}

onMounted(() => {
  fetchIncidents()
})
</script>
