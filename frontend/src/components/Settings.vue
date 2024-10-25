<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Settings</h2>
    
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">User Profile</h3>
      <form @submit.prevent="updateProfile">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" v-model="profile.name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" v-model="profile.email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Update Profile</button>
      </form>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Notification Preferences</h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input type="checkbox" v-model="notifications.email" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <span class="ml-2">Email Notifications</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" v-model="notifications.sms" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <span class="ml-2">SMS Notifications</span>
        </label>
        <label class="flex items-center">
          <input type="checkbox" v-model="notifications.push" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <span class="ml-2">Push Notifications</span>
        </label>
      </div>
      <button @click="updateNotificationPreferences" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save Preferences</button>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-4">System Settings</h3>
      <div class="mb-4">
        <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
        <select id="language" v-model="systemSettings.language" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="timezone" class="block text-sm font-medium text-gray-700">Timezone</label>
        <select id="timezone" v-model="systemSettings.timezone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Standard Time</option>
          <option value="PST">Pacific Standard Time</option>
          <!-- Add more timezone options as needed -->
        </select>
      </div>
      <button @click="updateSystemSettings" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save Settings</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const profile = ref({
  name: 'John Doe',
  email: 'john@example.com'
});

const notifications = ref({
  email: true,
  sms: false,
  push: true
});

const systemSettings = ref({
  language: 'en',
  timezone: 'UTC'
});

const updateProfile = () => {
  // Here you would typically make an API call to update the user's profile
  console.log('Updating profile:', profile.value);
  toast.success('Profile updated successfully');
};

const updateNotificationPreferences = () => {
  // Here you would typically make an API call to update the notification preferences
  console.log('Updating notification preferences:', notifications.value);
  toast.success('Notification preferences updated successfully');
};

const updateSystemSettings = () => {
  // Here you would typically make an API call to update the system settings
  console.log('Updating system settings:', systemSettings.value);
  toast.success('System settings updated successfully');
};
</script>