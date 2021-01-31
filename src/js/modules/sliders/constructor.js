import Swiper from 'swiper/bundle';

// eslint-disable-next-line no-new
new Swiper('.constructor-form__radios.swiper-container', {
  spaceBetween: 10,
  slidesPerView: 4,
  watchOverflow: true,

  breakpoints: {
    480: {
      slidesPerView: 5,
    },
  },
});
