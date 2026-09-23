export default {
  '*.js': ['eslint --fix', 'prettier --write'],
  '*.scss': ['stylelint --fix', 'prettier --write'],
  '*.json': 'prettier --write',
};
