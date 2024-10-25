<template>
  <div class="patient-list">
    <h2 class="text-2xl font-bold mb-4">Patient List</h2>
    <ul class="space-y-2">
      <li v-for="patient in patients" :key="patient.id" class="bg-gray-100 p-3 rounded flex justify-between items-center">
        <span>{{ patient.name }} - {{ patient.condition }}</span>
        <div>
          <button @click="editPatient(patient)" class="mr-2 text-blue-500 hover:text-blue-700">Edit</button>
          <button @click="deletePatient(patient.id)" class="text-red-500 hover:text-red-700">Delete</button>
        </div>
      </li>
    </ul>
    <form @submit.prevent="submitPatient" class="mt-4 space-y-2">
      <input v-model="currentPatient.name" placeholder="Patient Name" required class="w-full p-2 border rounded">
      <input v-model="currentPatient.condition" placeholder="Condition" required class="w-full p-2 border rounded">
      <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        {{ isEditing ? 'Update Patient' : 'Add Patient' }}
      </button>
    </form>
    <p v-if="message" :class="['mt-2 text-center', { 'text-green-500': !error, 'text-red-500': error }]">
      {{ message }}
    </p>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default {
  setup() {
    const patients = ref([]);
    const currentPatient = ref({ id: null, name: '', condition: '' });
    const isEditing = ref(false);
    const message = ref('');
    const error = ref(false);
    let unsubscribe;

    const showMessage = (msg, isError = false) => {
      message.value = msg;
      error.value = isError;
      setTimeout(() => {
        message.value = '';
        error.value = false;
      }, 3000);
    };

    const submitPatient = async () => {
      try {
        if (isEditing.value) {
          await updateDoc(doc(db, 'patients', currentPatient.value.id), {
            name: currentPatient.value.name,
            condition: currentPatient.value.condition
          });
          showMessage('Patient updated successfully');
        } else {
          await addDoc(collection(db, 'patients'), {
            name: currentPatient.value.name,
            condition: currentPatient.value.condition
          });
          showMessage('Patient added successfully');
        }
        currentPatient.value = { id: null, name: '', condition: '' };
        isEditing.value = false;
      } catch (error) {
        console.error("Error submitting patient: ", error);
        showMessage('Error submitting patient', true);
      }
    };

    const editPatient = (patient) => {
      currentPatient.value = { ...patient };
      isEditing.value = true;
    };

    const deletePatient = async (id) => {
      if (confirm('Are you sure you want to delete this patient?')) {
        try {
          await deleteDoc(doc(db, 'patients', id));
          showMessage('Patient deleted successfully');
        } catch (error) {
          console.error("Error deleting patient: ", error);
          showMessage('Error deleting patient', true);
        }
      }
    };

    onMounted(() => {
      unsubscribe = onSnapshot(collection(db, 'patients'), (snapshot) => {
        patients.value = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      }, (error) => {
        console.error("Error fetching patients: ", error);
        showMessage('Error fetching patients', true);
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    return {
      patients,
      currentPatient,
      isEditing,
      message,
      error,
      submitPatient,
      editPatient,
      deletePatient
    };
  }
};
</script>

<style scoped>
.patient-list {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
</style>