# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page landing site for "Hoohookah", a hookah constructor (pick shaft/base, flask, components and see a live total price). Content and comments are in Russian. Built with webpack 4 + Babel + SCSS; no framework, no backend in the repo (the dev server proxies `/api/**` to `<local-ip>:9000`).

## Commands

- `npm start`: dev server with HMR (webpack-dev-server). Binds to the machine's LAN IP (via `address.ip()`), not localhost, and opens a browser.
- `npm run build`: production build into `public/` (git-ignored).
- Both `prestart` and `prebuild` run `rimraf public && npm install` first.
- Lint/format single files the way the pre-commit hook does (husky + lint-staged, see `lint-staged.config.js`):
  - `npx eslint --fix <file.js>` (standard + prettier config)
  - `npx stylelint --fix <file.scss>` (standard + recess property order + scss rules)
  - `npx prettier --write <file>`
- There is no test suite (`npm test` just fails).

Toolchain note: the dependencies are old (webpack 4, `node-sass` 4.x, `image-webpack-loader`), and `node-sass` 4 only builds on old Node versions (around Node 14 or earlier). On modern Node, `npm install` / `npm start` will likely fail until you switch to an older Node or replace `node-sass` with `sass`.

Prettier settings to match: 120-char lines, single quotes, semicolons, ES5 trailing commas, `endOfLine: 'crlf'`.

## Architecture

**Pages and entries.** Every `src/*.html` becomes an HtmlWebpackPlugin page. It gets the `main` chunk plus a chunk with the same basename (`index.html` gets `js/index.js`). Adding a page means adding `src/<name>.html` and a matching `entry` in `webpack.config.js` (`./src/js/_<name>.js`).
- `src/js/_main.js` → `js/bundle.js`: shared code on every page. It imports the global SCSS (`src/sass/styles.scss`), the SVG sprite, polyfills and all the UI modules, and initializes WOW.js animations.
- `src/js/_index.js`: page-specific code (the Swiper sliders).

**HTML partials.** HTML goes through `html-loader?interpolate`, so pages include partials with `${require(`./sections/header.html`)}` (see `src/index.html`). Partials live in `src/sections/` and `src/modules/`. Image `src` paths in HTML are resolved by webpack.

**Assets.**
- SVGs in `src/svg/` are auto-imported (`src/js/modules/_svg.js`, `require.context`) into an inline sprite. Use them as `<svg><use xlink:href="#<filename>"></use></svg>`.
- SVGs in `src/img/` and in node_modules are emitted as files.
- Raster images → `images/`, fonts → `fonts/`, both keep their original names.

**JS modules: data-attribute driven, self-initializing.** Each module in `src/js/modules/` scans the DOM on import and wires itself to data attributes. There is no central init. Most also register instances in a module-level `_instances` map keyed by the attribute value and expose the class on `window` (e.g. `window.Modal`, `window.TabsController`, `window.Constructor`/`window.Constructors`), so inline or external scripts can call static methods like `Modal.open(id)`, `TabsController.open(id, $trigger)`, `Constructor.setPromo(id, price)`.
- `ClassToggler.js`: base class for open/close/toggle UI (open/close/toggle buttons, close on document click, `scroll-lock`, open/close callbacks). `Modal` extends it. `Dropdown`, `Menu` and `Select` exist but are not imported in `_main.js`.
- `Tab.js`: `[data-tabs="<id>"]` holds `[data-tab="<n>"]` triggers, and they switch `[data-tabs-contents="<id>"] [data-tab-content="<n>"]` by toggling `.active`.
- `constructor.js`: the core feature. On `form[data-constructor="<id>"]`, the total is the sum of `data-price` over checked inputs, animated with CountUp into `#total-price`. Each option group `[data-options="<name>"]` pairs with a preview container `[data-images="<name>"]`, and the image at the same index as the checked radio gets `.active`. Promo handling (`setPromo`/`setNormal`) shows the old price in `.constructor-form__total-old`.
- `Scroll.js`: smooth scroll for `[data-scroll-to="<selector>"]`.
- `sliders/constructor.js`: a Swiper instance per `.constructor-form__slider`. It uses `observer`/`observeParents` so sliders inside hidden tabs recalculate when a tab is shown.

When you add an option group, the `data-options` and `data-images` names must match exactly. Watch for mixed Cyrillic/Latin characters in the existing names (e.g. `data-options="сomponents"`).

**Styles.** `src/sass/styles.scss` is the single entry and imports everything in order: reset, then vendor CSS (swiper, animate.css), then `variables/` (fonts, vars, mixins, globals, typography, modals, UI), then `sections/`. New sections go in `src/sass/sections/` and are added to that import list. Media queries use the mixins in `variables/mixins.scss` (`max-width`, `min-width`, `max-height`, …). Class names follow BEM (`block__element--modifier`). SCSS variable names must be lowercase kebab-case (stylelint).
