<template>
    <div class="appointment-scheduler">
      <Navbar />
  
      <div class="container">
        <div class="scheduler-layout">
          <!-- Calendar Section -->
          <div class="calendar-section">
            <h2>Select Date</h2>
            <div class="custom-calendar">
              <div class="calendar-header">
                <button @click="previousMonth" class="calendar-nav-button">&lt;</button>
                <h3>{{ currentMonthYear }}</h3>
                <button @click="nextMonth" class="calendar-nav-button">&gt;</button>
              </div>
              <div class="calendar-weekdays">
                <span v-for="day in weekdays" :key="day">{{ day }}</span>
              </div>
              <div class="calendar-days">
                <button
                  v-for="{ date, isCurrentMonth, isSelected, isDisabled } in calendarDays"
                  :key="date.toISOString()"
                  @click="selectDate(date)"
                  :class="{
                    'current-month': isCurrentMonth,
                    'selected': isSelected,
                    'disabled': isDisabled
                  }"
                  :disabled="isDisabled"
                >
                  {{ date.getDate() }}
                </button>
              </div>
            </div>
          </div>
  
          <!-- Main Content Section -->
          <div class="main-content">
            <div class="mode-selection">
              <button 
                v-for="tab in ['book', 'view', 'update']" 
                :key="tab"
                @click="setMode(tab)"
                :class="['mode-button', { active: mode === tab }]"
                :disabled="tab === 'update' && !selectedAppointment"
              >
                {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
              </button>
            </div>
  
            <!-- View Appointments -->
            <div v-if="mode === 'view'" class="appointments-list">
              <h2>Your Appointments</h2>
              <div v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
                <div class="appointment-content">
                  <div class="service-icon">
                    <component :is="getServiceIcon(appointment.service)" />
                  </div>
                  <div class="appointment-details">
                    <h3>{{ appointment.service }}</h3>
                    <p>{{ formatAppointmentDate(appointment.date) }} at {{ appointment.time }}</p>
                    <p class="price">₱{{ appointment.price.toLocaleString('en-PH') }}</p>
                    <span :class="['status', appointment.status]">
                      {{ appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) }}
                    </span>
                  </div>
                </div>
                <div class="appointment-actions">
                  <button @click="selectAppointment(appointment)" class="update-button">
                    <PencilIcon class="icon" /> Update
                  </button>
                  <button @click="cancelAppointment(appointment.id)" class="cancel-button">
                    <XIcon class="icon" /> Cancel
                  </button>
                </div>
              </div>
            </div>
  
            <!-- Book or Update Appointment -->
            <div v-if="mode === 'book' || mode === 'update'" class="booking-form">
              <!-- Service Selection -->
              <div class="service-selection">
                <h3>Select Services</h3>
                <div class="service-options">
                  <div
                    v-for="service in services"
                    :key="service.id"
                    class="service-option"
                    :class="{ selected: selectedServices[service.id] > 0 }"
                  >
                    <button @click="incrementService(service.id)" class="service-button">
                      <component :is="service.icon" class="service-icon" />
                      <p>{{ service.name }}</p>
                      <span class="service-price">₱{{ service.price.toLocaleString('en-PH') }}</span>
                    </button>
                    <div v-if="selectedServices[service.id] > 0" class="service-count">
                      {{ selectedServices[service.id] }}
                    </div>
                    <button 
                      v-if="selectedServices[service.id] > 0"
                      @click="decrementService(service.id)"
                      class="decrement-button"
                    >
                      <MinusIcon class="icon" />
                    </button>
                  </div>
                </div>
              </div>
  
              <!-- Time Slots -->
              <div class="time-slots">
                <h3>Available Time Slots</h3>
                <div class="time-slot-options">
                  <button
                    v-for="slot in availableTimeSlots"
                    :key="slot"
                    @click="selectTimeSlot(slot)"
                    :class="['time-slot', { 
                      selected: selectedTime === slot, 
                      disabled: disableSlot(slot) 
                    }]"
                    :disabled="disableSlot(slot)"
                  >
                    {{ slot }}
                  </button>
                </div>
              </div>
  
              <!-- Action Button -->
              <button
                v-if="isFormValid"
                @click="showSummaryModal"
                class="action-button"
              >
                <component :is="mode === 'book' ? 'CalendarPlusIcon' : 'RefreshCwIcon'" class="icon" />
                {{ mode === 'book' ? 'Review Appointment' : 'Review Update' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Summary Modal -->
      <div v-if="isSummaryModalVisible" class="modal-overlay" @click="closeSummaryModal">
        <div class="modal" @click.stop>
          <div class="modal-content">
            <h3 class="summary-title">Appointment Summary</h3>
            <div class="summary-content">
              <!-- Add Selected Services Section -->
              <div class="selected-services">
                <h4>Selected Services</h4>
                <div v-if="hasSelectedServices">
                  <div v-for="(count, serviceId) in selectedServices" :key="serviceId" class="service-item">
                    <div class="service-info">
                      <div class="service-name-duration">
                        <span class="service-name">{{ getServiceName(parseInt(serviceId)) }}</span>
                        <span class="service-duration">({{ formatDuration(getServiceDuration(parseInt(serviceId)) * count) }})</span>
                      </div>
                      <span class="service-quantity">x{{ count }}</span>
                    </div>
                    <span class="service-price">₱{{ (getServicePrice(parseInt(serviceId)) * count).toLocaleString('en-PH') }}</span>
                  </div>
                </div>
                <div v-else class="no-services-message">
                  No services selected
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-totals">
                <div class="total-row">
                  <span>Total Duration:</span>
                  <span class="highlight">{{ formatDuration(totalDuration) }}</span>
                </div>
                <div class="total-row">
                  <span>Total Price:</span>
                  <span class="highlight">₱{{ totalPrice.toLocaleString('en-PH') }}</span>
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>{{ formattedDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span>{{ selectedTime }}</span>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="confirmAppointment" class="confirm-button">
                <CheckIcon class="icon" /> Confirm
              </button>
              <button @click="closeSummaryModal" class="cancel-button">
                <XIcon class="icon" /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Confirmation Modal -->
      <div v-if="isConfirmationModalVisible" class="modal-overlay" @click.self="isConfirmationModalVisible = false">
        <div class="modal confirmation-modal">
          <div v-if="confirmationStatus === 'confirming'" class="confirmation-content">
            <div class="spinner"></div>
            <p>Confirming...</p>
          </div>
          <div v-else-if="confirmationStatus === 'confirmed'" class="confirmation-content">
            <div class="check-icon"></div>
            <p>Confirmed Successfully</p>
          </div>
          <div v-else-if="confirmationStatus === 'error'" class="confirmation-content">
            <p>Error occurred. Please try again.</p>
          </div>
        </div>
      </div>
      
      <FooterComponent />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
  import { database } from '../firebase';
  import FooterComponent from './Footer.vue';
  import Navbar from './Navbar.vue';
  import { 
    CalendarPlusIcon, 
    RefreshCwIcon, 
    StethoscopeIcon, 
    DropletIcon, 
    HandIcon, 
    ScissorsIcon, 
    ZapIcon,
    PencilIcon,
    XIcon,
    CheckIcon,
    MinusIcon
  } from 'lucide-vue-next';
  
  const selectedDate = ref(new Date());
  const currentMonth = ref(new Date());
  const selectedServices = ref({});
  const selectedTime = ref('');
  const mode = ref('book');
  const selectedAppointment = ref(null);
  const appointments = ref([]);
  const unavailableTimeSlots = ref([]);
  const availableTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const isSummaryModalVisible = ref(false);
  const isConfirmationModalVisible = ref(false);
  const confirmationStatus = ref('');
  
  const services = [
    { id: 1, name: 'Checkup', duration: 60, price: 80, icon: StethoscopeIcon },
    { id: 2, name: 'Massage', duration: 90, price: 120, icon: DropletIcon },
    { id: 3, name: 'Manicure', duration: 45, price: 40, icon: HandIcon },
    { id: 4, name: 'Pedicure', duration: 60, price: 50, icon: ScissorsIcon },
    { id: 5, name: 'Hair Removal', duration: 30, price: 60, icon: ZapIcon }
  ];
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const currentMonthYear = computed(() => {
    return currentMonth.value.toLocaleString('default', { month: 'long', year: 'numeric' });
  });
  
  const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
  
    const days = [];
  
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: isSameDate(date, selectedDate.value),
        isDisabled: date < new Date()
      });
    }
  
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: isSameDate(date, selectedDate.value),
        isDisabled: date < new Date()
      });
    }
  
    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: isSameDate(date, selectedDate.value),
        isDisabled: date < new Date()
      });
    }
  
    return days;
  });
  
  function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  function previousMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
  }
  
  function nextMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
  }
  
  function selectDate(date) {
    selectedDate.value = date;
    updateUnavailableTimeSlots();
  }
  
  onMounted(() => {
    fetchAppointments();
  });
  
  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(database, 'appointments'));
      appointments.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  
  const selectTimeSlot = (slot) => {
    if (!disableSlot(slot)) {
      selectedTime.value = slot;
    }
  };
  
  const getServiceIcon = (serviceName) => {
    const service = services.find(s => s.name === serviceName);
    return service ? service.icon : StethoscopeIcon;
  };
  
  const updateUnavailableTimeSlots = () => {
    if (!selectedDate.value) return;
  
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    unavailableTimeSlots.value = appointments.value
      .filter(appointment => appointment.date === formattedDate)
      .map(appointment => appointment.time);
  };
  
  const disableSlot = (slot) => {
    return unavailableTimeSlots.value.includes(slot);
  };
  
  watch(selectedDate, updateUnavailableTimeSlots);
  
  const setMode = (newMode) => {
    mode.value = newMode;
    if (newMode === 'view') {
      
      fetchAppointments();
      clearSelection();
    }
  };
  
  const clearSelection = () => {
    selectedServices.value = {};
    selectedTime.value = null;
    selectedAppointment.value = null;
  };
  
  const selectAppointment = (appointment) => {
    selectedAppointment.value = appointment;
    mode.value = 'update';
    selectedServices.value = { [services.find(s => s.name === appointment.service)?.id]: 1 };
    selectedDate.value = new Date(appointment.date);
    selectedTime.value = appointment.time;
  };
  
  const updateAppointment = async () => {
    if (selectedAppointment.value) {
      const appointmentRef = doc(database, 'appointments', selectedAppointment.value.id);
      await updateDoc(appointmentRef, {
        services: Object.entries(selectedServices.value).flatMap(([id, count]) => 
          Array(count).fill(services.find(s => s.id === parseInt(id))?.name)
        ),
        date: selectedDate.value.toISOString().split('T')[0],
        time: selectedTime.value,
        price: totalPrice.value,
        duration: totalDuration.value
      });
      alert('Appointment updated successfully!');
      setMode('view');
    }
  };
  
  const cancelAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(database, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'pending cancellation'
      });
  
      await addDoc(collection(database, 'cancellation_requests'), 
      {
        appointmentId,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
  
      alert('Your cancellation request is pending approval.');
      fetchAppointments();
    } catch (error) {
      console.error('Error processing cancellation request:', error);
      alert('Failed to send cancellation request.');
    }
  };
  
  const showSummaryModal = () => {
    if (isFormValid.value) {
      isSummaryModalVisible.value = true;
    }
  };
  
  const closeSummaryModal = () => {
    isSummaryModalVisible.value = false;
  };
  
  const confirmAppointment = async () => {
    if (isFormValid.value) {
      isConfirmationModalVisible.value = true;
      confirmationStatus.value = 'confirming';
      
      const appointmentData = {
        services: Object.entries(selectedServices.value).flatMap(([id, count]) => 
          Array(count).fill(services.find(s => s.id === parseInt(id))?.name)
        ),
        date: selectedDate.value.toISOString().split('T')[0],
        time: selectedTime.value,
        price: totalPrice.value,
        duration: totalDuration.value,
        status: 'pending'
      };
      
      try {
        // Simulate a delay for the confirmation process
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        if (mode.value === 'book') {
          await addDoc(collection(database, 'appointments'), appointmentData);
        } else if (mode.value === 'update') {
          await updateAppointment();
        }
        
        confirmationStatus.value = 'confirmed';
        setTimeout(() => {
          isConfirmationModalVisible.value = false;
          closeSummaryModal();
          setMode('view');
        }, 2000);
      } catch (error) {
        console.error('Error saving appointment:', error);
        confirmationStatus.value = 'error';
      }
    }
  };
  
  const incrementService = (serviceId) => {
    selectedServices.value = {
      ...selectedServices.value,
      [serviceId]: (selectedServices.value[serviceId] || 0) + 1
    };
  };
  
  const decrementService = (serviceId) => {
    if (selectedServices.value[serviceId] > 0) {
      selectedServices.value = {
        ...selectedServices.value,
        [serviceId]: selectedServices.value[serviceId] - 1
      };
      if (selectedServices.value[serviceId] === 0) {
        const { [serviceId]: _, ...rest } = selectedServices.value;
        selectedServices.value = rest;
      }
    }
  };
  
  const totalPrice = computed(() => {
    return Object.entries(selectedServices.value)
      .reduce((sum, [id, count]) => {
        const service = services.find(s => s.id === parseInt(id));
        return sum + (service?.price || 0) * count;
      }, 0);
  });
  
  const totalDuration = computed(() => {
    return Object.entries(selectedServices.value)
      .reduce((sum, [id, count]) => {
        const service = services.find(s => s.id === parseInt(id));
        return sum + (service?.duration || 0) * count;
      }, 0);
  });
  
  const isFormValid = computed(() => 
    selectedDate.value && 
    selectedTime.value && 
    Object.values(selectedServices.value).some(count => count > 0)
  );
  
  const hasSelectedServices = computed(() => Object.keys(selectedServices.value).length > 0);
  
  const formattedDate = computed(() => 
    selectedDate.value ? selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
  );
  
  const formatAppointmentDate = (date) => 
    new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const getServiceName = (serviceId) => services.find(s => s.id === serviceId)?.name || '';
  const getServicePrice = (serviceId) => services.find(s => s.id === serviceId)?.price || 0;
  const getServiceDuration = (serviceId) => services.find(s => s.id === serviceId)?.duration || 0;
  
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  
  .appointment-scheduler {
    font-family: 'Poppins', sans-serif;
    background-color: #F3F4F6;
    color: #1F2937;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .container {
    max-width: 1300px;
    margin: 8rem auto 2rem;
    padding: 0 1rem;
  }
  
  .scheduler-layout {
    display: flex;
    gap: 2rem;
    background-color: #FFFFFF;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .calendar-section {
    flex: 1.2;
    max-width: 400px;
    border-right: 1px solid #E5E7EB;
    padding-right: 2rem;
  }
  
  .main-content {
    flex: 2;
  }
  
  .mode-selection {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 2.5rem;
    padding: 0.5rem;
    gap: 0.75rem;
    background: rgba(139, 92, 246, 0.05);
    border-radius: 100px;
  }
  
  .mode-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 100px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: transparent;
    color: #6B46C1;
    font-size: 0.95rem;
    letter-spacing: 0.01em;
  }
  
  .mode-button.active {
    background-color: #8B5CF6;
    color: white;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  .mode-button:hover:not(.active) {
    background-color: rgba(139, 92, 246, 0.1);
  }
  
  .mode-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  h2, h3 {
    color: #8B5CF6;
    margin-bottom: 1.5rem;
  }
  
  .appointment-card {
    background-color: #f9fafb;
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .appointment-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  .appointment-content {
    display: flex;
    align-items: center;
  }
  
  .service-icon {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 1rem;
  }
  
  .service-icon svg {
    width: 24px;
    height: 24px;
    color: #8B5CF6;
  }
  
  .appointment-details h3 {
    font-size: 1.2rem;
    color: #1F2937;
    margin: 0 0 0.5rem 0;
  }
  
  .appointment-details p {
    font-size: 0.9rem;
    color: #6B7280;
    margin: 0 0 0.25rem 0;
  }
  
  .price {
    color: #8B5CF6;
    font-weight: 600;
  }
  
  .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .status.pending {
    background-color: #C4B5FD;
    color: #8B5CF6;
  }
  
  .status.approved {
    background-color: #D1FAE5;
    color: #059669;
  }
  
  .status.pending.cancellation {
    background-color: #FEE2E2;
    color: #DC2626;
  }
  
  .appointment-actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .update-button {
    background-color: #8B5CF6;
    color: white;
    margin-right: 0.5rem;
  }
  
  .cancel-button {
    background-color: #EF4444;
    color: white;
  }
  
  .update-button:hover,
  .cancel-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  .booking-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .service-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .service-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 15px;
    transition: all 0.3s ease;
    background-color: #F3F4F6;
  }
  
  .service-button {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
  }
  
  .service-icon {
    margin-bottom: 1rem;
  }
  
  .service-icon svg {
    width: 24px;
    height: 24px;
    color: #8B5CF6;
  }
  
  .service-price {
    position: absolute;
    bottom: 0.5rem;
    font-size: 0.8rem;
    color: #8B5CF6;
    font-weight: 600;
  }
  
  .service-option:hover {
    background-color: #C4B5FD;
  }
  
  .service-option.selected {
    border: 2px solid #8B5CF6;
    background-color: #C4B5FD;
  }
  
  .service-option p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #1F2937;
    text-align: center;
    font-weight: 500;
  }
  
  .service-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #8B5CF6;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .decrement-button {
    position: absolute;
    bottom: -8px;
    right: -8px;
    background-color: #EF4444;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;
  }
  
  .decrement-button:hover {
    background-color: #DC2626;
  }
  
  .time-slot-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 0.75rem;
  }
  
  .time-slot {
    padding: 0.75rem;
    border: none;
    border-radius: 10px;
    background-color: #F3F4F6;
    color: #1F2937;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .time-slot:hover:not(.disabled) {
    background-color: #C4B5FD;
  }
  
  .time-slot.selected {
    background-color: #8B5CF6;
    color: white;
  }
  
  .time-slot.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .action-button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 30px;
    background-color: #8B5CF6;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .action-button:hover {
    background-color: #7C3AED;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
  }
  
  .action-button .icon {
    width: 20px;
    height: 20px;
  }
  
  /* Custom Calendar Styles */
  .custom-calendar {
    width: 100%;
    min-width: 350px;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #8B5CF6;
    color: #C4B5FD;
  }
  
  .calendar-nav-button {
    background: none;
    border: none;
    color: #C4B5FD;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: 600;
    background-color: #F3F4F6;
    border-bottom: 1px solid #E5E7EB;
  }
  
  .calendar-weekdays span {
    padding: 0.5rem;
  }
  
  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  
  .calendar-days button {
    aspect-ratio: 1;
    border: none;
    background: none;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 50%;
    margin: 2px;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .calendar-days button:hover:not(:disabled) {
    background-color: #F3F4F6;
    border: 2px solid #C4B5FD;
  }
  
  .calendar-days button.current-month {
    color: #1F2937;
  }
  
  .calendar-days button:not(.current-month) {
    color: #6B7280;
  }
  
  .calendar-days button.selected {
    background-color: #8B5CF6;
    border: 2px solid #8B5CF6;
    color: white;
  }
  
  .calendar-days button.selected:hover {
    background-color: #7C3AED;
    border-color: #7C3AED;
  }
  
  .calendar-days button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background-color: white;
    border-radius: 15px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .modal-content h3 {
    margin-bottom: 0;
  }
  
  .summary-content {
    background-color: #F9FAFB;
    border-radius: 10px;
    padding: 1rem;
  }
  
  .summary-title {
    color: #8B5CF6;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
  
  .selected-services {
    margin-bottom: 1.5rem;
  }
  
  .selected-services h4 {
    color: #4B5563;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: white;
      border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .service-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .service-name-duration {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .service-name {
    font-weight: 600;
    color: #4B5563;
  }
  
  .service-duration {
    font-size: 0.875rem;
    color: #6B7280;
  }
  
  .service-quantity {
    font-weight: 600;
    color: #8B5CF6;
  }
  
  .service-price {
    font-weight: 600;
    color: #8B5CF6;
  }
  
  .summary-divider {
    height: 1px;
    background-color: #E5E7EB;
    margin: 1.5rem 0;
  }
  
  .summary-totals .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .highlight {
    color: #8B5CF6;
    font-size: 1.125rem;
  }
  
  .appointment-details .detail-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: #6B7280;
  }
  
  .detail-row .label {
    font-weight: 500;
    color: #374151;
  }
  
  /* Update modal action buttons */
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .confirm-button,
  .cancel-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .confirm-button {
    background-color: #10B981;
    color: white;
    border: none;
  }
  
  .confirm-button:hover {
    background-color: #059669;
    transform: translateY(-1px);
  }
  
  .cancel-button {
    background-color: white;
    color: #EF4444;
    border: 2px solid #EF4444;
  }
  
  .cancel-button:hover {
    background-color: #FEE2E2;
    transform: translateY(-1px);
  }
  
  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .no-services-message {
    color: #6B7280;
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }
  
  .confirmation-modal {
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  .confirmation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #8B5CF6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  .check-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #10B981;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .check-icon::before {
    content: '\2714';
    color: white;
    font-size: 24px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 1024px) {
    .scheduler-layout {
      flex-direction: column;
    }
  
    .calendar-section {
      max-width: 100%;
      border-right: none;
      border-bottom: 1px solid #E5E7EB;
      padding-right: 0;
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }
  }
  
  @media (max-width: 768px) {
    .appointment-card {
      flex-direction: column;
      align-items: flex-start;
    }
  
    .appointment-actions {
      margin-top: 1rem;
    }
  }
  </style>