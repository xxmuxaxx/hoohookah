// Shared code for every page
import '../sass/styles.scss';
import './modules/svgSprite';

import { initAgeGate } from './modules/ageGate';
import { initPhoneMask } from './modules/phoneMask';

initPhoneMask();
initAgeGate();
