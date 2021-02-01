// libs
import WOW from 'wow.js';

// default
import './../sass/styles.scss';
import './modules/_svg';

// polyfills
import 'babel-polyfill';
import './modules/polyfills/forEach';
import './modules/polyfills/closest';

// modules
import './modules/mask';
import './modules/constructor';
import './modules/Scroll';
import './modules/Tab';
import './modules/Modal';

new WOW().init();
