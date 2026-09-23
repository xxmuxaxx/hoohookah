import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export function initConstructorSliders() {
  document.querySelectorAll('.constructor-form__slider').forEach(($slider) => {
    new Swiper($slider.querySelector('.constructor-form__radios.swiper'), {
      modules: [Navigation],
      spaceBetween: 10,
      slidesPerView: 4,
      // Recalculate when a hidden tab with the slider is shown
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
      // Keep the (disabled) arrows visible when all slides fit, as in the design
      watchOverflow: false,

      navigation: {
        nextEl: $slider.querySelector('.constructor-form__button-next'),
        prevEl: $slider.querySelector('.constructor-form__button-prev'),
      },

      breakpoints: {
        480: {
          slidesPerView: 5,
        },
      },
    });
  });
}
