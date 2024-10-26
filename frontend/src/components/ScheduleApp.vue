<template>
    <div class="appointment-scheduler-wrapper">
        <div class="illustration">
            <div class="illustration-content">
                <img :src="blogImage" alt="mejico" class="illustration-image" />
            </div>
        </div>
        <div class="appointment-scheduler">
            <h1 class="title">{{ modeTitle }}</h1>

            <!-- Mode selection buttons -->
            <div class="mode-selection">
                <button @click="setMode('book')" :class="{ active: mode === 'book' }">Book Appointment</button>
                <button @click="setMode('view')" :class="{ active: mode === 'view' }">View Appointments</button>
                <button @click="setMode('update')" :class="{ active: mode === 'update' }" :disabled="!selectedAppointment">Update Appointment</button>
            </div>

            <div v-if="mode === 'view'" class="appointment-cards">
                <h2>Your Appointments</h2>
                <div v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
                    <div class="card-content">
                        <i :class="getServiceIcon(appointment.service)" class="service-icon"></i>
                        <div class="appointment-details">
                            <p><strong>Service:</strong> {{ appointment.service }}</p>
                            <p><strong>Date:</strong> {{ formatAppointmentDate(appointment.date) }}</p>
                            <p><strong>Time:</strong> {{ appointment.time }}</p>
                            <p><strong>Price:</strong> ₱{{ appointment.price.toLocaleString('en-PH') }}</p>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        <button @click.stop="selectAppointment(appointment)" class="update-button">Update</button>
                        <button @click.stop="cancelAppointment(appointment.id)" class="cancel-button">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Booking/Updating Form -->
            <div class="form-container" v-if="mode === 'book' || mode === 'update'">
                <!-- Service Selection -->
                <div class="service-selection">
                    <h5 style="color: gray;">Select a service.</h5>
                    <div class="service-options">
                        <div
                            v-for="service in services"
                            :key="service.id"
                            @click="selectedService = service.id"
                            :class="['service-option', { selected: selectedService === service.id }]"
                        >
                            <i :class="service.icon" class="service-icon"></i>
                            <p>{{ service.name }}</p>
                        </div>
                    </div>
                </div>

                <!-- Date and Time Selection -->
                <div class="date-time-selection">
                    <div class="form-group">
                        <label for="date">Select Date:</label>
                        <v-date-picker v-model="selectedDate" :min-date="new Date()" :max-date="maxDate" class="date-picker" inline />
                    </div>
                    <div class="form-group time-slots-wrapper">
                        <label>Available Time Slots:</label>
                        <div class="time-slots">
                            <button
                                v-for="slot in availableTimeSlots"
                                :key="slot"
                                @click="selectTimeSlot(slot)"
                                :class="['time-slot', { 'selected': selectedTime === slot }]"
                            >
                                {{ slot }}
                            </button>
                        </div>
                        <div class="summary" v-if="isFormValid">
                            <h2>Appointment Summary</h2>
                            <p><strong>Service:</strong> {{ selectedServiceDetails.name }}</p>
                            <p><strong>Date:</strong> {{ formattedDate }}</p>
                            <p><strong>Time:</strong> {{ selectedTime || 'Please select a time slot' }}</p>
                            <p><strong>Price:</strong> ₱{{ selectedServiceDetails.price.toLocaleString('en-PH') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Book or Update Button -->
                <button v-if="isFormValid" @click="mode === 'book' ? scheduleAppointment() : updateAppointment()" class="button">
                    {{ mode === 'book' ? 'Book Appointment' : 'Update Appointment' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
// Vue and Firebase imports
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { database } from '../firebase';
import VDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import blogImage from '../assets/images/logo.png';

// State variables
const selectedDate = ref(null);
const selectedTime = ref('');
const selectedService = ref('');
const mode = ref('book');
const selectedAppointment = ref(null);
const appointments = ref([]);

// Service data
const services = [
    { id: 1, name: 'Checkup', duration: 60, price: 80, icon: 'fas fa-stethoscope' },
    { id: 2, name: 'Massage', duration: 90, price: 120, icon: 'fas fa-bottle-droplet' },
    { id: 3, name: 'Manicure', duration: 45, price: 40, icon: 'fas fa-hand' },
    { id: 4, name: 'Pedicure', duration: 60, price: 50, icon: 'fas fa-brush' },
    { id: 5, name: 'Hair Removal', duration: 30, price: 60, icon: 'fas fa-user-ninja' }
];

const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 3);
const availableTimeSlots = ['09:00', '10:00', '11:00', '1:00', '2:00', '3:00', '4:00', '5:00'];

// Fetch appointments on mount
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

const getServiceIcon = (serviceName) => {
    const service = services.find(s => s.name === serviceName);
    return service ? service.icon : 'fas fa-concierge-bell';
};

const setMode = (newMode) => {
    mode.value = newMode;
    if (newMode === 'view') {
        fetchAppointments();
        clearSelection();
    }
};

const clearSelection = () => {
    selectedService.value = null;
    selectedDate.value = null;
    selectedTime.value = null;
    selectedAppointment.value = null;
};

const selectAppointment = (appointment) => {
    selectedAppointment.value = appointment;
    mode.value = 'update';
    selectedService.value = services.find(s => s.name === appointment.service)?.id;
    selectedDate.value = new Date(appointment.date);
    selectedTime.value = appointment.time;
};

const updateAppointment = async () => {
    if (selectedAppointment.value) {
        const appointmentRef = doc(database, 'appointments', selectedAppointment.value.id);
        await updateDoc(appointmentRef, {
            service: selectedServiceDetails.value.name,
            date: selectedDate.value.toISOString().split('T')[0],
            time: selectedTime.value,
        });
        alert('Appointment updated successfully!');
        setMode('view');
    }
};

const cancelAppointment = async (appointmentId) => {
    await addDoc(collection(database, 'cancellation_requests'), {
        appointmentId,
        status: 'pending',
        requestedAt: new Date().toISOString()
    });
    alert('Cancellation request sent for approval!');
    fetchAppointments();
};

const scheduleAppointment = async () => {
    if (isFormValid.value) {
        await addDoc(collection(database, 'appointments'), {
            service: selectedServiceDetails.value.name,
            date: selectedDate.value.toISOString().split('T')[0],
            time: selectedTime.value,
            price: selectedServiceDetails.value.price
        });
        alert('Appointment scheduled successfully!');
        setMode('view');
    }
};

// Computed properties
const isFormValid = computed(() => selectedDate.value && selectedTime.value && selectedService.value);
const selectedServiceDetails = computed(() => services.find(service => service.id === selectedService.value) || {});
const formattedDate = computed(() => selectedDate.value ? new Date(selectedDate.value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '');
const modeTitle = computed(() => (mode.value === 'book' ? 'Book an Appointment' : mode.value === 'view' ? 'View Appointments' : 'Update Appointment'));

const formatAppointmentDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const selectTimeSlot = (slot) => selectedTime.value = slot;
</script>

<style scoped>
* {
    font-family: 'Poppins', sans-serif;
}

.mode-selection {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.mode-selection button.active {
    background-color: #4b0082;
    color: white;
}

.appointment-scheduler-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    max-width: 100%;
    height: 100%;
    margin: 0 auto;
    background-color: #f8f8f8;
}

.illustration-content {
    text-align: center;
}

.illustration h1 {
    color: #1a1a1a;
    font-size: 32px;
    margin-bottom: 30px;
}

.illustration {
    position: fixed; /* Fix the illustration in place */
    top: 0; /* Align it to the top of the viewport */
    left: 0; /* Align it to the left */
    width: 40%; /* Width of the illustration */
    height: 100vh; /* Full height of the viewport */
    overflow: hidden; /* Prevent overflow */
    background-color: #f9f9f9; /* Background color */
    z-index: 1; /* Ensure it's above other content */
}
.illustration-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

    .appointment-scheduler {
        margin-left: 40%; /* Give space for the fixed illustration */
        width: 60%; /* Remaining width for the scheduler */
        padding: 40px;
        background-color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        overflow-y: auto; /* Enable scrolling within this container */
        height: 100vh; /* Full height of the viewport */
        position: relative; /* Ensure relative positioning for z-index context */
        z-index: 0; /* Set below the illustration */
    }
.title {
    text-align: left;
    color: #4b0082;
    margin-bottom: 2px;
    font-size: 25px;
}

.appointment-cards {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

    .appointment-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;
    }

    .appointment-card:hover {
        transform: translateY(-3px);
    }

    .card-content {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .service-icon {
        font-size: 35px;
        color: #4b0082;
        background-color: #e6e6fa;
        padding: 15px;
        border-radius: 50%;
    }

    .appointment-details {
        display: flex;
        flex-direction: column;
    }

    .appointment-actions {
        display: flex;
        gap: 10px;
    }

    .update-button, .cancel-button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
    }

    .update-button {
        background-color: #4b0082;
    }

    .cancel-button {
        background-color: red;
    }

    .update-button:hover, .cancel-button:hover {
        opacity: 0.8;
    }

        
    .title {
        text-align: left;
        color: #4b0082;
        margin-bottom: 2px;
        font-size: 25px;
    }

    .form-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .service-selection {
        margin-bottom: 20px;
    }

    .service-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 20px;
        justify-items: center;
    }

    .service-option {
        text-align: center;
        cursor: pointer;
        transition: transform 0.3s;
    }

    .service-option.selected {
        transform: scale(1.1);
        border-color: #4b0082;
    }

    .service-icon {
        font-size: 35px;
        margin-bottom: 10px;
        color: #4b0082;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #e6e6fa;
        transition: background-color 0.3s;
    }

    .service-icon:hover {
        background-color: #d8bfd8;
    }

    .date-time-selection {
    display: flex;
    justify-content: space-between; /* Ensure the calendar and time slots are side by side */
    position: relative; /* Ensure it stays in the stacking context */
    z-index: 2; /* Bring it above other elements if necessary */
}

    .vdp-datepicker__calendar {
        position: relative; /* Ensure it's positioned in the flow */
        z-index: 3; /* Bring calendar above other elements */
    }
        .time-slots-wrapper {
        flex: 1;
        margin-left: 20px;
    }

    .time-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 10px;
    }

    .time-slot {
        padding: 8px;
        background-color: #e6e6fa;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .time-slot:hover {
        background-color: #d8bfd8;
    }

    .time-slot.selected {
        background-color: rgb(39, 29, 108);
        color: white;
    }

    .summary {
        margin-top: 20px; 
    }

    .button {
        width: 100%;
        padding: 14px;
        background-color: rgb(39, 29, 108);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .button:hover {
        background-color: #4b0082;
    }

    .button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .date-picker {
        width: 100%;
        max-width: 350px;
        height: auto;
    }

</style>
