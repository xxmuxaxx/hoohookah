import Swiper from 'swiper/bundle';

document.querySelectorAll('.constructor-form__slider').forEach((slider) => {
  // eslint-disable-next-line no-new
  new Swiper(slider.querySelector('.constructor-form__radios.swiper-container'), {
    spaceBetween: 10,
    slidesPerView: 4,
    observer: true,
    observeParents: true,
    watchSlidesVisibility: true,

    navigation: {
      nextEl: slider.querySelector('.constructor-form__button-next'),
      prevEl: slider.querySelector('.constructor-form__button-prev'),
    },

    breakpoints: {
      480: {
        slidesPerView: 5,
      },
    },
  });
});
