
<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Users Management</h2>

    <!-- User Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div v-for="stat in userStats" :key="stat.label" class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">{{ stat.label }}</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stat.value }}</p>
      </div>
    </div>

    <!-- User List -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">User List</h3>
      </div>
      <table class="w-full">
        <thead>
          <tr class="text-left text-gray-500">
            <th class="pb-2">Name</th>
            <th class="pb-2">Email</th>
            <th class="pb-2">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="py-2">{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default {
  data() {
    return {
      users: [],
      error: null,
    };
  },
  computed: {
    userStats() {
      // Compute stats from the users data
      const totalUsers = this.users.length;
      const rolesCount = this.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      return [
        { label: 'Total Users', value: totalUsers },
        { label: 'Roles', value: Object.entries(rolesCount).map(([role, count]) => `${role}: ${count}`).join(', ') },
      ];
    },
  },
  methods: {
    async fetchUsers() {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('role', '!=', 'admin'));
        const snapshot = await getDocs(q);
        this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        this.error = 'Error loading users: ' + error.message;
        console.error(this.error);
      }
    },
  },
  created() {
    this.fetchUsers();
  },
};
</script>