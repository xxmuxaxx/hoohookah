const $links = document.querySelectorAll('[data-scroll-to]');

document.addEventListener('DOMContentLoaded', () => {
  if ($links.length) {
    $links.forEach(($link) => {
      $link.addEventListener('click', function(event) {
        event.preventDefault();

        const href = this.getAttribute('data-scroll-to');
        const scrollTarget = document.querySelector(href);
        const elementPosition = scrollTarget.getBoundingClientRect().top;
        const offsetPosition = elementPosition;

        window.scrollBy({
          top: offsetPosition,
          behavior: 'smooth',
        });
      });
    });
  }
});
