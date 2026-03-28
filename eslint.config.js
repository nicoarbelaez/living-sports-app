// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['.agents/*', '.husky/*', '.expo/*', '.vscode/*', 'dist/*', 'build/*', 'node_modules/*', '*.config.js', 'package-lock.json', 'pnpm-lock.yaml'],
  },
]);
