<template>
  <div class="landing-container">
    <header>
      <div class="logo">
        <img src="/src/images/mejico-MDSpa-logo-ntext.png" alt="Mejico Medical Spa Logo">
        <span class="clinic-name">Mejico MedSpa Clinic</span>
      </div>
      <nav>
        <router-link to="/login" class="nav-btn">Login</router-link>
        <router-link to="/register" class="nav-btn">Sign Up</router-link>
      </nav>
    </header>

    <main>
      <section class="welcome-section">
        <div class="blur-background"></div>
        <div class="welcome-content">
          <div class="welcome-text">
            <h3>Your Partner in Health & Beauty</h3>
            <h1>Expert Care for <span>Radiant Skin</span> and Lasting Wellness</h1>
            <p>Mejico MD Medical Spa Clinic offers a blend of advanced dermatological treatments and personalized skin care services designed to bring out your natural beauty. Whether you're seeking medical consultations or luxurious facials, trust us to enhance your skin's health and appearance.</p>
            <button class="cta-button" @click="handleAppointmentClick">Book an Appointment</button>          </div>
          <div class="welcome-logo">
            <img src="/src/images/mejico-image5.png" alt="Mejico Logo">
          </div>
        </div>
      </section>

      <section class="services-section">
        <h2>Our Services</h2>
        <div class="services-grid">
          <div class="service-card" v-for="(service, index) in services" :key="index">
            <div class="service-icon">{{ service.icon }}</div>
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <p>&copy; 2023 Mejico Medical Spa. All rights reserved.</p>
    </footer>
     <!-- Modal for Login/Registration Reminder -->
     <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <p>You need to log in or register before booking an appointment.</p>

        <button @click="closeModal" class="close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LandingPage',
  setup() {
    const services = ref([
      { icon: '💆', title: 'Facial Treatments', description: 'Rejuvenate your skin with our professional facial treatments.' },
      { icon: '💆‍♂️', title: 'Massage Therapy', description: 'Relax your body and mind with our therapeutic massages.' },
      { icon: '✨', title: 'Laser Hair Removal', description: 'Enjoy smooth, hair-free skin with our advanced laser technology.' }
    ]);
    const showModal = ref(false);

const handleAppointmentClick = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};



return { services, showModal, handleAppointmentClick, closeModal };
}
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.landing-container {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
  width: 1315px;
  margin: 0;
  margin-left: -10px;
  padding: 0;
  background-color: #f9f9f9;
}

/* Header Styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255);
  padding: 15px 40px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 70px;
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.05);
}

.clinic-name {
  font-size: 24px;
  color: #3d2f81;
  margin-left: 15px;
  font-weight: 600;
}

nav {
  display: flex;
  align-items: center;
}

.nav-btn {
  background-color: #4a3b94;
  color: #fff;
  padding: 10px 20px;
  margin-left: 10px;
  border-radius: 10px;
  text-decoration: none;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.nav-btn:hover {
  background-color: #31256a;
  transform: scale(1.05);
}

/* Main Section */
main {
  padding-top: 100px;
}

.welcome-section {
  position: relative;
  height: calc(100vh - 100px);
  background-image: url('/src/images/mejicobgimage.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.blur-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(13px);
  background: rgba(0, 0, 0, 0.5); 
  z-index: 0;
}

.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 50px;
  border-radius: 5px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; 
}

.welcome-logo img {
  max-width: 90%;
  height: auto;
}

.welcome-text {
  flex: 1;
  padding: 0 50px;
}

.welcome-text h3 {
  font-size: 24px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 15px;
}

.welcome-text h1 {
  font-size: 36px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 20px;
}

.welcome-text h1 span {
  font-weight: 900;
  color: #8573df;
}

.welcome-text p {
  font-size: 16px;
  color: #fff;
  margin: 15px 0;
}

.cta-button {
  background-color: #8573df;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin-top: 30px;
}

.cta-button:hover {
  background-color: #2C3E50;
  transform: scale(1.05);
}

/* Services Section */
.services-section {
  padding: 100px 50px;
  background-color: #f1f1f1;
  text-align: center;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.service-card {
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

footer {
  text-align: center;
  padding: 30px 0;
  background-color: #2C3E50;
  color: #fff;
}
/* Modal Styles */
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
  z-index: 2000;
}

.modal-content {
  background: #9ab4c3;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 80%;
}



.close-button {
  background: transparent;
  color: #333;
  border: 1px solid #333;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 15px;
  cursor: pointer;
}

.close-button:hover {
  background: #f1f1f1;
}
</style>
