<template>
  <div class="container">
    <!-- Appointment Calendar -->
    <div class="calendar">
      <h3>Appointment Calendar</h3>
      <div class="calendar-wrapper">
        <vue-cal 
          ref="vuecal" 
          :events="approvedAppointments" 
          :disable-views="['years','year', 'week']"
          default-view="['month','day' ]"
          class="vuecal--rounded-theme"
          :on-event-click="onEventClick"
          :cell-click="onCellClick"
        >
          <!-- Custom Header Slot -->
          <template #header="{ view, previousPeriod, nextPeriod }">
            <div class="vuecal__header">
              <button @click="previousPeriod" class="vuecal__arrow vuecal__arrow--prev">
                &larr;
              </button>
              <div class="vuecal__title">{{ view.title }}</div>
              <button @click="nextPeriod" class="vuecal__arrow vuecal__arrow--next">
                &rarr;
              </button>
            </div>
          </template>

          <!-- Custom Weekdays Slot: Display days under the month title -->
          <template #weekdays="{ weekdays }">
            <div class="vuecal__weekdays">
              <div class="vuecal__weekdays-headings">
                <div v-for="(day, index) in weekdays" :key="index" class="vuecal__heading">
                  {{ day }}
                </div>
              </div>
            </div>
          </template>
        
          <!-- Custom Event Slot -->
          <template #event="{ event }">
            <div class="event-content">
              <div class="event-title">Email: {{ event.email }}</div>
              <div class="event-details">
                <div><strong>Treatment:</strong> {{ event.treatment }}</div>
                <div><strong>Time:</strong> {{ event.time }}</div>
              </div>
            </div>
          </template>
        </vue-cal>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <div v-if="selectedAppointment" class="modal-overlay">
      <div class="modal">
        <h4>Appointment Details</h4>
        <p><strong>Email:</strong> {{ selectedAppointment.email }}</p>
        <p><strong>Treatment:</strong> {{ selectedAppointment.treatment }}</p>
        <p><strong>Time:</strong> {{ selectedAppointment.time }}</p>
        <button class="close-button" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedAppointment = ref(null);

const approvedAppointments = computed(() =>
  appointments.value
    .filter(a => a.status === 'approved')
    .map(a => {
      const startDate = a.date.toDate();
      const [hours, minutes] = a.time.split(':').map(Number);
      startDate.setHours(hours, minutes);

      const endDate = new Date(startDate);
      endDate.setHours(hours + 1); // Adds one hour to end time

      return {
        start: startDate,
        end: endDate,
        title: a.userEmail,
        email: a.userEmail,
        treatment: a.service,
        time: a.time,
        class: 'appointment-event',
        hasAppointments: true, // Custom flag
      };
    })
);


const fetchAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(database, 'appointments'));
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        status: data.status || 'pending',
      };
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const onEventClick = (event) => {
  showAppointmentDetails(event);
};
const onCellClick = (cellData) => {
  console.log('Cell clicked:', cellData);
  // You can handle adding new appointments or displaying information here.
};

const showAppointmentDetails = (event) => {
  selectedAppointment.value = event;
};

const closeModal = () => {
  selectedAppointment.value = null;
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.calendar {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.calendar-wrapper {
  height: 800px;
  /* Increased height for larger display */
}

.vuecal {
  font-size: 1.2em;
  /* Increase font size for better readability */
}

.vuecal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5em;
  padding: 10px 0;
}

.vuecal__weekdays-headings {
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 10px 0;
}

.vuecal__heading {
  flex: 1;
  text-align: center;
  font-weight: bold;
}



.event-content {
  background-color: #4caf50;
  color: #060101;
  padding: 5px;
  border-radius: 5px;
  font-size: 0.9em;
}

.vuecal__cell-content {
  background-color: #4caf50;
  color: #060101;
  padding: 5px;
  border-radius: 5px;
  font-size: 0.9em;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.close-button {
  background: #f44336;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-button:hover {
  background: #d32f2f;
}
</style>