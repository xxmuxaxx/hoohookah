class Constructor {
  constructor(options) {
    this.constructor = options.constructor;
    this.id = options.id;
    this.options = options.options;

    // console.log(this);

    this.init();
  }

  init() {
    this.options.forEach((option) => {
      const name = option.getAttribute('data-options');

      option.addEventListener('click', function(event) {
        if (event.target.dataset.option) {
          const images = document.querySelector(`[data-images="${name}"]`);

          images.querySelectorAll('img').forEach((image) => {
            if (image.dataset.image === event.target.dataset.option) {
              image.classList.add('active');
            } else {
              image.classList.remove('active');
            }
          });
        }
      });
    });
  }

  static initAll() {
    const constructor = document.querySelector('[data-constructor]');
    const id = constructor.getAttribute('data-constructor');
    const options = constructor.querySelectorAll('[data-options]');

    // eslint-disable-next-line no-new
    new Constructor({
      constructor,
      id,
      options,
    });
  }
}

Constructor.initAll();
