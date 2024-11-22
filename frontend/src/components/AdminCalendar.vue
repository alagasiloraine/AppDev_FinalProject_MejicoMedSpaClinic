<template>
  <div class="admincalendar-wrapper">
    <div class="admincalendar-container">
      <h2 class="admincalendar-title">Appointment Calendar</h2>
      
      <div class="admincalendar-header">
        <button class="admincalendar-nav-button" @click="previousMonth">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="admincalendar-month-year">
          <h2 class="admincalendar-month">{{ currentMonthName }}</h2>
          <span class="admincalendar-year">{{ currentYear }}</span>
        </div>
        <button class="admincalendar-nav-button" @click="nextMonth">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="admincalendar-weekdays-header">
        <span v-for="day in weekDays" :key="day" class="admincalendar-weekday">{{ day }}</span>
      </div>

      <div class="admincalendar-grid custom-scrollbar">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="admincalendar-day"
          :class="{
            'admincalendar-current-month': day.currentMonth,
            'admincalendar-other-month': !day.currentMonth,
            'admincalendar-selected': isSelected(day.date),
            'admincalendar-today': isToday(day.date)
          }"
          @click="selectDate(day.date)"
        >
          <div class="admincalendar-day-header">
            <span class="admincalendar-day-number">{{ day.dayNumber }}</span>
            <span v-if="getAppointmentsForDate(day.date).length > 0" class="admincalendar-appointment-count">
              x{{ getAppointmentsForDate(day.date).length }}
            </span>
          </div>
          <div class="admincalendar-appointment-services custom-scrollbar">
            <div 
              v-for="appointment in getAppointmentsForDate(day.date)"
              :key="appointment.id"
              class="admincalendar-service-item"
            >
              <div 
                class="service-container"
                :class="appointment.status"
              >
                <span class="service-text">{{ appointment.services?.[0] || 'No service' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <Teleport to="body">
      <div v-if="selectedDate" class="admincalendar-modal-overlay" @click="closeModal">
        <div class="admincalendar-modal" @click.stop>
          <div class="admincalendar-modal-content">
            <h3 class="admincalendar-modal-title">Appointments for {{ formatDate(selectedDate) }}</h3>
            
            <!-- No appointments message -->
            <div v-if="selectedDateAppointments.length === 0" class="no-appointments">
              No appointments for this date.
            </div>

            <!-- Appointments list -->
            <div v-else class="appointments-list custom-scrollbar">
              <div 
                v-for="appointment in selectedDateAppointments" 
                :key="appointment.id"
                class="appointment-item"
              >
                <div class="appointment-header">
                  <div class="appointment-time">{{ formatTime(appointment.time) }}</div>
                  <div :class="['appointment-status', appointment.status]">
                    {{ appointment.status }}
                  </div>
                </div>

                <div class="appointment-details">
                  <div class="detail-row">
                    <span class="detail-label">Services:</span>
                    <div class="services-list">
                      <span 
                        v-for="(service, index) in (appointment.services || [])" 
                        :key="index"
                        class="service-tag"
                      >
                        {{ service }}
                      </span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ appointment.userEmail }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value">₱{{ appointment.price }}</span>
                  </div>
                </div>
              </div>
            </div>

            <button class="admincalendar-close-button" @click="closeModal">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const currentDate = ref(new Date());
const selectedDate = ref(null);
const appointments = ref([]);

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate.value);
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const selectedDateAppointments = computed(() => {
  if (!selectedDate.value) return [];
  return getAppointmentsForDate(selectedDate.value);
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Adjust to start week on Monday
  
  const days = [];
  
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      dayNumber: prevMonthDays - i,
      currentMonth: false
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      dayNumber: i,
      currentMonth: true
    });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      dayNumber: i,
      currentMonth: false
    });
  }
  
  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const isSelected = (date) => {
  return selectedDate.value && date.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date) => {
  return date.toDateString() === new Date().toDateString();
};

