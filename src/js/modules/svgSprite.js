// Builds an inline sprite from every src/svg/*.svg, usable as <svg><use href="#<filename>"></use></svg>
const icons = import.meta.glob('../../svg/*.svg', { query: '?raw', import: 'default', eager: true });

const parser = new DOMParser();
const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
sprite.setAttribute('aria-hidden', 'true');
sprite.style.display = 'none';

Object.entries(icons).forEach(([file, source]) => {
  const svg = parser.parseFromString(source, 'image/svg+xml').documentElement;
  const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');

  symbol.id = file.split('/').pop().replace('.svg', '');
  if (svg.hasAttribute('viewBox')) symbol.setAttribute('viewBox', svg.getAttribute('viewBox'));
  symbol.append(...svg.childNodes);
  sprite.append(symbol);
});

document.body.prepend(sprite);
