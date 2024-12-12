<template>
  <div class="calendar-wrapper">
    <Navbar />
    
    <div class="calendar-layout">
      <!-- Appointments Panel -->
      <div class="appointments-container">
        <h2 class="appointments-title">Your Scheduled Appointments</h2>
        <p class="appointments-subtitle">
          <span v-if="loading">Loading appointments...</span>
          <span v-else>{{ upcomingAppointments.length }} upcoming</span>
        </p>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <AlertCircleIcon class="h-5 w-5" />
          {{ error }}
        </div>
        
        <div v-else class="appointments-list">
          <div v-for="appointment in upcomingAppointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <span class="service-tag" :style="{ backgroundColor: appointment.color }">{{ appointment.service }}</span>
              <span class="appointment-time">{{ formatTime(appointment.time) }}</span>
            </div>
            <h3 class="appointment-date">{{ formatDate(appointment.date) }}</h3>
            <p class="appointment-duration">Duration: {{ appointment.duration }} min</p>
            <div class="appointment-actions">
              <div class="status-badge approved">
                <CheckCircleIcon class="h-3.5 w-3.5" />
                Approved
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="!loading && upcomingAppointments.length === 0" class="empty-state">
            <CalendarIcon class="h-12 w-12" />
            <p>No upcoming appointments</p>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="nav-button" @click="previousMonth">
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <div class="month-year">
            <h2 class="month">{{ currentMonthName }}</h2>
            <span class="year">{{ currentYear }}</span>
          </div>
          <button class="nav-button" @click="nextMonth">
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>

        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'current-month': day.currentMonth,
              'other-month': !day.currentMonth,
              'selected': isSelected(day.date),
              'today': isToday(day.date),
              'has-appointment': hasAppointments(day.date),
              'past-appointment': isPastAppointment(day.date)
            }"
            @click="openAppointmentsModal(day.date)"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            <div class="appointment-labels">
              <div 
                v-for="appointment in getAppointmentsForDay(day.date)"
                :key="appointment.id"
                class="appointment-label"
                :style="{ backgroundColor: appointment.color }"
              >
                {{ truncateText(appointment.service, 8) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />

    <!-- Appointment Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Appointments for {{ formattedModalDate }}</h2>
          <button class="close-button" @click="closeModal">
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-appointments-list">
          <div v-for="appointment in selectedDayAppointments" :key="appointment.id" 
               class="modal-appointment-item">
            <div class="appointment-time-column">
              <span class="time">{{ formatTime(appointment.time) }}</span>
              <span class="duration">{{ appointment.duration }} min</span>
            </div>
            <div class="appointment-details">
              <div class="service-tag-wrapper">
                <span class="service-tag" :style="{ backgroundColor: appointment.color }">
                  {{ appointment.service }}
                </span>
              </div>
              <div class="appointment-status">
                <div class="status-indicator"></div>
                <span>Confirmed</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="selectedDayAppointments.length === 0" class="no-appointments">
          <CalendarIcon class="h-16 w-16" />
          <p>No appointments scheduled for this day</p>
          <span>The schedule is clear!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckCircleIcon,
  AlertCircleIcon,
  CalendarIcon,
  XIcon
} from 'lucide-vue-next'
import Navbar from './Navbar.vue'
import FooterComponent from './Footer.vue'
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore'
import { database } from '../firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const currentDate = ref(new Date())
const selectedDate = ref(null)
const userAppointments = ref([])
const loading = ref(true)
const error = ref(null)

const isModalOpen = ref(false);
const selectedModalDate = ref(null);
const selectedDayAppointments = ref([]);

const fetchAppointments = async (userId) => {
  try {
    const appointmentsRef = collection(database, 'appointments')
    const q = query(
      appointmentsRef,
      where('userId', '==', userId)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      loading.value = false
      userAppointments.value = snapshot.docs
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            date: data.date,
            time: data.time,
            service: Array.isArray(data.services) ? data.services[0] : 'Appointment',
            duration: data.duration || 60,
            color: getServiceTagColor(Array.isArray(data.services) ? data.services[0] : 'Appointment')
          }
        })
        .sort((a, b) => a.date.localeCompare(b.date))
    }, (err) => {
      console.error('Error fetching appointments:', err)
      if (err.code === 'permission-denied') {
        error.value = 'You do not have permission to view these appointments.'
      } else if (err.code === 'failed-precondition') {
        error.value = 'Please try again in a moment while we set up the database.'
      } else {
        error.value = 'Unable to load appointments. Please try again later.'
      }
      loading.value = false
    })

    onUnmounted(() => {
      unsubscribe()
    })
  } catch (err) {
    console.error('Error setting up appointments listener:', err)
    error.value = 'Unable to load appointments. Please try again later.'
    loading.value = false
  }
}

