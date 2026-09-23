import { CountUp } from 'countup.js';

const instances = {};

// One hookah constructor per `[data-constructor="<id>"]` root. Everything is looked up inside the root,
// so several constructors (e.g. one per tab) don't interfere:
// - `[data-options="<group>"]` holds inputs with `data-option="<n>"`; inputs with `data-price` count towards the total
// - `[data-images="<group>"]` holds the preview images; `[data-image="<n>"]` is active while option n is checked
// - `[data-total-price]` shows the animated total, `[data-old-price]` / `[data-old-price-value]` the pre-promo price
export default class HookahConstructor {
  constructor($root) {
    this.$root = $root;
    this.id = $root.getAttribute('data-constructor');
    this.$form = $root.querySelector('form');
    this.$optionGroups = [...$root.querySelectorAll('[data-options]')];
    this.$total = $root.querySelector('[data-total-price]');
    this.$oldPrice = $root.querySelector('[data-old-price]');
    this.$oldPriceValue = $root.querySelector('[data-old-price-value]');

    this.total = this._calcTotal();
    this.countUp = new CountUp(this.$total, this.total, { startVal: this.total, useGrouping: false });
    this.countUp.start();
    this._syncImages();

    this.$form.addEventListener('change', () => this.update());
    // `reset` fires before the inputs are reset, so wait for the form to change
    this.$form.addEventListener('reset', () =>
      setTimeout(() => {
        this.removePromo();
        this.update();
      })
    );

    instances[this.id] = this;
  }

  update() {
    this._syncImages();
    this._setTotal(this._calcTotal());
  }

  applyPromo(price) {
    this.$oldPriceValue.textContent = this.total;
    this.$oldPrice.style.display = 'inline-block';
    this._setTotal(price);
  }

  removePromo() {
    this.$oldPrice.style.display = '';
  }

  _setTotal(total) {
    this.total = total;
    this.countUp.update(total);
  }

  _calcTotal() {
    return [...this.$root.querySelectorAll('[data-price]:checked')].reduce(
      (sum, $input) => sum + Number($input.getAttribute('data-price')),
      0
    );
  }

  _syncImages() {
    this.$optionGroups.forEach(($group) => {
      const $images = this.$root.querySelector(`[data-images="${$group.getAttribute('data-options')}"]`);
      if (!$images) return;

      $group.querySelectorAll('[data-option]').forEach(($input) => {
        const $image = $images.querySelector(`[data-image="${$input.getAttribute('data-option')}"]`);
        if (!$image) return;

        if ($input.checked) {
          $image.classList.add('active');
        } else {
          $image.classList.remove('active');
        }
      });
    });
  }

  // Public API (exposed as `window.Constructor`), e.g. for applying a promo code from outside
  static setPromo(id, price) {
    instances[id].applyPromo(price);
  }

  static setNormal(id) {
    instances[id].removePromo();
  }
}

HookahConstructor.instances = instances;

export function initConstructors() {
  document.querySelectorAll('[data-constructor]').forEach(($root) => new HookahConstructor($root));
}