const getAppointmentsForDate = (date) => {
  return appointments.value.filter(apt => {
    const aptDate = apt.date.toDate().toDateString();
    const compareDate = date.toDateString();
    return aptDate === compareDate;
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date instanceof Date ? date : date.toDate());
};

const fetchAppointments = async () => {
  try {
    const querySnapshot = await getDocs(collection(database, 'appointments'));
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        status: data.status || 'pending',
        services: Array.isArray(data.services) ? data.services : [],
      };
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

const closeModal = () => {
  selectedDate.value = null;
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.admincalendar-wrapper {
  font-family: 'Poppins', sans-serif;
  height: 650px;
  background-color: #f8fafc;
  overflow: hidden;
}

.admincalendar-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.admincalendar-title {
  font-size: 24px;
  font-weight: 600;
  color: #4F3D7C;
  margin-bottom: 20px;
}

.admincalendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admincalendar-month-year {
  text-align: center;
}

.admincalendar-month {
  font-size: 28px;
  font-weight: 700;
  color: #4F3D7C;
  margin: 0;
}

.admincalendar-year {
  font-size: 16px;
  color: #6B7280;
}

.admincalendar-nav-button {
  background: #F3F0FF;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F3D7C;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.admincalendar-nav-button:hover {
  background: #E9E3FF;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.admincalendar-weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.admincalendar-weekday {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
}

.admincalendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.admincalendar-day {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

.admincalendar-day:hover {
  background: #F9FAFB;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admincalendar-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.admincalendar-day-number {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.admincalendar-appointment-count {
  background-color: #8b5cf6;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 600;
}

.admincalendar-other-month {
  opacity: 0.5;
}

.admincalendar-selected {
  background: #F3F0FF;
  border-color: #4F3D7C;
}

.admincalendar-today {
  background: #E9E3FF;
  font-weight: bold;
}

.admincalendar-appointment-services {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: calc(100% - 32px);
  overflow-y: auto;
  padding-right: 4px;
}

.admincalendar-service-item {
  margin: 2px 0;
}

.service-container {
  border-radius: 4px;
  padding: 4px 8px;
  width: 100%;
}

.service-text {
  font-size: 12px;
  color: #374151;
  line-height: 1.2;
}

.service-container.pending {
  background-color: #FEF3C7;
  border-left: 3px solid #F59E0B;
}

.service-container.approved {
  background-color: #D1FAE5;
  border-left: 3px solid #10B981;
}

.service-container.cancelled {
  background-color: #FEE2E2;
  border-left: 3px solid #EF4444;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #8b5cf6;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #3D2E63;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #8b5cf6 #F3F4F6;
}

.admincalendar-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.admincalendar-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh; /* Increased from 80vh */
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.admincalendar-modal-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 16px; /* Added margin to prevent overlap */
}

.admincalendar-modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #4F3D7C;
  margin-bottom: 16px;
}

.appointments-list {
  max-height: calc(70vh - 120px); /* Adjusted to account for header and button */
  overflow-y: auto;
  padding-right: 16px;
  margin-bottom: 16px;
}

.appointment-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.appointment-item:last-child {
  margin-bottom: 4px;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.appointment-time {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.appointment-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.appointment-status.pending {
  background-color: #FEF3C7;
  color: #D97706;
}

.appointment-status.approved {
  background-color: #D1FAE5;
  color: #059669;
}

.appointment-status.cancelled {
  background-color: #FEE2E2;
  color: #DC2626;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #374151;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.service-tag {
  background: #E9E3FF;
  color: #4F3D7C;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.no-appointments {
  text-align: center;
  color: #6B7280;
  padding: 32px 0;
  font-size: 16px;
}

.admincalendar-close-button {
  background: #4F3D7C;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;
  margin-top: 16px;
}

.admincalendar-close-button:hover {
  background: #3D2E63;
}

@media (max-width: 640px) {
  .admincalendar-container {
    padding: 16px;
  }

  .admincalendar-day {
    min-height: 100px;
    padding: 6px;
  }

  .service-text {
    font-size: 10px;
  }

  .service-container {
    padding: 3px 6px;
  }

  .appointment-item {
    padding: 12px;
  }

  .appointment-time {
    font-size: 14px;
  }

  .service-tag {
    font-size: 11px;
    padding: 3px 8px;
  }

  .admincalendar-modal {
    padding: 16px;
  }

  .admincalendar-modal-title {
    font-size: 18px;
  }
}
</style>