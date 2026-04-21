const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      '.agents/*',
      '.husky/*',
      '.expo/*',
      '.vscode/*',
      '.claude/*',
      'dist/*',
      'build/*',
      'node_modules/*',
      '*.config.js',
      'package-lock.json',
      'pnpm-lock.yaml',
      'supabase/functions/**',
      'scripts/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
