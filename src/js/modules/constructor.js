const { CountUp } = require('countup.js');

class Constructor {
  constructor(options) {
    this.constructor = options.constructor;
    this.id = options.id;
    this.options = options.options;

    this.init();
  }

  init() {
    const selectedOptionsPrices = [...this.constructor.querySelectorAll('[data-price]:checked')];
    const totalPrice = this.constructor.querySelector('#total-price');
    totalPrice.dataset.total = selectedOptionsPrices.reduce((a, i) => (a += Number(i.dataset.price)), 0);
    const countUp = new CountUp(this.constructor.querySelector('#total-price'), Number(totalPrice.dataset.total), {
      startVal: Number(totalPrice.dataset.total),
    });

    countUp.start();

    this.options.forEach((option) => {
      const name = option.getAttribute('data-options');

      option.addEventListener(
        'click',
        function(event) {
          if (event.target.dataset.option) {
            const images = document.querySelector(`[data-images="${name}"]`);
            const options = document.querySelector(`[data-options="${name}"]`);

            options.querySelectorAll('input').forEach((option, index) => {
              if (option.checked) {
                images.querySelectorAll('img')[index].classList.add('active');
              } else {
                images.querySelectorAll('img')[index].classList.remove('active');
              }
            });

            const selectedOptionsPrices = this.constructor.querySelectorAll('[data-price]:checked');
            let totalPrice = 0;

            selectedOptionsPrices.forEach((item) => {
              totalPrice += Number(item.dataset.price);
            });

            countUp.update(totalPrice);
          }
        }.bind(this)
      );
    });
  }

  static initAll() {
    const constructors = document.querySelectorAll('[data-constructor]');

    constructors.forEach((constructor) => {
      const id = constructor.getAttribute('data-constructor');
      const options = constructor.querySelectorAll('[data-options]');

      // eslint-disable-next-line no-new
      new Constructor({
        constructor,
        id,
        options,
      });
    });
  }
}

Constructor.initAll();
