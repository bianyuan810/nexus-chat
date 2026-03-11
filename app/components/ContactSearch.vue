<template>
  <div class="contact-search">
    <div class="search-input-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search contacts by name or email"
        class="search-input"
        @input="handleInput"
      />
      <div v-if="isLoading" class="loading-indicator">
        <span class="loading-spinner"></span>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <div v-if="showResults && searchResults.length > 0" class="search-results">
      <div
        v-for="contact in searchResults"
        :key="contact.id"
        class="contact-item"
      >
        <div class="contact-avatar">
          <img
            v-if="contact.avatar_url"
            :src="contact.avatar_url"
            :alt="contact.name || contact.email"
          />
          <div v-else class="avatar-placeholder">
            {{ getInitials(contact) }}
          </div>
        </div>
        <div class="contact-info">
          <div class="contact-name">{{ contact.name || 'No name' }}</div>
          <div class="contact-email">{{ contact.email }}</div>
        </div>
        <div class="contact-actions">
          <button 
            class="add-contact-button"
            :disabled="isAdding[contact.id]"
            @click="addContact(contact.id)"
          >
            <span v-if="isAdding[contact.id]" class="button-loading">
              <span class="mini-spinner"></span>
            </span>
            <span v-else>Add</span>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showResults && searchResults.length === 0 && searchQuery" class="no-results">
      No contacts found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

const emit = defineEmits<{
  (e: 'select', contact: User): void;
  (e: 'contactAdded', contact: User): void;
}>();

const searchQuery = ref('');
const searchResults = ref<User[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showResults = ref(false);
const debounceTimer = ref<number | null>(null);
const isAdding = ref<Record<string, boolean>>({});

const handleInput = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  
  debounceTimer.value = window.setTimeout(() => {
    if (searchQuery.value.trim()) {
      
      searchContacts();
    } else {
      searchResults.value = [];
      showResults.value = false;
      error.value = null;
      successMessage.value = null;
    }
  }, 300);
};

const searchContacts = async () => {
  if (!searchQuery.value.trim()) return;
  
  isLoading.value = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    const response = await fetch(`/api/contacts/search?query=${encodeURIComponent(searchQuery.value)}`);
    const data = await response.json();
    
    if (data.ok) {
      searchResults.value = data.data;
    } else {
      error.value = data.error?.message || 'Search failed';
      searchResults.value = [];
    }
  } catch (err) {
    console.error('Error searching contacts:', err);
    error.value = 'Failed to connect to server';
    searchResults.value = [];
  } finally {
    isLoading.value = false;
    showResults.value = true;
  }
};

const addContact = async (contactId: string) => {
  isAdding.value[contactId] = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    const response = await fetch('/api/contacts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contact_id: contactId })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      successMessage.value = 'Contact added successfully!';
      const addedContact = searchResults.value.find(c => c.id === contactId);
      if (addedContact) {
        emit('contactAdded', addedContact);
        // Remove the contact from search results after adding
        searchResults.value = searchResults.value.filter(c => c.id !== contactId);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    } else {
      error.value = data.error?.message || 'Failed to add contact';
    }
  } catch (err) {
    console.error('Error adding contact:', err);
    error.value = 'Failed to connect to server';
  } finally {
    isAdding.value[contactId] = false;
  }
};

const getInitials = (contact: User): string => {
  if (contact.name) {
    return contact.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return contact.email[0].toUpperCase();
};

watch(searchQuery, (newValue) => {
  if (!newValue) {
    searchResults.value = [];
    showResults.value = false;
    error.value = null;
    successMessage.value = null;
  }
});
</script>

<style scoped>
.contact-search {
  width: 100%;
  max-width: 400px;
}

.search-input-container {
  position: relative;
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #fef2f2;
  border-radius: 6px;
}

.success-message {
  color: #10b981;
  font-size: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: #f0fdf4;
  border-radius: 6px;
}

.search-results {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background-color 0.2s ease;
}

.contact-item:hover {
  background-color: #f8fafc;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.contact-email {
  font-size: 12px;
  color: #64748b;
}

.contact-actions {
  margin-left: 12px;
}

.add-contact-button {
  padding: 6px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.add-contact-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.add-contact-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}
</style>