onMounted(() => {
  const auth = getAuth()
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchAppointments(user.uid)
    } else {
      error.value = 'Please sign in to view your appointments'
      loading.value = false
      userAppointments.value = []
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

const upcomingAppointments = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return userAppointments.value.filter(apt => {
    const aptDate = new Date(apt.date)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate >= today
  })
})

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
}

const getAppointmentColor = (date) => {
  const dateStr = formatDateForComparison(date)
  const appointment = userAppointments.value.find(apt => {
    const aptDate = new Date(apt.date)
    const formattedAptDate = formatDateForComparison(aptDate)
    return formattedAptDate === dateStr
  })
  return appointment ? appointment.color : '#8B5CF6'
}

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate.value)
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayIndex = firstDayOfMonth.getDay()
  
  const days = []
  
  const prevMonth = new Date(year, month, 0)
  const prevMonthDays = prevMonth.getDate()
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      dayNumber: prevMonthDays - i,
      currentMonth: false
    })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      dayNumber: i,
      currentMonth: true
    })
  }
  
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      dayNumber: i,
      currentMonth: false
    })
  }
  
  return days
})

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const selectDate = (date) => {
  selectedDate.value = date
}

const isSelected = (date) => {
  if (!selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
}

const isToday = (date) => {
  return date.toDateString() === new Date().toDateString()
}

const formatDateForComparison = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d.toISOString().split('T')[0]
}

const hasAppointments = (date) => {
  const dateStr = formatDateForComparison(date)
  return userAppointments.value.some(apt => {
    const aptDate = new Date(apt.date)
    const formattedAptDate = formatDateForComparison(aptDate)
    return formattedAptDate === dateStr
  })
}

const getAppointmentsForDay = (date) => {
  const dateStr = formatDateForComparison(date)
  return userAppointments.value.filter(apt => {
    const aptDate = new Date(apt.date)
    const formattedAptDate = formatDateForComparison(aptDate)
    return formattedAptDate === dateStr
  })
}

const isPastAppointment = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return hasAppointments(date) && checkDate < today
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (error) {
    console.error('Error formatting time:', error)
    return timeStr
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateStr
  }
}

const getServiceTagColor = (service) => {
  const colors = [
    '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B',
    '#14B8A6', '#EF4444', '#6366F1', '#D946EF', '#0EA5E9',
    '#84CC16', '#F97316'
  ];

  const stringToNumber = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const index = stringToNumber(service) % colors.length;
  return colors[index];
};

