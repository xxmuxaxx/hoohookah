# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page landing site for "Хухука" ("Hoohookah"), a hookah constructor: pick a model, shaft, flask shape, glass color, bowl, hose and extras, see a live SVG preview and price, and "place" an order. It is a demo: nothing is sent anywhere. Content is in Russian. Built with Vite + SCSS and plain JS modules; no framework, no backend. Targets modern browsers only (`.browserslistrc`: `defaults`; the CSS relies on `:has()` and `<dialog>`). There are no raster images: the hookah, thumbnails, icons and favicon are all SVG drawn in this repo.

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

**Build (`vite.config.js`).** Vite's root is `src/`. Every `src/*.html` is a page (`build.rolldownOptions.input`). Output goes to `public/` with `base: './'`, so the site works from any folder. Assets are hashed into `public/assets/`, and files under 4 KB are inlined. `console.*` and `debugger` are dropped from production JS (Rolldown `minify.compress`). Two small local plugins live in the config:

- `htmlPartials`: `<load src="./sections/hero.html" />` in a page is replaced with that file's contents (path relative to the including file; partials can nest). Sections live in `src/sections/`, dialogs in `src/modules/`. Asset paths inside partials should be root-relative (`/...`), because the markup ends up inside the page. The dev server does a full reload on any `.html` change.
- `preloadFonts`: adds `<link rel="preload">` for the bundled fonts.

Fonts: Montserrat 400/600/700 as `.woff2` (`src/sass/base/_fonts.scss`). Montserrat-Bold is actually the ExtraBold cut, which is what the design uses for bold. Add a weight's file back before using another weight.

**Scripts.** `src/js/main.js` (every page): SCSS, the SVG sprite, phone mask, age gate. `src/js/index.js` (index page): creates the constructor and fills the data-driven bits of the page (hero showcase hookah, "от N ₽", number of combinations, delivery cards) from the catalog.

**Constructor (`src/js/constructor/`).** Everything is data-driven from `catalog.js`: models (`classic`, `mini`) with option groups (`shaft`, `flask`, `glass`, `bowl`, `hose`, and the multi-choice `extras`), `deliveryOptions` and demo `promoCodes` (percent off; visible to anyone, a real shop must check codes on a server). Prices are in rubles. The first option of each single-choice group is the default. To add or change options, edit the catalog; a new option `id` in `shaft`/`glass`/`hose` only needs a `color`, while new flask shapes, bowls or extras also need drawing code in `hookah.js`.

- `hookah.js` draws the hookah as SVG markup: each part (hose, downstem, flask with glass and water, shaft, plate, bowl, kaloud, tongs) is a function of the model geometry (`GEOMETRY`, a 360×640 view box) and the chosen option. `renderThumb` draws the option-card thumbnails with the same functions. SVG ids are prefixed per render (`idPrefix`) because several hookahs share the page.
- `Constructor.js` (one instance per `[data-constructor]`): renders the model switch, option groups and delivery choices as radio/checkbox cards inside the form, reads the current selection back with `FormData`, and on every change redraws the preview (plus the mini preview in the mobile bar), summary, totals and the CountUp total. Switching models keeps choices the new model also has. Submitting validates the phone (`isPhoneComplete` from `phoneMask.js`), fills and opens the `#order-success` dialog, and resets the form when it closes. The mobile bar (total + "К оформлению") is shown via IntersectionObserver while the options are on screen, never on desktop.
- `format.js`: `formatPrice` (ru-RU rubles).

**Other modules (`src/js/modules/`).** `ageGate.js`: native `<dialog id="age-gate">` shown until the visitor confirms, remembered in localStorage (`hoohookah:age-confirmed`); Escape can't dismiss it. `phoneMask.js`: `+7 (___) ___-__-__` mask for `.j_mask` inputs. `svgSprite.js`: builds an inline sprite at runtime from every `src/svg/*.svg`, copying the root's `viewBox`/`fill`/`stroke*` attributes; use icons as `<svg><use href="#icon-<filename>"></use></svg>` (the `icon-` prefix keeps them from clashing with form field ids).

**Styles.** `src/sass/styles.scss` is the single entry and uses the Sass module system (`@use`): `base/` (fonts, design tokens as CSS custom properties in `_tokens.scss`, reset, base typography/layout/utilities), `components/` (button, field, option/choice/segmented cards, summary/totals, dialog), `sections/` (one file per page section). Colors, radii and shadows come from the CSS variables in `_tokens.scss`; Sass is only used for the mobile-first breakpoint mixins in `abstracts/_breakpoints.scss` (`@include up(md)`, `down(sm)`). Selected cards are styled with `:has(:checked)`, keyboard focus with `:has(:focus-visible)`. Smooth anchor scrolling is CSS (`scroll-behavior`, `scroll-padding-top` for the sticky header).
