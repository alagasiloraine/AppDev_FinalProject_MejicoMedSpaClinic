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
            <div class="welcome-text">
                <h1>Expert Care for <span>Radiant Skin</span> and Lasting Wellness</h1>
                <p>Mejico MD Medical Spa Clinic offers a blend of advanced dermatological 
                  treatments and personalized skin care services designed to bring out your natural beauty. 
                  Whether you're seeking medical consultations or luxurious facials, trust us to enhance your 
                  skin's health and appearance.</p>
                <button class="cta-button">Book an Appointment</button>
            </div>
          </div>
          <div class="welcome-logo">
            <img src="/src/images/mejico-image5.png" alt="Mejico Logo">
          </div>
        </div>
      </section>

      <Carousel />

      <LandingAbout />
    </main>

      <FooterComponent />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import FooterComponent from './Footer.vue';
import Carousel from './Carousel.vue'; 
import LandingAbout from './LandingAbout.vue'; 

export default {
  name: 'LandingPage',
  components: {
    FooterComponent,
    Carousel, 
    LandingAbout,
  },
  setup() {
    const apiStatus = ref('');

    onMounted(async () => {
      try {
        const response = await checkHealth();
        apiStatus.value = response.data.message;
      } catch (error) {
        console.error('Error checking API health:', error);
        apiStatus.value = 'Error connecting to API';
      }
    });

    return { apiStatus };
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

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255);
  padding: 15px 30px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.305);
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

main {
  padding-top: 100px;
}

.welcome-section {
  position: relative;
  height: calc(100vh - 100px);
  background-image: url('/src/images/MEJICO-bg-2.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center; 
}

.blur-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.5); 
  z-index: 0;
}

.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-radius: 5px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; 
  margin-left: 10px;
}

.welcome-logo {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Subtle Forward-Backward Animation */
@keyframes slowPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.welcome-logo img {
  max-width: 100%;
  height: auto;
  animation: slowPulse 4s ease-in-out infinite;
}

.welcome-text {
  flex: 1;
  padding-right: 40px;
  padding-left: 50px;
}

/* .welcome-text h3 {
  font-size: 24px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 15px;
} */

.welcome-text h1 {
  margin-top: -10px;
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

.welcome-section h1 {
  font-size: 36px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 10px;
}

.tagline {
  font-size: 20px;
  color: #4A90E2;
  margin-bottom: 20px;
}

.welcome-section p {
  font-size: 16px;
  color: #fff;
  margin: 10px 0;
}

.features-list {
  list-style-type: none;
  padding-left: 0;
  margin-top: 30px;
}

.features-list li {
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
  background-color: #6658ac;
  transform: scale(1.05);
}

.services-section {
  padding: 100px 50px;
  background-color: #f1f1f1;
  text-align: center;
}

.services-section h2 {
  font-size: 36px;
  color: #2C3E50;
  margin-bottom: 50px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px; /* Limit the width of the grid */
  margin: 0 auto; /* Center the grid */
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

.service-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 24px;
  color: #4A90E2;
  margin-bottom: 15px;
}

.service-card p {
  font-size: 16px;
  color: #666;
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    padding: 15px;
  }

  nav {
    margin-top: 15px;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
    padding: 30px;
  }

  .welcome-text {
    padding-right: 0;
    padding-left: 0;
    margin-bottom: 30px;
  }

  .welcome-section h1 {
    font-size: 28px;
  }

  .tagline {
    font-size: 18px;
  }

  .services-section {
    padding: 50px 20px;
  }
}
</style>