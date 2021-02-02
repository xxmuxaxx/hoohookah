const { CountUp } = require('countup.js');

const _instance = {};

class Constructor {
  constructor(options) {
    this.constructor = options.constructor;
    this.id = options.id;
    this.options = options.options;
    this.price = this.constructor.querySelector('#total-price');
    this.priceOld = this.constructor.querySelector('.constructor-form__total-old');

    this.init();
  }

  init() {
    const selectedOptionsPrices = [...this.constructor.querySelectorAll('[data-price]:checked')];
    const totalPrice = this.constructor.querySelector('#total-price');
    totalPrice.dataset.total = selectedOptionsPrices.reduce((a, i) => (a += Number(i.dataset.price)), 0);
    this.countUp = new CountUp(this.constructor.querySelector('#total-price'), Number(totalPrice.dataset.total), {
      startVal: Number(totalPrice.dataset.total),
      useGrouping: false,
    });

    this.countUp.start();
    this.price.dataset.total = this.countUp.endVal;

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

            this.countUp.update(totalPrice);
            this.price.dataset.total = totalPrice;
          }
        }.bind(this)
      );
    });

    this.constructor.addEventListener('reset', () => {
      setTimeout(() => {
        const selectedOptionsPrices = this.constructor.querySelectorAll('[data-price]:checked');
        let totalPrice = 0;

        this.options.forEach((option) => {
          const name = option.getAttribute('data-options');
          const images = document.querySelector(`[data-images="${name}"]`);
          const options = document.querySelector(`[data-options="${name}"]`);

          options.querySelectorAll('input').forEach((option, index) => {
            if (option.checked) {
              images.querySelectorAll('img')[index].classList.add('active');
            } else {
              images.querySelectorAll('img')[index].classList.remove('active');
            }
          });
        });

        selectedOptionsPrices.forEach((item) => {
          totalPrice += Number(item.dataset.price);
        });

        this.countUp.update(totalPrice);
        this.price.dataset.total = totalPrice;

        Constructor.setNormal(this.id);
      }, 100);
    });

    _instance[this.id] = this;
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

  static setPromo(id, newPrice) {
    _instance[id].priceOld.innerHTML = _instance[id].price.innerHTML;
    _instance[id].priceOld.style.display = 'inline-block';

    _instance[id].price.innerHTML = `${newPrice}`;
  }

  static setNormal(id) {
    _instance[id].priceOld.style.display = '';
  }
}

window.Constructor = Constructor;

Constructor.initAll();
