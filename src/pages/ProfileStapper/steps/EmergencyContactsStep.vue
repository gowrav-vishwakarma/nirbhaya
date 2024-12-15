<template>
  <div class="emergency-contacts-step">
    <h2 class="text-h5 q-mb-md">Emergency Contacts</h2>
    <p>Please fill in the details of your emergency contacts below.</p>

    <q-btn
      icon="add"
      color="primary"
      flat
      @click="showInputFields = !showInputFields"
    />
    
    <div v-if="showInputFields" class="input-fields">
      <q-input v-model="newContact.name" label="Contact Name" :rules="[val => !!val || 'Name is required']" />
      <q-input v-model="newContact.phone" label="Phone Number" :rules="[val => !!val || 'Phone number is required']" />
      <q-select v-model="newContact.relationship" :options="relationshipOptions" label="Relationship" />
      <q-btn label="Add" color="primary" @click="addNewContact" />
      <q-btn label="Delete" color="negative" @click="clearInputFields" />
    </div>

    <div class="contact-cards">
      <div v-for="(contact, index) in contacts" :key="index" class="contact-card">
        <div class="contact-info">
          <p><strong>Name:</strong> {{ contact.name }}</p>
          <p><strong>Phone:</strong> {{ contact.phone }}</p>
          <p><strong>Relationship:</strong> {{ contact.relationship }}</p>
        </div>
        <q-btn icon="delete" color="negative" flat @click="confirmRemoveContact(index)" />
      </div>
    </div>

    <div class="row justify-between q-mt-lg">
      <q-btn label="Back" icon="arrow_back" color="grey" flat @click="$emit('previous-step')" />
      <q-btn label="Submit" color="primary" @click="handleSubmit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps<{
  contacts: Array<{ name: string; phone: string; relationship: string | null }>
}>()

const emit = defineEmits(['update-contacts', 'previous-step', 'submit'])

const contacts = ref(props.contacts.length ? [...props.contacts] : [])
const relationshipOptions = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Relative', 'Other']

const newContact = ref({ name: '', phone: '', relationship: null })
const showInputFields = ref(false)

const addNewContact = () => {
  if (newContact.value.name && newContact.value.phone) {
    contacts.value.push({ ...newContact.value })
    clearInputFields()
  } else {
    alert('Please fill in all required fields.')
  }
}

const clearInputFields = () => {
  newContact.value = { name: '', phone: '', relationship: null }
  showInputFields.value = false
}

const confirmRemoveContact = (index: number) => {
  if (confirm('Are you sure you want to delete this contact?')) {
    contacts.value.splice(index, 1)
  }
}

const handleSubmit = () => {
  const isValid = contacts.value.every(contact => contact.name && contact.phone);
  if (!isValid) {
    alert('Please fill in all required fields before submitting.');
    return;
  }
  emit('update-contacts', contacts.value)
  emit('submit')
}
</script>

<style scoped>
.input-fields {
  margin-top: 16px;
  margin-bottom: 16px;
}

.contact-cards {
  margin-top: 16px;
}

.contact-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 