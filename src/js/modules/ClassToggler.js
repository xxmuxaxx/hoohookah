import { disablePageScroll, enablePageScroll } from 'scroll-lock';

const defaultOptions = {
  $el: null,
  $openBtns: [],
  $closeBtns: [],
  $toggleBtns: [],
  // Elements whose class is switched together with $el, for example an overlay
  $additionalElements: [],
  activeClass: 'active',
  closeOnDocumentClick: false,
  scrollLock: false, // locks <body> scroll while open
  openCallback() {},
  closeCallback() {},
};

// Base for open/close UI: toggles `activeClass` on the element when its buttons are clicked
export default class ClassToggler {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);

    this.$el = options.$el;
    this.$openBtns = [...options.$openBtns];
    this.$closeBtns = [...options.$closeBtns];
    this.$toggleBtns = [...options.$toggleBtns];
    this.$additionalElements = [...options.$additionalElements];
    this.activeClass = options.activeClass;
    this.scrollLock = options.scrollLock;
    this.openCallback = options.openCallback;
    this.closeCallback = options.closeCallback;
    this.isOpen = false;

    this.$openBtns.forEach(($btn) => $btn.addEventListener('click', (e) => this.open(e)));
    this.$closeBtns.forEach(($btn) => $btn.addEventListener('click', (e) => this.close(e)));
    this.$toggleBtns.forEach(($btn) => $btn.addEventListener('click', (e) => this.toggle(e)));

    if (options.closeOnDocumentClick) {
      document.addEventListener('click', (e) => this._onDocumentClick(e));
    }
  }

  open(e) {
    this._elements().forEach(($el) => $el.classList.add(this.activeClass));
    if (this.scrollLock) disablePageScroll(this.$el);

    this.openCallback(e?.currentTarget);
    this.isOpen = true;
  }

  close(e) {
    this._elements().forEach(($el) => $el.classList.remove(this.activeClass));
    if (this.scrollLock) enablePageScroll(this.$el);

    this.closeCallback(e?.currentTarget);
    this.isOpen = false;
  }

  toggle(e) {
    if (this.isOpen) {
      this.close(e);
    } else {
      this.open(e);
    }
  }

  _elements() {
    return [this.$el, ...this.$additionalElements];
  }

  _onDocumentClick(e) {
    const $triggers = [...this.$openBtns, ...this.$closeBtns, ...this.$toggleBtns];
    const isTriggerClick = $triggers.some(($btn) => $btn.contains(e.target));

    if (this.isOpen && !isTriggerClick && !this.$el.contains(e.target)) {
      this.close(e);
      e.preventDefault();
    }
  }
}
