<template>
  <section class="collection">
    <div class="header">
      <h2>WHY CHOOSE US?<span class="underline"></span></h2>
    </div>
    <Swiper
      class="mySwiper"
      :loop="true"
      :centeredSlides="true"
      :slidesPerView="3"
      :spaceBetween="20"
      effect="coverflow"
      :coverflowEffect="{
        rotate: 0,
        stretch: 0,
        depth: 200,
        modifier: 1,
        slideShadows: false,
      }"
      :autoplay="{
        delay: 3000, 
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
        el: '.swiper-pagination'
      }"
    >
      <SwiperSlide class="content" v-for="(image, index) in images" :key="index">
        <div class="image-container">
          <img :src="image.src" alt="Image">
        </div>
        <div class="text-content">
          <h3>{{ image.title }}</h3>
          <p>{{ image.description }}</p>
          <button class="btn">Read more</button>
        </div>
      </SwiperSlide>
    </Swiper>
    <div class="swiper-pagination"></div>
  </section>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';

export default {
  name: 'SwiperCollection',
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      images: [
        { src: '/src/images/image1.jpg', title: 'Expertise in Medical Spa Services', description: 'At Mejico MD Medical Spa, we blend medical precision with spa luxury, offering services supervised by certified specialists and licensed practitioners. Our team is dedicated to achieving safe, effective, and transformative results for every client.' },
        { src: '/src/images/image2.jpg', title: 'Customized Treatment Plans', description: 'Every individual is unique, and so are their skincare and wellness needs. We offer personalized consultations to design custom treatment plans that address your specific goals, ensuring results that feel and look natural.' },
        { src: '/src/images/image3.jpg', title: 'Safe and Hygienic Environment', description: 'Your safety and comfort are our top priorities. We maintain strict cleanliness and sterilization protocols to ensure a safe, relaxing, and hygienic environment where you can unwind with peace of mind.' },
        { src: '/src/images/image4.jpg', title: 'Holistic Approach to Wellness', description: 'Beyond beauty, we focus on holistic health, promoting overall well-being through a combination of medical and therapeutic services. Our treatments not only enhance your appearance but also foster relaxation, inner peace, and vitality.' },
        { src: '/src/images/image5.jpg', title: 'Exceptional Customer Care', description: 'We pride ourselves on our warm, welcoming atmosphere and attentive service. From the moment you arrive to the completion of your treatment, our team is dedicated to making your experience seamless and enjoyable.' },
        { src: '/src/images/image6.jpg', title: 'Convenient Location and Flexible Scheduling', description: 'Located in a prime, accessible area, Mejico MD Medical Spa offers flexible scheduling options to fit your busy lifestyle. We strive to make quality care convenient and available to all who seek it.' },
      ],
    };
  },
};
</script>




<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

.collection {
  background-color: #ffffff;
  padding: 2rem 0;
  text-align: center;
}

.header h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #382d6e;
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.header h2 .underline {
  display: block;
  position: absolute;
  bottom: -5px; /* Adjust as needed to align with text */
  left: 0;
  width: 0; /* Start with 0 width */
  height: 3px; /* Thickness of the underline */
  background-color: #6656b3;
  animation: snakeLine 3s ease-in-out infinite;
  margin-bottom: 5px;
}

/* Keyframes for the snake-like animation */
@keyframes snakeLine {
  0% {
    width: 0;
    transform: translateX(0);
  }
  25% {
    width: 20%;
    transform: translateX(-5%);
  }
  50% {
    width: 100%;
    transform: translateX(0);
  }
  75% {
    width: 50%;
    transform: translateX(5%);
  }
  100% {
    width: 100%;
    transform: translateX(0);
  }
}

.mySwiper {
  width: 100%;
  height: 70vh;
  margin: 0 auto;
}

.content {
  background-color: #382d6e;
  border: 0.2rem solid rgba(255, 255, 255, 0.1);
  border-radius: 0.7rem;
  overflow: hidden;
  text-align: center;
  padding: 1rem;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease; /* Smooth scaling */
}

.image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-bottom: 0.3rem solid #7964e4;
  border-radius: 0.6rem 0.6rem 0 0;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 1rem;
}

.text-content h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0.8rem 0;
  color: #ffffff;
}

.text-content p {
  max-width: 22rem;
  font-size: 12px;
  font-weight: 400;
  color: #b5b5b5;
  text-align: center;
  margin-bottom: 1rem;
}

.btn {
  background-color: #7964e4;
  padding: 0.5rem 1rem;
  border: none;
  color: white;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #5d4db0;
}

.swiper-pagination {
  position: relative;
  margin-top: 1rem;
}

.swiper-pagination-bullet {
  background-color: #5e4db5;
  opacity: 1;
}

.swiper-pagination-bullet-active {
  background-color: #5d4db0;
}
</style>
