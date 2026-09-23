// Shared code for every page (built as js/bundle.js)

// polyfills
import 'babel-polyfill';
import './modules/polyfills/forEach';
import './modules/polyfills/closest';

// styles and svg sprite
import '../sass/styles.scss';
import './modules/svgSprite';

// libs
import WOW from 'wow.js';

// modules
import Modal, { initModals } from './modules/Modal';
import TabsController, { initTabs } from './modules/Tabs';
import HookahConstructor, { initConstructors } from './modules/HookahConstructor';
import { initPhoneMask } from './modules/phoneMask';
import { initSmoothScroll } from './modules/smoothScroll';

initPhoneMask();
initConstructors();
initSmoothScroll();
initTabs();
initModals();

new WOW().init();

// Public API for inline and external scripts, e.g. `Modal.open('modal')` or `Constructor.setPromo('hookah', 999)`
Object.assign(window, {
  Modal,
  TabsController,
  Constructor: HookahConstructor,
  Constructors: HookahConstructor.instances,
});
