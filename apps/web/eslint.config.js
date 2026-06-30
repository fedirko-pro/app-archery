import { sharedIgnores, sharedTypeScriptRules } from '@sokil/shared-configs/eslint.base.config.mjs';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import eslintPluginReact from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';

export default [
  { ignores: sharedIgnores },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...sharedTypeScriptRules,
    },
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      react: eslintPluginReact,
      import: importPlugin,
      unicorn,
      perfectionist,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'import/no-unresolved': ['error', { caseSensitive: true }],
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
        },
      ],
      'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
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
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },
      'import-x/core-modules': ['@testing-library/jest-dom'],
    },
  },
];
