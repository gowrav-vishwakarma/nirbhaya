<template>
  <div class="emergency-contacts-step">
    <h5 class="text-h6 q-mb-sm q-px-md q-mt-md q-ma-none">Emergency Contacts</h5>
    <p class="q-px-md q-ma-none q-mb-sm">Add Your emergency contacts below.</p>

    <div class="scrollable-inputs q-px-md">
      <q-btn
        icon="add"
        color="primary"
        class="full-width custom-radius q-mb-md"
        @click="showInputFields = !showInputFields"
        :label="t('common.addEmergencyContact')"
        style="border-radius: 10px !important;"
      />
      
      <div v-if="showInputFields" class="input-fields">
        <div class="custom-input">
          <label>{{ t('common.name') }}</label>
          <q-input
            v-model="newContact.name"
            :rules="[val => !!val || t('common.nameRequired')]"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.mobileNumber') }}</label>
          <q-input
            v-model="newContact.phone"
            :rules="[
              val => !!val || t('common.phoneRequired'),
              val => val.length === 10 || t('common.invalidPhoneNumberLength')
            ]"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            type="tel"
            mask="##########"
            hide-bottom-space
          />
        </div>

        <div class="row q-col-gutter-sm"> 
          <div class="col-6">
            <q-btn
              label="Cancel"
              color="black"
              style="border-radius: 10px !important;"

              class="full-width custom-radius"
              @click="clearInputFields"
            />
          </div>
          <div class="col-6">
            <q-btn
              label="Add"
              color="primary"
              style="border-radius: 10px !important;"
              class="full-width custom-radius"
              @click="addNewContact"
            />
          </div>
        </div>
      </div>
      <q-separator v-if="showInputFields" class="q-mt-md" />

      <div class="contact-cards q-mt-md" v-if="hasEmergencyContacts">
        <q-card v-for="(contact, index) in contacts" :key="index" flat bordered class="contact-card q-mb-sm">
          <q-card-section class="row items-center" style="  width: 100%;" >
            <div class="col-auto">
              <q-avatar>
                <img src='/profile.png' alt='/profile.png' />
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-subtitle2">{{ contact.name }}</div>
              <div class="text-caption">{{ contact.phone }}</div>
            </div>
            <div class="col-auto q-ml-auto">
              <q-btn
                class="remove-btn"
                flat
                label="Remove"
                style="border-radius: 10px !important;"

                @click="confirmRemoveContact(index)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <p v-else class="text-negative q-mt-sm">
        {{ t('common.noEmergencyContacts') }}
      </p>
    </div>

    <div class="q-px-md button-container">
      <div class="row full-width q-col-gutter-sm">
        <div class="col-6">
          <q-btn
            label="Previous"
            color="grey"
            flat
            class="full-width custom-radius"
            @click="$emit('previous-step')"
            style="border-radius: 10px !important;"

          />
        </div>
        <div class="col-6">
          <q-btn
            label="Next"
            color="primary"
            class="full-width custom-radius"
            :loading="isLoading"
            @click="handleSubmit"
            style="border-radius: 10px !important; height: 40px;"

          >
            <template v-slot:loading>
              <q-spinner-dots />
            </template>
            <i class="fa-solid fa-arrow-right-long q-ml-sm"></i>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Contact {
  name: string
  phone: string
  relationship: string | undefined
  avatar?: string
  consentGiven?: boolean
}

const props = defineProps<{
  contacts: Contact[]
}>()

const emit = defineEmits(['update-contacts', 'previous-step', 'submit', 'next-step'])
const $q = useQuasar()
const userStore = useUserStore()

const contacts = ref<Contact[]>(props.contacts.length ? [...props.contacts] : [])
const relationshipOptions = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Relative', 'Other']

const isLoading = ref(false)

interface NewContact {
  name: string
  phone: string
  relationship: string | undefined
  avatar?: string
}

const newContact = ref<NewContact>({ 
  name: '', 
  phone: '', 
  relationship: undefined,
  avatar: ''
})

const showInputFields = ref(false)

const validatePhoneNumber = async (phoneNumber: string): Promise<boolean> => {
  try {
    if (phoneNumber === userStore.user.phoneNumber) {
      $q.notify({
        color: 'negative',
        message: 'You cannot add your own number as emergency contact',
        icon: 'error',
        position:'top-right'
      })
      return false
    }

    const response = await api.post('auth/validate-phone', { phoneNumber })
    if (!response.data.isValid) {
      $q.notify({
        color: 'negative',
        message: 'Phone number is not registered in the system',
        icon: 'error',
        position:'top-right'
      })
      return false
    }
    return true
  } catch (error) {
    console.error('Error validating phone number:', error)
    return false
  }
}

