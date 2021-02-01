import Swiper from 'swiper/bundle';

document.querySelectorAll('.constructor-form__slider').forEach((slider) => {
  // eslint-disable-next-line no-new
  new Swiper(slider.querySelector('.swiper-container'), {
    spaceBetween: 10,
    slidesPerView: 4,

    navigation: {
      nextEl: slider.querySelector('.constructor-form__button-next'),
      prevEl: slider.querySelector('.constructor-form__button-prev'),
    },

    breakpoints: {
      600: {
        watchOverflow: true,
      },

      480: {
        slidesPerView: 5,
      },
    },
  });
});

// // eslint-disable-next-line no-new
// new Swiper('.constructor-form__radios.swiper-container', {
//   spaceBetween: 10,
//   slidesPerView: 4,

//   navigation: {
//     nextEl: '.constructor-form__button-next',
//     prevEl: '.constructor-form__button-prev',
//   },

//   breakpoints: {
//     480: {
//       slidesPerView: 5,
//     },
//   },
// });
