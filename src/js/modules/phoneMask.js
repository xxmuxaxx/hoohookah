const MATRIX = '+7 (___) ___-__-__';

// Formats `.j_mask` inputs as a Russian phone number while typing
export function initPhoneMask() {
  document.querySelectorAll('.j_mask').forEach((input) => {
    ['input', 'focus', 'blur', 'keydown'].forEach((type) => input.addEventListener(type, mask));

    if (input.value !== '') {
      input.dispatchEvent(new Event('input'));
      input.blur();
    }
  });
}

function setCursorPosition(pos, elem) {
  elem.focus();
  elem.setSelectionRange(pos, pos);
}

function mask(event) {
  if (this.selectionStart < 3) event.preventDefault();
  let i = 0;
  const def = MATRIX.replace(/\D/g, '');
  let val = this.value.replace(/\D/g, '');

  if (def.length >= val.length) val = def;
  this.value = MATRIX.replace(/[_\d]/g, function (a) {
    return i < val.length ? val.charAt(i++) : a;
  });
  i = this.value.indexOf('_');
  if (event.key === 'Backspace') i = this.value.lastIndexOf(val.slice(-1)) + 1;
  if (i !== -1) {
    i < 5 && (i = 3);
    this.value = this.value.slice(0, i);
  }
  if (event.type === 'blur') {
    if (this.value.length < 5) this.value = '';
  } else setCursorPosition(this.value.length, this);
}

export const isPhoneComplete = (value) => value.length === MATRIX.length && !value.includes('_');
