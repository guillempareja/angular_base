import tsParser from '@typescript-eslint/parser';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import jsoncPlugin from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        createDefaultProgram: true,
      },
    },
    plugins: {
      '@angular-eslint': angularPlugin,
      '@typescript-eslint': tsPlugin,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      curly: 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  // Angular HTML templates
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      // Accessibility
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
  // JSON files
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: jsoncPlugin,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
