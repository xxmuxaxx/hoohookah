# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page landing site for "Hoohookah", a hookah constructor (pick shaft/base, flask, components and see a live total price). Content and comments are in Russian. Built with Vite + SCSS and plain JS modules; no framework, no backend in the repo. Targets modern browsers only (`.browserslistrc`: `defaults`, no IE).

## Commands

Requires Node 20.19+ (Vite 8).

- `npm start`: Vite dev server, listening on all interfaces (prints the LAN URL) and opening a browser.
- `npm run build`: production build into `public/` (git-ignored). `npm run preview` serves it.
- `npm run lint`: `eslint --fix .` then `stylelint --fix "src/**/*.scss"`. `npm run format`: `prettier --write .`
- Single files: `npx eslint --fix <file.js>`, `npx stylelint --fix <file.scss>`, `npx prettier --write <file>`.
- The husky pre-commit hook runs lint-staged (`lint-staged.config.js`): eslint + prettier on JS, stylelint + prettier on SCSS, prettier on JSON.
- There is no test suite.

Lint setup: ESLint flat config (`eslint.config.js`: `@eslint/js` recommended + prettier), stylelint (`stylelint-config-standard-scss` + recess property order, class names must be BEM `block__element--modifier`), Prettier (120-char lines, single quotes, ES5 trailing commas).

## Architecture

**Build (`vite.config.js`).** Vite's root is `src/`. Every `src/*.html` is a page (`build.rolldownOptions.input`). Output goes to `public/` with `base: './'`, so the site works from any folder. Assets are hashed into `public/assets/`, and files under 4 KB are inlined. Two small local plugins live in the config:

- `htmlPartials`: `<load src="./sections/header.html" />` in a page is replaced with that file's contents (path relative to the including file; partials can nest). Partials live in `src/sections/` and `src/modules/`. Asset paths inside partials should be root-relative (`/img/...`), because the markup ends up inside the page. The dev server does a full reload on any `.html` change.
- `preloadFonts`: adds `<link rel="preload">` for the bundled fonts, except those matching `skip` (the unused italic).

Fonts are `.woff2` only (`src/sass/variables/fonts.scss`). Montserrat-Bold is actually the ExtraBold cut, which is what the design uses for bold.

PNGs are compressed by `vite-plugin-image-optimizer` (sharp, `quality: 80`). `console.*` and `debugger` are dropped from production JS (Rolldown `minify.compress`).

**Scripts.** Each page includes module scripts: `src/js/main.js` (shared: SCSS, SVG sprite, all modules, `window` API) and a page script such as `src/js/index.js` (the Swiper sliders).

**JS modules: data-attribute driven, explicitly initialized.** Each module in `src/js/modules/` exports an `init*()` function that finds its elements by data attributes (or `j_*` classes) and wires them up. Importing a module has no side effects: a new module needs its `init*()` called from the entry file. Classes keep instances in a module-level map keyed by id, and their static methods act on that map. `main.js` exposes them on `window` (`Modal`, `TabsController`, `Constructor` = `HookahConstructor`, `Constructors` = its instance map), so inline or external scripts can call `Modal.open(id)`, `TabsController.open(id, $trigger)` or `Constructor.setPromo(id, price)`. Those names are public API; keep them stable.

- `HookahConstructor.js`: the core feature. One instance per `[data-constructor="<id>"]` root (the `.constructor-wrapper` that holds both the form and the preview images). All lookups stay inside the root, so several constructors on one page don't interfere. The total is the sum of `data-price` over checked inputs, animated with CountUp into `[data-total-price]`. Each option group `[data-options="<name>"]` pairs with `[data-images="<name>"]`, and the image with `data-image="<n>"` is active while the input with `data-option="<n>"` is checked. `setPromo`/`setNormal` show or hide the pre-promo price (`[data-old-price]`, value in `[data-old-price-value]`). Resetting the form recalculates and hides the promo price.
- `ClassToggler.js`: base class for open/close/toggle UI (open/close/toggle buttons, close on document click, `scroll-lock`, open/close callbacks). `Modal.js` extends it for `.j_modal` elements: `[data-modal-target="#<id>"]` toggles, `.j_closeModal` closes, `data-open-on-load` opens on page load.
- `Tabs.js`: `[data-tabs="<id>"]` holds `[data-tab="<n>"]` triggers, and they switch `[data-tabs-contents="<id>"] [data-tab-content="<n>"]` by toggling `.active`.
- `smoothScroll.js`: smooth scroll for `[data-scroll-to="<selector>"]`. `phoneMask.js`: `+7 (___) ___-__-__` mask for `.j_mask` inputs.
- `constructorSliders.js`: a Swiper instance (Navigation module) per `.constructor-form__slider`. It uses `observer`/`observeParents` so sliders inside hidden tabs recalculate when a tab is shown, and `watchOverflow: false` so the disabled arrows stay visible when all slides fit.
- `svgSprite.js`: builds an inline `<svg>` sprite at runtime from every `src/svg/*.svg` (`import.meta.glob`). Use icons as `<svg><use href="#<filename>"></use></svg>`.

**Styles.** `src/sass/styles.scss` is the single entry and uses the Sass module system (`@use`, not `@import`): reset, then Swiper's CSS, then `variables/` (fonts, vars, mixins, globals, typography, modals, UI), then `sections/`. Swiper's CSS must stay before the project styles so they can override it (e.g. slides are `display: flex`). Each partial `@use`s what it needs (`variables.$green`, `mixins.max-width(...)`). New sections go in `src/sass/sections/` and are added to the entry. `url()` paths are root-relative (`/img/BG.jpg`, `/fonts/...`) because Vite resolves them from `src/`. The slider arrows are drawn by the project's `::before`/`::after`; Swiper's own navigation icon is hidden.