const addNewContact = async () => {
  if (newContact.value.name && newContact.value.phone) {
    const isDuplicate = contacts.value.some(
      contact => contact.phone === newContact.value.phone
    )

    if (isDuplicate) {
      $q.notify({
        color: 'negative',
        message: t('common.phoneNumberAlreadyExists'),
        icon: 'error',
        position:'top-right'

      })
      return
    }

    const isValid = await validatePhoneNumber(newContact.value.phone)
    if (!isValid) {
      return
    }

    try {
      // Add contact to API first
      await api.post('user/emergency-contacts-add', {
        emergencyContacts: [{
          contactName: newContact.value.name,
          contactPhone: newContact.value.phone,
          relationship: newContact.value.relationship,
          isAppUser: true,
          priority: 0,
          consentGiven: false
        }]
      })

      // Add to local contacts
      contacts.value.push({ ...newContact.value })

      // Update store
      userStore.updateUser({
        ...userStore.user,
        emergencyContacts: contacts.value.map(contact => ({
          contactName: contact.name,
          contactPhone: contact.phone,
          relationship: contact.relationship,
          isAppUser: true,
          priority: 0,
          consentGiven: contact.consentGiven || false
        }))
      })

      // Clear input and show success message
      clearInputFields()
      $q.notify({
        color: 'Black',
        message: t('common.emergencyContactAdded'),
        icon: 'check',
        position:'top-right'

      })

      // Reload contacts data
      await loadContactsData()
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      $q.notify({
        color: 'negative',
        message: t('common.errorAddingContact'),
        icon: 'error',
        position:'top-right'

      })
    }
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.fillRequiredFields'),
      icon: 'error',
      position:'top-right'

    })
  }
}

const clearInputFields = () => {
  newContact.value = { name: '', phone: '', relationship: undefined, avatar: '' }
  showInputFields.value = false
}

const confirmRemoveContact = async (index: number) => {
  try {
    if (confirm(t('common.confirmDeleteContact'))) {
      const contactToDelete = contacts.value[index]
      
      // Delete from API
      await api.post('/user/emergency-contact', {
        userId: userStore.user.id,
        contactPhone: contactToDelete.phone
      })

      // Remove from local contacts
      contacts.value.splice(index, 1)
      
      // Update store
      userStore.updateUser({
        ...userStore.user,
        emergencyContacts: contacts.value.map(contact => ({
          contactName: contact.name,
          contactPhone: contact.phone,
          relationship: contact.relationship,
          isAppUser: true,
          priority: 0,
          consentGiven: contact.consentGiven || false
        }))
      })

      $q.notify({
        color: 'black',
        message: t('common.contactDeletedSuccessfully'),
        icon: 'check',
        position:'top-right'

      })

      // Reload contacts data
      await loadContactsData()
    }
  } catch (error) {
    console.error('Error deleting emergency contact:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errorDeletingContact'),
      icon: 'error',

      position:'top-right'

    })
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    const isValid = contacts.value.every(contact => contact.name && contact.phone)
    if (!isValid) {
      $q.notify({
        color: 'negative',
        message: t('common.fillRequiredFields'),
        icon: 'error',
        position:'top-right'

      })
      return
    }

    await api.post('user/emergency-contacts-add', {
      emergencyContacts: contacts.value.map(contact => ({
        contactName: contact.name,
        contactPhone: contact.phone,
        relationship: contact.relationship || undefined,
        isAppUser: true,
        priority: 0,
        consentGiven: contact.consentGiven || false
      }))
    })

    userStore.updateUser({
      ...userStore.user,
      emergencyContacts: contacts.value.map(contact => ({
        contactName: contact.name,
        contactPhone: contact.phone,
        relationship: contact.relationship || undefined,
        isAppUser: true,
        priority: 0,
        consentGiven: contact.consentGiven || false
      }))
    })

    emit('update-contacts', contacts.value)
    emit('submit')

    // $q.notify({
    //   color: 'black',
    //   message: t('common.emergencyContactsUpdated'),
    //   icon: 'check',
    //   position:'top-right'

    // })
    
    // Navigate to volunteer page
    emit('next-step')

  } catch (error) {
    console.error('Error updating emergency contacts:', error)
    $q.notify({
      color: 'negative',
      message: t('common.emergencyContactsUpdateError'),
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const initializeContacts = () => {
  const userEmergencyContacts = userStore.user.emergencyContacts || []
  contacts.value = userEmergencyContacts.map(contact => ({
    name: contact.contactName,
    phone: contact.contactPhone,
    relationship: contact.relationship,
    consentGiven: contact.consentGiven
  }))
}

const loadContactsData = async () => {
  try {
    // Initialize contacts from store
    initializeContacts()
    
    // Fetch latest status
    const response = await api.get('/user/emergency-contacts-status')
    const contactsStatus = response.data
    
    contacts.value = contacts.value.map(contact => {
      const status = contactsStatus.find((c: any) => c.contactPhone === contact.phone)
      return {
        ...contact,
        consentGiven: status ? status.consentGiven : false
      }
    })
  } catch (error) {
    console.error('Error loading contacts data:', error)
  }
}

onMounted(async () => {
  await loadContactsData()
})

const hasEmergencyContacts = computed(() => contacts.value.length > 0)
</script>

<style scoped>
.emergency-contacts-step {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: white;
}

.scrollable-inputs {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.custom-input {
  margin-bottom: 20px;
}

.custom-input label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #666;
}

.button-container {
  background-color: white;
  height: 60px;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar styles */
.scrollable-inputs::-webkit-scrollbar {
  width: 3px;
}

.scrollable-inputs::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-inputs::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.scrollable-inputs::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Custom border radius */
:deep(.custom-radius) .q-field__control {
  border-radius: 10px !important;
  height: 45px;
}

:deep(.custom-radius) .q-field__marginal {
  height: 56px;
  border-radius: 20px;
}

:deep(.custom-radius) .q-field__native,
:deep(.custom-radius) .q-field__input {
  border-radius: 20px;
}

.contact-card {
  border-radius: 10px;
  display: flex;
  align-items: center;
}
    .remove-btn{
      background-color:black;
      align-self: flex-end;
      border-radius: 10px;
      margin-left: 10px;
      color:white;
      font-size: 12px;
      text-transform: capitalize;
    }
</style> 