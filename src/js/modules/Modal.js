import ClassToggler from './ClassToggler';

const BASE_Z_INDEX = 10;
const instances = {};

// Modals are `.j_modal` elements with an id. Buttons with `data-modal-target="#<id>"` toggle them,
// `.j_closeModal` inside closes them. `data-open-on-load` / `data-open-on-focus` on the modal
// open it on page load / focus its `.input` when opened.
export default class Modal extends ClassToggler {
  constructor(options) {
    super(Object.assign({ scrollLock: true }, options));

    this.id = options.id;
    this.openOnFocus = options.openOnFocus;
    this._zIndex = BASE_Z_INDEX;

    instances[this.id] = this;

    if (options.openOnLoad) this.open();
  }

  open(e) {
    super.open(e);

    if (this.openOnFocus) {
      setTimeout(() => this.$el.querySelector('.input').focus(), 100);
    }

    // Stack above any modal that is already open
    this._zIndex = Math.max(...Object.values(instances).map((modal) => modal._zIndex)) + 1;
    this.$el.style.zIndex = this._zIndex;
  }

  close(e) {
    super.close(e);

    this._zIndex = BASE_Z_INDEX;
    this.$el.style.zIndex = '';
  }

  static open(id) {
    instances[id].open();
  }

  static close(id) {
    instances[id].close();
  }

  static closeAll() {
    Object.values(instances).forEach((modal) => modal.close());
  }

  static setOpenCallback(id, callback) {
    instances[id].openCallback = callback;
  }

  static setCloseCallback(id, callback) {
    instances[id].closeCallback = callback;
  }
}

export function initModals() {
  document.querySelectorAll('.j_modal').forEach(($modal) => {
    new Modal({
      id: $modal.id,
      $el: $modal,
      $toggleBtns: document.querySelectorAll(`[data-modal-target="#${$modal.id}"]`),
      $closeBtns: $modal.querySelectorAll('.j_closeModal'),
      openOnLoad: $modal.hasAttribute('data-open-on-load'),
      openOnFocus: $modal.hasAttribute('data-open-on-focus'),
    });
  });
}
