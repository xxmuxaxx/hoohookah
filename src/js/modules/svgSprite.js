// Builds an inline sprite from every src/svg/*.svg, usable as <svg><use href="#icon-<filename>"></use></svg>
const icons = import.meta.glob('../../svg/*.svg', { query: '?raw', import: 'default', eager: true });

// Presentation attributes on an icon's root <svg> that its shapes inherit
const INHERITED = ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'];
const SVG_NS = 'http://www.w3.org/2000/svg';

const parser = new DOMParser();
const sprite = document.createElementNS(SVG_NS, 'svg');
sprite.setAttribute('aria-hidden', 'true');
sprite.style.display = 'none';

Object.entries(icons).forEach(([file, source]) => {
  const svg = parser.parseFromString(source, 'image/svg+xml').documentElement;
  const symbol = document.createElementNS(SVG_NS, 'symbol');

  symbol.id = `icon-${file.split('/').pop().replace('.svg', '')}`;
  INHERITED.forEach((name) => svg.hasAttribute(name) && symbol.setAttribute(name, svg.getAttribute(name)));
  symbol.append(...svg.childNodes);
  sprite.append(symbol);
});

document.body.prepend(sprite);
