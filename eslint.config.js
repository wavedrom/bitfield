'use strict';

const globals = require('globals');
const config = require('@drom/eslint-config/eslint9/node22.js');

module.exports = [
  config,
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...config.languageOptions.globals,
        ...globals.mocha
      }
    }
  }
];
