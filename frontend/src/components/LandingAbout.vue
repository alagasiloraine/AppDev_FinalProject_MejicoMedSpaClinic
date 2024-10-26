<template>
  <div class="about-us">
    <h1 class="title">About Us</h1>
    
    <section class="section">
      <h2>Our Story</h2>
      <p>Mejico MD Medical Spa was founded with a vision to provide exceptional, personalized aesthetic treatments in a luxurious and welcoming environment. Our state-of-the-art facility combines the latest in medical technology with the soothing ambiance of a high-end spa.</p>
    </section>

    <section class="section">
      <h2>Meet Our Founder</h2>
      <div class="founder">
        <img src="./src/images/mejico-image3" alt="Founder" class="founder-image" />
        <div>
          <h3>Dr. Maria Gonzalez</h3>
          <p>With over 15 years of experience in aesthetic medicine, Dr. Gonzalez brings a wealth of knowledge and a passion for helping clients look and feel their best. Her dedication to continuous learning and innovation ensures that Mejico MD stays at the forefront of the medical spa industry.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Our Mission</h2>
      <p>At Mejico MD, our mission is to enhance the natural beauty of our clients through advanced, non-invasive treatments tailored to their unique needs. We are committed to providing a safe, comfortable, and luxurious experience that leaves our clients feeling confident and rejuvenated.</p>
    </section>

    <section class="section">
      <h2>Our Vision</h2>
      <p>We aspire to be the leading medical spa in the region, known for our exceptional results, personalized care, and commitment to client satisfaction. Our vision is to continually evolve and innovate, bringing the latest advancements in aesthetic medicine to our community.</p>
    </section>

    <section class="section">
      <h2>Why Choose Mejico MD?</h2>
      <ul class="features">
        <li>Expert medical professionals</li>
        <li>Cutting-edge treatments and technology</li>
        <li>Personalized treatment plans</li>
        <li>Luxurious and comfortable environment</li>
        <li>Commitment to safety and quality</li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutUs'
}
</script>

<style scoped>
.about-us {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f8f8f8;
}

.title {
  color: #4B0082;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #20B2AA;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

p {
  line-height: 1.6;
}

.founder {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.founder-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.features {
  list-style-type: none;
  padding: 0;
}

.features li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.features li::before {
  content: '•';
  color: #4B0082;
  font-size: 1.5rem;
  position: absolute;
  left: 0;
  top: -0.2rem;
}

@media (max-width: 600px) {
  .founder {
    flex-direction: column;
    text-align: center;
  }
}
</style>