const inputs = document.querySelectorAll('.j_mask'); // Inputs

if (inputs.length) {
  // eslint-disable-next-line no-undef
  const event = new Event('input');

  inputs.forEach((input) => {
    input.addEventListener('input', mask, false);
    input.addEventListener('focus', mask, false);
    input.addEventListener('blur', mask, false);
    input.addEventListener('keydown', mask, false);

    if (input.value !== '') {
      input.dispatchEvent(event);
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
  const matrix = '+7 (___) ___-__-__';
  let i = 0;
  const def = matrix.replace(/\D/g, '');
  let val = this.value.replace(/\D/g, '');

  if (def.length >= val.length) val = def;
  this.value = matrix.replace(/[_\d]/g, function(a) {
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
