module.exports = {
  root: true,
  extends: [
    '@typescript-eslint/recommended',
    'prettier',
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  env: {
    es6: true,
    node: true
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'coverage/'
  ]
};