import globals from 'globals';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';

export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'], // Match JavaScript and TypeScript files
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': eslintPluginTypeScript,
      import: importPlugin,
      unicorn,
      perfectionist,
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Disable prop-types checks when using TypeScript
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Enforce import resolution
      'import/no-unresolved': ['error', { caseSensitive: true }],
      // Enforce import order and grouping
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          groups: [
            'side-effect',
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          newlinesBetween: 'always',
          // no custom alias groups
        },
      ],
      // Prefer explicit extensions only for non-TS
      'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
      // Guard against incorrect filename casing on case-insensitive FS
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
            kebabCase: true,
          },
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      // Use TS resolver so extensionless TS imports resolve in lint
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },
      'import-x/core-modules': [
        'virtual:pwa-register',
        '@testing-library/jest-dom',
      ],
    },
  },
];
