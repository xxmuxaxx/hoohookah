const STORAGE_KEY = 'hoohookah:age-confirmed';

function isConfirmed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'yes';
  } catch {
    return false;
  }
}

// Asks "are you 18?" once; the answer is remembered in localStorage
export function initAgeGate() {
  const $dialog = document.getElementById('age-gate');
  if (!$dialog || isConfirmed()) return;

  // The question has to be answered: Escape doesn't close the dialog
  $dialog.addEventListener('cancel', (e) => e.preventDefault());

  $dialog.querySelector('[data-age-confirm]').addEventListener('click', () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // Private mode: ask again next time
    }
    $dialog.close();
  });

  $dialog.querySelector('[data-age-deny]').addEventListener('click', () => {
    $dialog.querySelector('[data-age-actions]').hidden = true;
    $dialog.querySelector('[data-age-denied]').hidden = false;
  });

  $dialog.showModal();
}
