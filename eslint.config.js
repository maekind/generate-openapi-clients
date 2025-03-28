const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettier.rules,
      'prettier/prettier': 'error',

      // Common ESLint rules
      'no-unused-vars': 'error', // Warn about unused variables
      'no-debugger': 'warn', // Warn about debugger statements
      'no-empty': 'error', // Warn about empty block statements
      'no-duplicate-imports': 'error', // Disallow duplicate imports
      'no-multiple-empty-lines': ['warn', { max: 1 }], // Limit consecutive empty lines
      'no-var': 'error', // Require let or const instead of var
      'prefer-const': 'warn', // Suggest using const
      eqeqeq: ['error', 'always'], // Require === and !==
      curly: 'error', // Enforce consistent brace style
      quotes: ['error', 'single'], // Enforce the use of single quotes
      semi: ['error', 'always'], // Require semicolons
      indent: ['error', 2], // Enforce 2-space indentation
      'no-trailing-spaces': 'error', // Disallow trailing spaces
      'eol-last': ['error', 'always'], // Enforce newline at the end of file
      'space-before-function-paren': ['error', 'never'], // Disallow space before function parenthesis
    },
  },
];
