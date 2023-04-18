module.exports = {
  rules: {
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'indent': [0, 2],
    'require-atomic-updates': 0,
    'arrow-body-style': 0,
    'prefer-const': 0,
  },
  ignorePatterns: ['src/__tests__/**', 'rollup.config.js', 'commitlint.config.js'],
};
