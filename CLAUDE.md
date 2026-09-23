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
- `npm run lint`: eslint over `src/js` and the root config files, then stylelint over all SCSS, both with `--fix`. The SCSS still has existing stylelint errors (mostly property order), so this rewrites style files. Check the diff before committing it.
- There is no test suite (`npm test` just fails).

Toolchain note: the build runs on modern Node (verified on Node 22) despite webpack 4. Two things make this work, and neither should be removed:

- SCSS compiles with Dart Sass (`sass`, pinned to 1.32.x so the old `/` division syntax doesn't flood the output with deprecation warnings). It's wired in through `implementation: require('sass')` in the sass-loader options.
- `webpack.config.js` patches `crypto.createHash` to swap webpack 4's hardcoded `md4` for `sha256`, because Node 17+ (OpenSSL 3) rejects `md4`. `output.hashFunction` alone doesn't cover every place webpack 4 uses it.

Prettier settings to match: 120-char lines, single quotes, semicolons, ES5 trailing commas, `endOfLine: 'lf'`.

## Architecture

**Pages and entries.** Every `src/*.html` becomes an HtmlWebpackPlugin page. It gets the `main` chunk plus a chunk with the same basename (`index.html` gets `js/index.js`). Adding a page means adding `src/<name>.html` and a matching `entry` in `webpack.config.js` (`./src/js/_<name>.js`).

- `src/js/_main.js` → `js/bundle.js`: shared code on every page. It imports polyfills, the global SCSS (`src/sass/styles.scss`) and the SVG sprite, calls each module's `init*()` function, starts WOW.js animations, and assigns the public `window` API.
- `src/js/_index.js`: page-specific code (the Swiper sliders).

**HTML partials.** HTML goes through `html-loader?interpolate`, so pages include partials with `${require(`./sections/header.html`)}` (see `src/index.html`). Partials live in `src/sections/` and `src/modules/`. Image `src` paths in HTML are resolved by webpack.

**Assets.**

- SVGs in `src/svg/` are auto-imported (`src/js/modules/svgSprite.js`, `require.context`) into an inline sprite. Use them as `<svg><use xlink:href="#<filename>"></use></svg>`.
- SVGs in `src/img/` and in node_modules are emitted as files.
- Raster images → `images/`, fonts → `fonts/`, both keep their original names.

**JS modules: data-attribute driven, explicitly initialized.** Each module in `src/js/modules/` exports an `init*()` function that finds its elements by data attributes (or `j_*` classes) and wires them up. Importing a module has no side effects: a new module needs its `init*()` called from the entry file. Classes keep instances in a module-level map keyed by id, and their static methods act on that map. `_main.js` exposes them on `window` (`Modal`, `TabsController`, `Constructor` = `HookahConstructor`, `Constructors` = its instance map), so inline or external scripts can call `Modal.open(id)`, `TabsController.open(id, $trigger)` or `Constructor.setPromo(id, price)`. Those names are public API; keep them stable.

- `HookahConstructor.js`: the core feature. One instance per `[data-constructor="<id>"]` root (the `.constructor-wrapper` that holds both the form and the preview images). All lookups stay inside the root, so several constructors on one page don't interfere. The total is the sum of `data-price` over checked inputs, animated with CountUp into `[data-total-price]`. Each option group `[data-options="<name>"]` pairs with `[data-images="<name>"]`, and the image with `data-image="<n>"` is active while the input with `data-option="<n>"` is checked. `setPromo`/`setNormal` show or hide the pre-promo price (`[data-old-price]`, value in `[data-old-price-value]`). Resetting the form recalculates and hides the promo price.
- `ClassToggler.js`: base class for open/close/toggle UI (open/close/toggle buttons, close on document click, `scroll-lock`, open/close callbacks). `Modal.js` extends it for `.j_modal` elements: `[data-modal-target="#<id>"]` toggles, `.j_closeModal` closes, `data-open-on-load` opens on page load.
- `Tabs.js`: `[data-tabs="<id>"]` holds `[data-tab="<n>"]` triggers, and they switch `[data-tabs-contents="<id>"] [data-tab-content="<n>"]` by toggling `.active`.
- `smoothScroll.js`: smooth scroll for `[data-scroll-to="<selector>"]`. `phoneMask.js`: `+7 (___) ___-__-__` mask for `.j_mask` inputs.
- `constructorSliders.js`: a Swiper instance per `.constructor-form__slider`. It uses `observer`/`observeParents` so sliders inside hidden tabs recalculate when a tab is shown.
- `polyfills/`: `NodeList.forEach` and `Element.closest` for IE11 (excluded from eslint).

**Styles.** `src/sass/styles.scss` is the single entry and imports everything in order: reset, then vendor CSS (swiper, animate.css), then `variables/` (fonts, vars, mixins, globals, typography, modals, UI), then `sections/`. New sections go in `src/sass/sections/` and are added to that import list. Media queries use the mixins in `variables/mixins.scss` (`max-width`, `min-width`, `max-height`, …). Class names follow BEM (`block__element--modifier`). SCSS variable names must be lowercase kebab-case (stylelint).
