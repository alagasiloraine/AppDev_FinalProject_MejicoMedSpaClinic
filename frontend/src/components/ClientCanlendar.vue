<template>
  <div class="calendar-wrapper">
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-button">
          <ChevronLeftIcon class="icon" />
        </button>
        <h2>{{ currentMonthYear }}</h2>
        <button @click="nextMonth" class="nav-button">
          <ChevronRightIcon class="icon" />
        </button>
      </div>
      <div class="weekdays">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="['calendar-day', { 'current-month': day.currentMonth, 'other-month': !day.currentMonth, 'today': day.isToday }]"
        >
          <span class="day-number">{{ day.dayOfMonth }}</span>
          <div v-if="day.events.length" class="event-indicator">
            <div class="event-dot"></div>
            <div class="event-count">{{ day.events.length }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

const currentDate = ref(new Date());
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  const today = new Date();

  // Previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      dayOfMonth: date.getDate(),
      currentMonth: false,
      isToday: false,
      events: []
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayOfMonth: i,
      currentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      events: i % 3 === 0 ? [{}] : i % 7 === 0 ? [{}, {}] : [] // Dummy events for demonstration
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayOfMonth: i,
      currentMonth: false,
      isToday: false,
      events: []
    });
  }

  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};
</script>

<style scoped>
.calendar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f7fa;
  padding: 20px;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.calendar-container {
  max-width: 900px;
  width: 100%;
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.calendar-container:hover {
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.calendar-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.nav-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.icon {
  width: 24px;
  height: 24px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8fafc;
  padding: 15px 0;
  text-align: center;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e2e8f0;
  padding: 1px;
}

.calendar-day {
  aspect-ratio: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.calendar-day:hover {
  background-color: #f1f5f9;
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s ease;
}

.calendar-day:hover .day-number {
  transform: translateY(-2px);
}

.other-month {
  color: #94a3b8;
}

.today {
  background-color: #e0f2fe;
  font-weight: bold;
  color: #0ea5e9;
  border: 2px solid #0ea5e9;
}

.today .day-number {
  color: #0ea5e9;
}

.event-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
}

.event-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 3px;
}

.event-count {
  font-size: 0.7rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .calendar-container {
    font-size: 0.9rem;
  }

  .calendar-header h2 {
    font-size: 1.6rem;
  }

  .weekdays span {
    font-size: 0.8rem;
  }

  .day-number {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .calendar-header {
    padding: 20px;
  }

  .calendar-header h2 {
    font-size: 1.4rem;
  }

  .nav-button {
    padding: 8px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  .calendar-day {
    padding: 5px;
  }

  .day-number {
    font-size: 0.9rem;
  }
}
</style>