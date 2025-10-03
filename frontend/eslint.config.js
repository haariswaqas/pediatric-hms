import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Common warning rules
      'no-console': ['warn'],
      'no-debugger': ['warn'],
      'no-alert': ['warn'],
      'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
      'no-shadow': ['warn'],
      'no-undef': ['warn'],
      'no-unused-expressions': ['warn'],
      'no-use-before-define': ['warn'],
      'no-var': ['warn'],
      'prefer-const': ['warn'],
      'react-hooks/rules-of-hooks': ['warn'],
      'react-hooks/exhaustive-deps': ['warn'],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^motion$' }]
    },
  },
]
