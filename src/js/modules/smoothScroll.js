// Smoothly scrolls to the element matching `data-scroll-to="<selector>"` on click
export function initSmoothScroll() {
  document.querySelectorAll('[data-scroll-to]').forEach(($link) => {
    $link.addEventListener('click', (e) => {
      e.preventDefault();

      const $target = document.querySelector($link.getAttribute('data-scroll-to'));

      window.scrollBy({
        top: $target.getBoundingClientRect().top,
        behavior: 'smooth',
      });
    });
  });
}
