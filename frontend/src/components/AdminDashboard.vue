<template>
  <div>
    <h1>Admin Dashboard</h1>
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.email">
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { db } from '../firebase'; // Adjust the import based on your setup
import { collection, getDocs, query, where } from 'firebase/firestore';

export default {
  data() {
    return {
      users: [],
      error: null,
    };
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
