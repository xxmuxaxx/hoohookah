export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  rules: {
    // BEM: block__element--modifier
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Expected class to be BEM (block__element--modifier)' },
    ],
    'no-descending-specificity': null,
  },
};