const openAppointmentsModal = (date) => {
  selectedModalDate.value = date;
  selectedDayAppointments.value = getAppointmentsForDay(date);
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const formattedModalDate = computed(() => {
  if (!selectedModalDate.value) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(selectedModalDate.value);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.calendar-wrapper {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
}

.calendar-layout {
  max-width: 1600px;
  margin: 2rem auto;
  padding: 0 4rem;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 3rem;
  align-items: start;
}

.appointments-container {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(79, 61, 124, 0.12);
  margin-top: 30px;
  margin-left: 20px;
  height: 965px;
  display: flex;
  flex-direction: column;
  margin-top: 100px;
}

.appointments-title {
  color: #4F3D7C;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.appointments-subtitle {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.appointments-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 61, 124, 0.3) transparent;
  padding-right: 0.5rem;
}

.appointments-list::-webkit-scrollbar {
  width: 6px;
}

.appointments-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.appointments-list::-webkit-scrollbar-thumb {
  background-color: rgba(79, 61, 124, 0.3);
  border-radius: 3px;
}

.appointments-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(79, 61, 124, 0.5);
}

.appointment-card {
  background: #F8F7FF;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
  margin-bottom: 0.75rem;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.service-tag {
  padding: 0.35rem 0.75rem;
  border-radius: 0.75rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  max-width: 70%;
  word-break: break-word;
  line-height: 1.2;
}

.appointment-time {
  color: #4F3D7C;
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
}

.appointment-date {
  color: #1F2937;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.appointment-duration {
  color: #6B7280;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background: #ECFDF5;
  color: #059669;
}

.calendar-container {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(79, 61, 124, 0.12);
  width: 100%;
  max-width: 1000px;
  margin: 100px auto 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.month-year {
  text-align: center;
}

.month {
  color: #4F3D7C;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.year {
  color: #6B7280;
  font-size: 1rem;
}

.nav-button {
  background: #F3F0FF;
  border: none;
  border-radius: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F3D7C;
  cursor: pointer;
  transition: all 0.2s ease;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.75rem;
}

.weekday {
  color: #6B7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.35rem;
}

.calendar-day {
  aspect-ratio: 1;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
  padding: 0.5rem 0.35rem; /* Updated padding */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
}

.other-month {
  color: #D1D5DB;
  background: #FAFAFA;
}

.other-month .day-number {
  color: #D1D5DB;
}

.selected {
  background: #4F3D7C;
  color: white;
  border-color: #4F3D7C;
}

.selected .day-number {
  color: white;
}

.today {
  border: 2px solid #4F3D7C;
  font-weight: 600;
}

.appointment-labels {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: auto;
  max-height: calc(100% - 1.5rem);
  overflow-y: auto;
  padding: 0; /* Updated padding */
}

.appointment-label {
  font-size: 0.6rem;
  padding: 0.15rem 0.25rem;
  border-radius: 0.25rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  margin: 0;
  display: block;
  word-break: break-word;
  min-height: 1.5em;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6B7280;
  text-align: center;
}

.empty-state svg {
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.calendar-day.past-appointment {
  opacity: 0.5;
  background-color: #f3f4f6;
  pointer-events: none;
}

.calendar-day.past-appointment .appointment-label {
  background-color: #9ca3af !important;
}

.calendar-day:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background-color: white;
  border-radius: 1.5rem;
  width: 90%;
  max-width: 550px;
  max-height: 85vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  background: linear-gradient(135deg, #4F3D7C 0%, #6366F1 100%);
  padding: 2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  padding-right: 3rem;
  margin: 0;
  line-height: 1.2;
}

.close-button {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.75rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-appointments-list {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(85vh - 6rem);
}

.modal-appointment-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1rem;
  background-color: #F8F7FF;
  border-radius: 1rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
}

.appointment-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1.5rem;
  background-color: #F8F7FF;
  border-radius: 1rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
}

.appointment-time-column {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4F3D7C;
  letter-spacing: -0.02em;
}

.duration {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.appointment-details {
  margin-left: auto;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.service-tag-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.service-tag {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.appointment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #059669;
  position: relative;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background-color: #059669;
  opacity: 0.2;
  animation: pulse 2s infinite;
}

.no-appointments {
  padding: 3rem 2rem;
  text-align: center;
  color: #6B7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.no-appointments svg {
  color: #E5E7EB;
  margin-bottom: 1rem;
}

.no-appointments p {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4F3D7C;
  margin-bottom: 0.5rem;
}

.no-appointments span {
  font-size: 0.875rem;
  color: #6B7280;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-appointments-list {
    padding: 1.25rem;
  }

  .modal-appointment-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .appointment-time-column {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

@media (max-width: 1400px) {
  .calendar-layout {
    grid-template-columns: 1fr;
    max-width: 1000px;
    padding: 0 2rem;
  }
}

@media(max-width: 768px) {
  .calendar-layout {
    padding: 0 1rem;
    margin-top: 100px;
  }

  .calendar-container,
  .appointments-container {
    padding: 1rem;
  }

  .month {
    font-size: 1.25rem;
  }

  .calendar-day {
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .calendar-layout {
    margin-top: 80px;
  }

  .calendar-container,
  .appointments-container {
    padding: 0.75rem;
  }

  .month {
    font-size: 1.125rem;
  }

  .weekday {
    font-size: 0.7rem;
  }

  .calendar-day {
    padding: 0.2rem;
  }

  .day-number {
    font-size: 0.7rem;
  }

  .appointment-label {
    font-size: 0.55rem;
    padding: 0.1rem 0.2rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .appointment-time {
    font-size: 1rem;
    width: 80px;
  }

  .appointment-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>

