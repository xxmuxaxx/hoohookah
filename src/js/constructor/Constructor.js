import { CountUp } from 'countup.js';
import { deliveryOptions, models, promoCodes } from './catalog';
import { hookahSvg, renderThumb } from './hookah';
import { formatPrice } from './format';
import { isPhoneComplete } from '../modules/phoneMask';

const COUNT_UP_OPTIONS = { duration: 0.6, separator: ' ', suffix: ' ₽' };

// The hookah constructor inside `[data-constructor]`: renders the option groups of the chosen model from the
// catalog, keeps the preview, summary and prices in sync with the form, and "places" the order (demo, no backend).
export default class Constructor {
  constructor($root) {
    this.$root = $root;
    this.$form = $root.querySelector('form');
    this.$groups = $root.querySelector('[data-groups]');
    this.$preview = $root.querySelector('[data-preview]');
    this.$summary = $root.querySelector('[data-summary]');
    this.$totals = $root.querySelector('[data-totals]');
    this.$promo = this.$form.elements.promo;
    this.$promoMessage = $root.querySelector('[data-promo-message]');
    this.$phone = this.$form.elements.phone;
    this.$phoneError = $root.querySelector('[data-phone-error]');
    this.$mobileBar = $root.querySelector('[data-mobile-bar]');
    this.$mobilePreview = $root.querySelector('[data-mobile-preview]');

    this.modelId = 'classic';
    this.discount = 0; // percent from an applied promo code
    this.renderId = 0;

    this._renderModelSwitch();
    this._renderDelivery();
    this._renderGroups();

    this.total = this._calc().total;
    this.countUps = ['[data-total]', '[data-mobile-total]'].map(
      (selector) =>
        new CountUp($root.querySelector(selector), this.total, { ...COUNT_UP_OPTIONS, startVal: this.total })
    );
    this.countUps.forEach((countUp) => countUp.start());

    this.$form.addEventListener('change', (e) => this._onChange(e));
    this.$form.addEventListener('submit', (e) => this._onSubmit(e));
    $root.querySelector('[data-promo-apply]').addEventListener('click', () => this._applyPromo());
    this.$promo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._applyPromo();
      }
    });
    this.$phone.addEventListener('input', () => (this.$phoneError.textContent = ''));

    this._watchMobileBar();
    this.update();
  }

  get model() {
    return models[this.modelId];
  }

  // Current choice: the option object of every single-choice group, plus the ids of checked extras
  get selection() {
    const data = new FormData(this.$form);
    const parts = {};
    let extras = [];

    this.model.groups.forEach((group) => {
      if (group.multiple) {
        extras = group.options.filter((option) => data.getAll(group.id).includes(option.id));
      } else {
        parts[group.id] = group.options.find((option) => option.id === data.get(group.id)) ?? group.options[0];
      }
    });

    const delivery = deliveryOptions.find((option) => option.id === data.get('delivery')) ?? deliveryOptions[0];
    return { parts, extras, delivery };
  }

  update() {
    const selection = this.selection;
    const prices = this._calc(selection);

    const drawn = { parts: selection.parts, extras: selection.extras.map((extra) => extra.id) };
    this.$preview.innerHTML = hookahSvg(this.modelId, drawn, `preview-${++this.renderId}`);
    this.$mobilePreview.innerHTML = hookahSvg(this.modelId, drawn, `mobile-preview-${this.renderId}`);
    this.$root.querySelector('[data-model-note]').textContent = this.model.note;
    this.$summary.innerHTML = this._summaryItems(selection).join('');
    this.$totals.innerHTML = `
      <div class="totals__row"><dt>Кальян</dt><dd>${formatPrice(prices.items)}</dd></div>
      ${prices.discount ? `<div class="totals__row totals__row--discount"><dt>Скидка ${this.discount}%</dt><dd>−${formatPrice(prices.discount)}</dd></div>` : ''}
      <div class="totals__row"><dt>Доставка</dt><dd>${prices.delivery ? formatPrice(prices.delivery) : 'бесплатно'}</dd></div>
      <div class="totals__row totals__row--total"><dt>Итого</dt><dd>${formatPrice(prices.total)}</dd></div>`;

    this.total = prices.total;
    this.countUps.forEach((countUp) => countUp.update(prices.total));
  }

  _calc(selection = this.selection) {
    const items = [...Object.values(selection.parts), ...selection.extras].reduce(
      (sum, option) => sum + option.price,
      0
    );
    const discount = Math.round((items * this.discount) / 100);
    const delivery = selection.delivery.price;
    return { items, discount, delivery, total: items - discount + delivery };
  }

  _summaryItems({ parts, extras }) {
    const groupTitle = (id) => this.model.groups.find((group) => group.id === id).title;
    return [
      ...Object.entries(parts).map(([groupId, option]) => [groupTitle(groupId), option]),
      ...extras.map((option) => ['Аксессуар', option]),
    ].map(
      ([label, option]) => `<li class="summary__item">
        <span class="summary__label">${label}</span>
        <span class="summary__value">${option.title}</span>
        <span class="summary__price">${option.price ? formatPrice(option.price) : 'без доплаты'}</span>
      </li>`
    );
  }

  // ——— Rendering the form ———

  _renderModelSwitch() {
    this.$root.querySelector('[data-models]').innerHTML = Object.entries(models)
      .map(
        ([id, model]) => `<label class="segmented__item">
          <input class="visually-hidden" type="radio" name="model" value="${id}" ${id === this.modelId ? 'checked' : ''} />
          <span>${model.title}</span>
        </label>`
      )
      .join('');
  }

  _renderDelivery() {
    this.$root.querySelector('[data-delivery]').innerHTML = deliveryOptions
      .map(
        (option, i) => `<label class="choice">
          <input class="choice__input" type="radio" name="delivery" value="${option.id}" ${i === 0 ? 'checked' : ''} />
          <span class="choice__title">${option.title}</span>
          <span class="choice__note">${option.note}</span>
          <span class="choice__price">${option.price ? formatPrice(option.price) : 'бесплатно'}</span>
        </label>`
      )
      .join('');
  }

  // Renders the steps of the current model, keeping the previous choice where the new model has the same option
  _renderGroups(previous = null) {
    const chosen = (group, option, index) => {
      if (!previous) return !group.multiple && index === 0;
      const values = previous.getAll(group.id);
      if (group.multiple) return values.includes(option.id);
      return group.options.some((o) => values.includes(o.id)) ? values.includes(option.id) : index === 0;
    };

    this.$groups.innerHTML = this.model.groups
      .map(
        (group, groupIndex) => `<fieldset class="step">
          <legend class="step__title"><span class="step__number">${groupIndex + 1}</span>${group.title}</legend>
          ${group.multiple ? '<p class="step__hint">Можно выбрать несколько</p>' : ''}
          <div class="options">
            ${group.options
              .map(
                (option, index) => `<label class="option">
                  <input class="option__input" type="${group.multiple ? 'checkbox' : 'radio'}" name="${group.id}" value="${option.id}"
                    ${chosen(group, option, index) ? 'checked' : ''} />
                  <span class="option__thumb">${renderThumb(group.id, option)}</span>
                  <span class="option__title">${option.title}</span>
                  ${option.note ? `<span class="option__note">${option.note}</span>` : ''}
                  <span class="option__price">${option.price ? `${group.multiple ? '+' : ''}${formatPrice(option.price)}` : 'без доплаты'}</span>
                  <svg class="option__check" aria-hidden="true"><use href="#icon-check"></use></svg>
                </label>`
              )
              .join('')}
          </div>
        </fieldset>`
      )
      .join('');

    this.$root.querySelector('[data-order-number]').textContent = this.model.groups.length + 1;
  }

  // ——— Events ———

  _onChange(e) {
    if (e.target.name === 'model') {
      const previous = new FormData(this.$form);
      this.modelId = e.target.value;
      this._renderGroups(previous);
    }
    if (e.target.name === 'promo' || e.target.name === 'phone') return;
    this.update();
  }

  _applyPromo() {
    const code = this.$promo.value.trim().toUpperCase();
    const percent = promoCodes[code];

    this.discount = percent ?? 0;
    this.$promoMessage.classList.toggle('field__hint--error', Boolean(code) && !percent);
    this.$promoMessage.classList.toggle('field__hint--success', Boolean(percent));
    this.$promoMessage.textContent = !code ? '' : percent ? `Скидка ${percent}% применена` : 'Такого промокода нет';
    this.update();
  }

  _onSubmit(e) {
    e.preventDefault();

    if (!isPhoneComplete(this.$phone.value)) {
      this.$phoneError.textContent = 'Введите номер полностью, чтобы мы могли перезвонить';
      this.$phone.focus();
      return;
    }

    const selection = this.selection;
    const $dialog = document.getElementById('order-success');
    $dialog.querySelector('[data-order-id]').textContent = `№${Math.floor(1000 + Math.random() * 9000)}`;
    $dialog.querySelector('[data-order-phone]').textContent = this.$phone.value;
    $dialog.querySelector('[data-order-summary]').innerHTML = this._summaryItems(selection).join('');
    $dialog.querySelector('[data-order-total]').textContent = formatPrice(this._calc(selection).total);
    $dialog.showModal();
    $dialog.addEventListener('close', () => this._reset(), { once: true });
  }

  _reset() {
    this.$form.reset();
    this.modelId = 'classic';
    this.discount = 0;
    this.$promoMessage.textContent = '';
    this._renderGroups();
    this.update();
  }

  // On narrow screens a bar with the total sticks to the bottom while the options are on screen
  _watchMobileBar() {
    const $steps = this.$root.querySelector('.constructor__steps');
    const $order = this.$root.querySelector('#order');
    let stepsVisible = false;
    let orderVisible = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === $steps) stepsVisible = entry.isIntersecting;
        if (entry.target === $order) orderVisible = entry.isIntersecting;
      });
      this.$mobileBar.hidden = !stepsVisible || orderVisible;
    });
    observer.observe($steps);
    observer.observe($order);
  }
}
