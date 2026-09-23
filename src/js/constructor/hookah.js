// Draws hookahs and option thumbnails as SVG markup. Every part is a function of the model geometry and the chosen
// option, so colors and shapes come from the catalog instead of image files.

const WIDTH = 360;
const HEIGHT = 640;
const CX = 150; // the hookah stands left of center, the hose hangs on the right

// Vertical layout of each model inside the 360×640 view box
const GEOMETRY = {
  classic: {
    bowlTop: 40,
    shaftTop: 112,
    plateY: 124,
    bodyTop: 150,
    bodyBottom: 292,
    portY: 316,
    flaskTop: 350,
    flaskBottom: 612,
    flaskWidth: 216,
    neck: 24,
  },
  mini: {
    bowlTop: 208,
    shaftTop: 280,
    plateY: 292,
    bodyTop: 312,
    bodyBottom: 362,
    portY: 378,
    flaskTop: 404,
    flaskBottom: 612,
    flaskWidth: 168,
    neck: 20,
  },
};

// Mixes a #rrggbb color with white (amount > 0) or black (amount < 0)
function shade(hex, amount) {
  const target = amount > 0 ? 255 : 0;
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const mixed = channels.map((c) => Math.round(c + (target - c) * Math.abs(amount)));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

// Horizontal gradient that makes a flat color look like a polished cylinder
function metalGradient(id, color) {
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${shade(color, -0.45)}"/>
    <stop offset="0.28" stop-color="${shade(color, 0.3)}"/>
    <stop offset="0.36" stop-color="${shade(color, 0.6)}"/>
    <stop offset="0.5" stop-color="${color}"/>
    <stop offset="1" stop-color="${shade(color, -0.55)}"/>
  </linearGradient>`;
}

// ——— Flask ———

// Outline of a flask whose neck starts at `top`, standing on `bottom`
export function flaskPath(shape, { cx, top, bottom, width, neck }) {
  const h = bottom - top;
  const w = width / 2;

  // One side of the flask, top to bottom, as segments whose points are [offset from the center, y]
  const segments = {
    // Narrow neck that swells into a round bulb
    drop: [
      { to: [neck, top + h * 0.14] },
      { c1: [neck, top + h * 0.38], c2: [w, top + h * 0.42], to: [w, top + h * 0.72] },
      { c1: [w, bottom - 6], c2: [w - 8, bottom], to: [w - 26, bottom] },
    ],
    // Straight walls widening towards the base
    cone: [
      { to: [neck, top + h * 0.14] },
      { to: [w - 4, bottom - 14] },
      { c1: [w, bottom], c2: [w, bottom], to: [w - 16, bottom] },
    ],
    // Short neck, round shoulders, straight sides
    barrel: [
      { to: [neck, top + h * 0.08] },
      { c1: [neck, top + h * 0.2], c2: [w * 0.92, top + h * 0.2], to: [w * 0.92, top + h * 0.36] },
      { to: [w * 0.92, bottom - 22] },
      { c1: [w * 0.92, bottom], c2: [w * 0.92, bottom], to: [w * 0.92 - 22, bottom] },
    ],
  }[shape];

  const point = ([dx, y], side) => `${cx + side * dx} ${y}`;
  const draw = (seg, to, side) =>
    seg.c1 ? `C ${point(seg.c1, side)} ${point(seg.c2, side)} ${point(to, side)}` : `L ${point(to, side)}`;

  // Left side top-down, then the right side bottom-up: each segment reversed, with its control points swapped
  const starts = [[neck, top], ...segments.map((seg) => seg.to)];
  const left = segments.map((seg) => draw(seg, seg.to, -1));
  const right = segments.map((seg, i) => draw(seg.c1 ? { c1: seg.c2, c2: seg.c1 } : seg, starts[i], 1)).reverse();

  return `M ${point(starts[0], -1)} ${left.join(' ')} L ${point(starts.at(-1), 1)} ${right.join(' ')} Z`;
}

function drawFlask(id, shape, glassColor, box) {
  const path = flaskPath(shape, box);
  const tinted = glassColor !== '#dfe9ee';
  const waterY = box.top + (box.bottom - box.top) * 0.58;
  return `
    <clipPath id="${id}-clip"><path d="${path}"/></clipPath>
    <path d="${path}" fill="${glassColor}" fill-opacity="${tinted ? 0.34 : 0.14}"/>
    <g clip-path="url(#${id}-clip)">
      <rect x="0" y="${waterY}" width="${WIDTH}" height="${HEIGHT}" fill="${tinted ? glassColor : '#8fc6dd'}" fill-opacity="${tinted ? 0.35 : 0.22}"/>
      <ellipse cx="${box.cx}" cy="${waterY}" rx="${box.width / 2}" ry="5" fill="#fff" fill-opacity="0.18"/>
      <path d="M ${box.cx - box.width * 0.34} ${box.bottom - 30} Q ${box.cx - box.width * 0.42} ${waterY - 30} ${box.cx - box.width * 0.3} ${box.top + (box.bottom - box.top) * 0.3}"
        fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
    </g>
    <path d="${path}" fill="none" stroke="${shade(glassColor, 0.5)}" stroke-opacity="0.8" stroke-width="2.5"/>`;
}

// ——— Bowl ———

// Bowl sitting with its stem bottom at (cx, base)
function bowlShape(type, cx, base, color) {
  const dark = shade(color, -0.35);
  const light = shade(color, 0.25);
  const stem = `<rect x="${cx - 9}" y="${base - 16}" width="18" height="16" rx="3" fill="${dark}"/>`;

  if (type === 'phunnel') {
    const top = base - 66;
    return `${stem}
      <path d="M ${cx - 44} ${top} Q ${cx - 40} ${base - 30} ${cx - 16} ${base - 16} L ${cx + 16} ${base - 16} Q ${cx + 40} ${base - 30} ${cx + 44} ${top} Z" fill="${color}"/>
      <ellipse cx="${cx}" cy="${top}" rx="44" ry="8" fill="${light}"/>
      <ellipse cx="${cx}" cy="${top + 1}" rx="36" ry="5" fill="${dark}"/>
      <path d="M ${cx - 5} ${top + 2} L ${cx} ${top - 10} L ${cx + 5} ${top + 2} Z" fill="${light}"/>`;
  }

  if (type === 'silicone') {
    const top = base - 60;
    return `${stem}
      <path d="M ${cx - 36} ${top} L ${cx - 30} ${base - 26} Q ${cx - 28} ${base - 16} ${cx - 16} ${base - 16} L ${cx + 16} ${base - 16} Q ${cx + 28} ${base - 16} ${cx + 30} ${base - 26} L ${cx + 36} ${top} Z" fill="${color}"/>
      <path d="M ${cx - 33} ${top + 16} L ${cx + 33} ${top + 16}" stroke="${dark}" stroke-width="3"/>
      <ellipse cx="${cx}" cy="${top}" rx="36" ry="7" fill="${light}"/>
      <ellipse cx="${cx}" cy="${top + 1}" rx="28" ry="4" fill="${dark}"/>`;
  }

  // Clay: classic tapered bowl
  const top = base - 62;
  return `${stem}
    <path d="M ${cx - 38} ${top} L ${cx - 17} ${base - 16} L ${cx + 17} ${base - 16} L ${cx + 38} ${top} Z" fill="${color}"/>
    <path d="M ${cx - 38} ${top} L ${cx - 17} ${base - 16} L ${cx - 8} ${base - 16} L ${cx - 24} ${top} Z" fill="${light}" fill-opacity="0.35"/>
    <ellipse cx="${cx}" cy="${top}" rx="38" ry="7" fill="${light}"/>
    <ellipse cx="${cx}" cy="${top + 1}" rx="30" ry="4" fill="${dark}"/>`;
}

function drawKaloud(cx, bowlRimY) {
  const y = bowlRimY - 4;
  return `
    <path d="M ${cx - 46} ${y} L ${cx - 40} ${y - 26} Q ${cx} ${y - 38} ${cx + 40} ${y - 26} L ${cx + 46} ${y} Z" fill="#b9bfc8"/>
    <path d="M ${cx - 46} ${y} L ${cx - 40} ${y - 26} L ${cx - 30} ${y - 29} L ${cx - 34} ${y} Z" fill="#e7ebf0" fill-opacity="0.6"/>
    <rect x="${cx - 48}" y="${y - 3}" width="96" height="7" rx="3" fill="#8c939d"/>
    ${[-20, -8, 4, 16].map((x) => `<rect x="${cx + x}" y="${y - 20}" width="5" height="12" rx="2" fill="#5d636c"/>`).join('')}
    <rect x="${cx - 6}" y="${y - 44}" width="12" height="10" rx="4" fill="#2b2b30"/>`;
}

// ——— Whole hookah ———

export function renderHookah(modelId, selection, idPrefix) {
  const g = GEOMETRY[modelId];
  const { parts } = selection;
  const shaft = parts.shaft.color;
  const glass = parts.glass.color;
  const hose = parts.hose;
  const extras = new Set(selection.extras);
  const id = (name) => `${idPrefix}-${name}`;
  const box = { cx: CX, top: g.flaskTop, bottom: g.flaskBottom, width: g.flaskWidth, neck: g.neck };

  // Hose: from the port, up over an arc, then the handle hangs down on the right
  const portEnd = CX + 34;
  const hoseEnd = { x: CX + 176, y: g.portY + 70 };
  const hosePath = `M ${portEnd} ${g.portY} C ${CX + 96} ${g.portY - 48} ${CX + 176} ${g.portY - 40} ${hoseEnd.x} ${hoseEnd.y}`;
  const handleLength = modelId === 'mini' ? 64 : 92;

  return `<defs>
      ${metalGradient(id('metal'), shaft)}
      ${metalGradient(id('steel'), '#c9ced6')}
      <radialGradient id="${id('shadow')}"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="${CX + 30}" cy="${g.flaskBottom + 8}" rx="${g.flaskWidth * 0.75}" ry="14" fill="url(#${id('shadow')})"/>

    <!-- hose -->
    <path d="${hosePath}" fill="none" stroke="${hose.color}" stroke-width="11" stroke-linecap="round"/>
    ${
      hose.id === 'leather'
        ? `<path d="${hosePath}" fill="none" stroke="${shade(hose.color, 0.45)}" stroke-width="1.5" stroke-dasharray="4 4"/>`
        : `<path d="${hosePath}" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="3" stroke-linecap="round" transform="translate(-2 -2)"/>`
    }
    <rect x="${hoseEnd.x - 7}" y="${hoseEnd.y - 4}" width="14" height="${handleLength}" rx="6" fill="url(#${id('metal')})"/>
    <path d="M ${hoseEnd.x - 5} ${hoseEnd.y + handleLength - 4} L ${hoseEnd.x - 3} ${hoseEnd.y + handleLength + 16} L ${hoseEnd.x + 3} ${hoseEnd.y + handleLength + 16} L ${hoseEnd.x + 5} ${hoseEnd.y + handleLength - 4} Z"
      fill="${extras.has('mouthpiece') ? '#e0b453' : shade(shaft, -0.3)}"/>

    <!-- downstem inside the flask, seen through the glass -->
    <rect x="${CX - 6}" y="${g.flaskTop}" width="12" height="${(g.flaskBottom - g.flaskTop) * 0.72}" rx="5" fill="url(#${id('metal')})" opacity="0.8"/>

    <!-- flask -->
    ${drawFlask(id('flask'), parts.flask.id, glass, box)}

    <!-- shaft: port, main tube, decorative body, base nut on the flask neck -->
    <rect x="${CX}" y="${g.portY - 7}" width="${portEnd - CX}" height="14" rx="4" fill="url(#${id('metal')})"/>
    <rect x="${portEnd - 4}" y="${g.portY - 10}" width="8" height="20" rx="3" fill="${shade(shaft, -0.25)}"/>
    <rect x="${CX - 9}" y="${g.shaftTop}" width="18" height="${g.flaskTop - g.shaftTop}" fill="url(#${id('metal')})"/>
    <rect x="${CX - 16}" y="${g.bodyTop}" width="32" height="${g.bodyBottom - g.bodyTop}" rx="12" fill="url(#${id('metal')})"/>
    ${[g.bodyTop + 16, g.bodyBottom - 18].map((y) => `<rect x="${CX - 18}" y="${y}" width="36" height="6" rx="3" fill="${shade(shaft, -0.35)}"/>`).join('')}
    <rect x="${CX - 26}" y="${g.flaskTop - 18}" width="52" height="24" rx="6" fill="url(#${id('metal')})"/>
    <rect x="${CX - 28}" y="${g.flaskTop + 2}" width="56" height="6" rx="3" fill="#1a1a1d"/>

    <!-- plate -->
    <ellipse cx="${CX}" cy="${g.plateY + 3}" rx="66" ry="10" fill="${shade(shaft, -0.5)}"/>
    <ellipse cx="${CX}" cy="${g.plateY}" rx="66" ry="10" fill="url(#${id('metal')})" stroke="#fff" stroke-opacity="0.18"/>

    <!-- bowl and kaloud -->
    ${bowlShape(parts.bowl.id, CX, g.shaftTop + 2, parts.bowl.color)}
    ${extras.has('kaloud') ? drawKaloud(CX, g.bowlTop + 12) : ''}

    <!-- tongs on the floor -->
    ${
      extras.has('tongs')
        ? `<g transform="translate(${CX - 146} ${g.flaskBottom + 10}) rotate(-8)">
            <path d="M 0 0 L 92 -6 M 0 0 L 92 6" stroke="url(#${id('steel')})" stroke-width="4" stroke-linecap="round"/>
            <circle cx="0" cy="0" r="5" fill="#8c939d"/>
          </g>`
        : ''
    }`;
}

export function hookahSvg(modelId, selection, idPrefix, attrs = '') {
  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" ${attrs}>${renderHookah(modelId, selection, idPrefix)}</svg>`;
}

// ——— Thumbnails for the option cards ———

let thumbCount = 0;

export function renderThumb(groupId, option) {
  const id = `thumb-${++thumbCount}`;

  if (groupId === 'flask') {
    const box = { cx: 50, top: 8, bottom: 94, width: 72, neck: 9 };
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${drawFlask(id, option.id, '#dfe9ee', box)}</svg>`;
  }

  if (groupId === 'bowl') {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(0 6)">${bowlShape(option.id, 50, 86, option.color)}</g></svg>`;
  }

  if (groupId === 'extras') {
    const icons = {
      kaloud: drawKaloud(50, 72),
      tongs: `<g transform="translate(8 64) rotate(-30)"><path d="M 0 0 L 92 -6 M 0 0 L 92 6" stroke="#c9ced6" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="#8c939d"/></g>`,
      mouthpiece: `<g transform="rotate(35 50 50)"><rect x="43" y="10" width="14" height="62" rx="6" fill="#c9ced6"/><path d="M 45 70 L 47 92 L 53 92 L 55 70 Z" fill="#e0b453"/></g>`,
    };
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${icons[option.id]}</svg>`;
  }

  // Shafts, glass and hoses are shown as a color swatch
  const isMetal = groupId === 'shaft';
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    ${isMetal ? `<defs>${metalGradient(id, option.color)}</defs>` : ''}
    <circle cx="50" cy="50" r="34" fill="${isMetal ? `url(#${id})` : option.color}" fill-opacity="${groupId === 'glass' ? 0.8 : 1}"
      stroke="#fff" stroke-opacity="0.25" stroke-width="2" ${option.id === 'leather' ? 'stroke-dasharray="5 4"' : ''}/>
    <path d="M 30 38 Q 38 24 54 22" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}
