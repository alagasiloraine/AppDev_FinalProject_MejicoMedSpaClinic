<template>
    <div class="appointment-scheduler-wrapper">
        <div class="illustration">
            <div class="illustration-content">
                <img :src="blogImage" alt="mejico" class="illustration-image" />
            </div>
        </div>
        <div class="appointment-scheduler">
            <h1 class="title">Book an Appointment</h1>
            <div class="form-container">
                <div class="service-selection">
                    <h5 style="color: gray;">We value your time. Select the service that you want to avail.</h5>

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

                <div class="date-time-selection">
                    <!-- Date picker on the left side -->
                    <div class="form-group">
                        <label for="date">Select Date:</label>
                        <v-date-picker v-model="selectedDate" :min-date="new Date()" :max-date="maxDate" class="date-picker" inline />
                    </div>

                    <!-- Time slots and summary on the right side -->
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

                        <!-- Appointment summary below the time slots -->
                        <div class="summary" v-if="isFormValid">
                            <h2>Appointment Summary</h2>
                            <p><strong>Service:</strong> {{ selectedServiceDetails.name }}</p>
                            <p><strong>Date:</strong> {{ formattedDate }}</p>
                            <p><strong>Time:</strong> {{ selectedTime ? selectedTime : 'Please select a time slot' }}</p>
                            <p><strong>Price:</strong> ${{ selectedServiceDetails.price }}</p>
                        </div>
                    </div>
                </div>

                <button v-if="isFormValid" @click="scheduleAppointment" class="button">
                    Book Appointment
                </button>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import blogImage from '../assets/images/logo.png';  // Adjust the path based on your structure

const selectedDate = ref(null);
const selectedTime = ref('');
const selectedService = ref('');

const services = [
    { id: 1, name: 'Checkup', duration: 60, price: 80, icon: 'fas fa-stethoscope' },
    { id: 2, name: 'Massage', duration: 90, price: 120, icon: 'fas fa-bottle-droplet' },
    { id: 3, name: 'Manicure', duration: 45, price: 40, icon: 'fas fa-hand' },
    { id: 4, name: 'Pedicure', duration: 60, price: 50, icon: 'fas fa-brush' },
    { id: 5, name: 'Hair Removal', duration: 30, price: 60, icon: 'fas fa-user-ninja' }
];

const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 3);

const availableTimeSlots = [
    '09:00', '10:00', '11:00', '12:00','13:00', '14:00', '15:00', '16:00'
];

const isFormValid = computed(() => {
    return selectedDate.value && selectedTime.value && selectedService.value;
});

const selectedServiceDetails = computed(() => {
    return services.find(service => service.id === selectedService.value) || {};
});

const formattedDate = computed(() => {
    if (!selectedDate.value) return '';
    return new Date(selectedDate.value).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const selectTimeSlot = (slot) => {
    selectedTime.value = slot;
};

const scheduleAppointment = async () => {
    if (isFormValid.value) {
        const appointmentData = {
            service: selectedServiceDetails.value.name,
            date: selectedDate.value,
            time: selectedTime.value,
            price: selectedServiceDetails.value.price
        };

        console.log('Sending appointment data:', appointmentData); // Log data being sent

        try {
            const response = await fetch('http://localhost:3000/api/appointments', {  // Make sure this URL matches your backend endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                alert('Appointment scheduled successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                alert(`Failed to schedule appointment: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            alert('Error scheduling appointment: ' + error.message);
        }
    }
};



</script>


<style scoped>
* {
    font-family: 'Poppins', sans-serif;
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
    background-color: #f9f9f9;
    padding: 0; /* Remove padding to allow full image coverage */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40%;
    height: 100vh; /* Make the container take the full height of the viewport */
    overflow: hidden; /* Ensure the image doesn't overflow */
}

.illustration-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensure the image covers the entire container */
}


.appointment-scheduler {
    width: 60%;
    padding: 40px;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
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
    font-size: 50px;
    margin-bottom: 10px;
    color: #4b0082;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
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
    margin-top: 20px; /* Add margin so it appears right below the time slots */
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

.vdp-datepicker__calendar {
    width: 100%;
    max-width: 350px;
    height: auto;
}
</style>
