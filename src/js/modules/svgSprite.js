// Adds every src/svg/*.svg to the inline sprite, usable as <svg><use xlink:href="#<filename>"></use></svg>
const requireSvg = require.context('../../svg', false, /\.svg$/);

requireSvg.keys().forEach(requireSvg);
