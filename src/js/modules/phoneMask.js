const MATRIX = '+7 (___) ___-__-__';

// Formats `.j_mask` inputs as a Russian phone number while typing
export function initPhoneMask() {
  document.querySelectorAll('.j_mask').forEach((input) => {
    ['input', 'focus', 'blur', 'keydown'].forEach((type) => input.addEventListener(type, mask));

    if (input.value !== '') {
      // eslint-disable-next-line no-undef
      input.dispatchEvent(new Event('input'));
      input.blur();
    }
  });
}

function setCursorPosition(pos, elem) {
  elem.focus();
  if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
  else if (elem.createTextRange) {
    const range = elem.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
}

function mask(event) {
  if (this.selectionStart < 3) event.preventDefault();
  let i = 0;
  const def = MATRIX.replace(/\D/g, '');
  let val = this.value.replace(/\D/g, '');

  if (def.length >= val.length) val = def;
  this.value = MATRIX.replace(/[_\d]/g, function(a) {
    return i < val.length ? val.charAt(i++) : a;
  });
  i = this.value.indexOf('_');
  if (event.keyCode === 8) i = this.value.lastIndexOf(val.substr(-1)) + 1;
  if (i !== -1) {
    i < 5 && (i = 3);
    this.value = this.value.slice(0, i);
  }
  if (event.type === 'blur') {
    if (this.value.length < 5) this.value = '';
  } else setCursorPosition(this.value.length, this);
}
