<template>
  <div class="calendar-wrapper">
    <Navbar />
    
    <div class="calendar-layout">
      <!-- Appointments Panel -->
      <div class="appointments-container">
        <h2 class="appointments-title">Your Scheduled Appointments</h2>
        <p class="appointments-subtitle">{{ userAppointments.length }} upcoming</p>
        
        <div class="appointments-list">
          <div v-for="(appointment, index) in userAppointments" :key="index" class="appointment-card">
            <div class="appointment-header">
              <span class="service-tag" :class="getServiceTagColor(appointment.service)">{{ appointment.service }}</span>
              <span class="appointment-time">{{ formatTime(appointment.date) }}</span>
            </div>
            <h3 class="appointment-date">{{ formatDate(appointment.date) }}</h3>
            <p class="appointment-duration">Duration: {{ appointment.duration }} min</p>
            <div class="appointment-actions">
              <button class="action-btn reschedule">
                <ClockIcon class="h-3.5 w-3.5" />
                Reschedule
              </button>
              <button class="action-btn cancel">
                <XIcon class="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
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
              'has-appointment': hasAppointments(day.date)
            }"
            @click="selectDate(day.date)"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            <div class="appointment-labels">
              <div 
                v-if="hasAppointments(day.date)" 
                class="appointment-label"
                :style="{ backgroundColor: getAppointmentColor(day.date) }"
              >
                {{ truncateText(getAppointmentLabel(day.date), 8) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, XIcon } from 'lucide-vue-next'
import Navbar from './Navbar.vue'
import FooterComponent from './Footer.vue'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const currentDate = ref(new Date())
const selectedDate = ref(null)

const userAppointments = ref([
  {
    date: new Date(2024, 10, 11, 14, 30),
    service: 'Nail Care',
    duration: 60,
    color: '#8B5CF6'
  },
  {
    date: new Date(2024, 10, 15, 10, 0),
    service: 'Facial Treatment',
    duration: 90,
    color: '#EC4899'
  },
  {
    date: new Date(2024, 10, 22, 15, 45),
    service: 'Massage Therapy',
    duration: 120,
    color: '#14B8A6'
  }
])

// Add new truncate text function
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const getAppointmentColor = (date) => {
  const appointment = userAppointments.value.find(apt => 
    apt.date.toDateString() === date.toDateString()
  )
  return appointment ? appointment.color : '#8B5CF6'
}

// Rest of the script functions remain the same
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

const hasAppointments = (date) => {
  return userAppointments.value.some(apt => apt.date.toDateString() === date.toDateString())
}

const getAppointmentLabel = (date) => {
  const appointment = userAppointments.value.find(apt => 
    apt.date.toDateString() === date.toDateString()
  )
  return appointment ? appointment.service : ''
}

const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const getServiceTagColor = (service) => {
  const colors = {
    'Nail Care': 'purple',
    'Facial Treatment': 'pink',
    'Massage Therapy': 'teal'
  }
  return colors[service] || 'purple'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.calendar-wrapper {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
}

.calendar-layout {
  max-width: 1400px;
  margin: 120px auto 2rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  align-items: start;
  margin-top: 100px;
}

.appointments-container {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(79, 61, 124, 0.12);
  margin-top: 30px;
  margin-left: 20px;
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.appointment-card {
  background: #F8F7FF;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.service-tag {
  padding: 0.35rem 0.75rem;
  border-radius: 0.75rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}

.service-tag.purple { background: #8B5CF6; }
.service-tag.pink { background: #EC4899; }
.service-tag.teal { background: #14B8A6; }

.appointment-time {
  color: #4F3D7C;
  font-weight: 500;
  font-size: 0.875rem;
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

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.reschedule {
  background: #F3F0FF;
  color: #4F3D7C;
}

.action-btn.cancel {
  background: #FEE2E2;
  color: #DC2626;
}

.calendar-container {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(79, 61, 124, 0.12);
  width: 100%;
  max-width: 850px;
  margin-top: 30px;
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
  padding: 0.35rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  transition: all 0.2s ease;
  position: relative;
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
  gap: 0.1rem;
  margin-top: auto;
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
  line-height: 1;
  max-width: 100%;
}

@media (max-width: 1200px) {
  .calendar-layout {
    grid-template-columns: 1fr;
    max-width: 850px;
  }

  .appointments-container {
    order: 2;
  }

  .calendar-container {
    order: 1;
  }
}

@media (max-width: 768px) {
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
}
</style>