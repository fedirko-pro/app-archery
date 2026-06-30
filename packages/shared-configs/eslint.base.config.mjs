export const sharedIgnores = [
  '**/dist/**',
  '**/.next/**',
  '**/node_modules/**',
  '**/coverage/**',
  '**/*.d.ts',
  '**/*.js.map',
];

export const sharedTypeScriptRules = {
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-explicit-any': 'warn',
};
