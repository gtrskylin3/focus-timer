module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['error', { 'varsIgnorePattern': '^[A-Z_]' }],
    'react/prop-types': 'off'
  },
  settings: {
    react: {
      version: '18.2'
    }
  },
  ignorePatterns: ['dist']
};