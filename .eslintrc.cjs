module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true, 
    node: true,
    webextensions: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  globals: {
    chrome: 'readonly',
    browser: 'readonly',
    __DEV__: 'readonly',
    __dirname: 'readonly',
    global: 'writable',
    process: 'readonly',
    module: 'readonly',
    beforeEach: 'readonly',
    updatedSettings: 'readonly'
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // Disable prop-types validation since we're using TypeScript-style development
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_|^React$',
      ignoreRestSiblings: true 
    }],
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off', // Allow unescaped entities in JSX
    'react/display-name': 'off', // Allow anonymous components
  },
  overrides: [
    {
      files: ['extensions/**/*.js'],
      env: {
        webextensions: true,
        browser: true
      },
      globals: {
        chrome: 'readonly',
        browser: 'readonly'
      }
    },
    {
      files: ['scripts/**/*.js', 'vite.config.js', 'vitest.config.js', 'playwright.config.js'],
      env: {
        node: true
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly'
      }
    },
    {
      files: ['src/test/**/*.js', 'src/test/**/*.jsx', '**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true
      },
      globals: {
        global: 'writable',
        beforeEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        test: 'readonly'
      }
    }
  ]
}