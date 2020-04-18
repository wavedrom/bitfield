#!/usr/bin/env node
'use strict';

var fs = require('fs-extra');
var yargs = require('yargs');
var onml = require('onml');

var lib = require('../lib');

var argv = yargs
  .option('input', {describe: 'path to the source', alias: 'i'})
  .option('vspace', {describe: 'vertical space', default: 80})
  .option('hspace', {describe: 'horizontal space', default: 640})
  .option('lanes', {describe: 'rectangle lanes', default: 2})
  .option('bits', {describe: 'overall bitwidth', default: 32})
  .option('fontsize', {describe: 'font size', default: 14})
  .option('bigendian', {describe: 'endianness', default: false})
  .option('compact', {describe: 'compact format', default: false})
  .option('fontfamily', {describe: 'font family', default: 'sans-serif'})
  .option('fontweight', {describe: 'font weight', default: 'normal'})
  .demandOption(['input'])
  .help()
  .argv;

var fileName;

fileName = argv.input;
fs.readJson(fileName, function (err, src) {
  var res = lib.render(src, argv);
  var svg = onml.s(res, 2);
  console.log(svg);
});

/* eslint no-console: 0 */
