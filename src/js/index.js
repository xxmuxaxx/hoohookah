// Code for index.html only
import Constructor from './constructor/Constructor';
import { deliveryOptions, models } from './constructor/catalog';
import { formatPrice } from './constructor/format';
import { hookahSvg } from './constructor/hookah';

document.querySelectorAll('[data-constructor]').forEach(($root) => new Constructor($root));

// Hero: a showcase build drawn with the constructor's renderer
const showcase = models.classic.groups.reduce((parts, group) => {
  const featured = { shaft: 'gold', flask: 'drop', glass: 'amber', bowl: 'phunnel', hose: 'leather' }[group.id];
  if (featured) parts[group.id] = group.options.find((option) => option.id === featured);
  return parts;
}, {});
document.querySelector('[data-hero-hookah]').innerHTML = hookahSvg(
  'classic',
  { parts: showcase, extras: ['kaloud'] },
  'hero'
);

// Hero facts: the cheapest build and the number of combinations, computed from the catalog
const singleGroups = (model) => model.groups.filter((group) => !group.multiple);
const minPrice = Math.min(
  ...Object.values(models).map((model) =>
    singleGroups(model).reduce((sum, group) => sum + Math.min(...group.options.map((option) => option.price)), 0)
  )
);
const combinations = Object.values(models).reduce(
  (sum, model) =>
    sum +
    model.groups.reduce(
      (count, group) => count * (group.multiple ? 2 ** group.options.length : group.options.length),
      1
    ),
  0
);
document.querySelector('[data-min-price]').textContent = formatPrice(minPrice);
document.querySelector('[data-combinations]').textContent = combinations.toLocaleString('ru-RU');

// Delivery section, from the same options as the order form
document.querySelector('[data-delivery-info]').innerHTML = deliveryOptions
  .map(
    (option) => `<li class="card delivery-card">
      <h3 class="delivery-card__title">${option.title}</h3>
      <p class="delivery-card__note">${option.note}</p>
      <p class="delivery-card__price">${option.price ? formatPrice(option.price) : 'Бесплатно'}</p>
    </li>`
  )
  .join('');
