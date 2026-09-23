module.exports = {
  '*.js': ['npm run lint:eslint', 'npm run lint:prettier'],
  '{!(package)*.json,*.!(browserslist)*rc}': ['npm run lint:prettier --parser json'],
  'package.json': ['npm run lint:prettier'],
  '*.scss': ['npm run lint:stylelint', 'npm run lint:prettier'],
};
