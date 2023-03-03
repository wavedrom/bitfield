#!/usr/bin/env node
'use strict';

var fs = require('fs-extra');
var yargs = require('yargs');
var onml = require('onml');

var lib = require('../lib');

var argv = yargs
  .option('input', {describe: 'path to the source', alias: 'i'})
  .option('vspace', {describe: 'vertical space', type: 'number', default: 80})
  .option('hspace', {describe: 'horizontal space', type: 'number', default: 640})
  .option('lanes', {describe: 'rectangle lanes', type: 'number', default: 2})
  .option('bits', {describe: 'overall bitwidth', type: 'number', default: undefined})
  .option('fontsize', {describe: 'font size', type: 'number', default: 14})
  .option('fontfamily', {describe: 'font family', default: 'sans-serif'})
  .option('fontweight', {describe: 'font weight', default: 'normal'})
  .option('compact', {describe: 'compact format', type: 'boolean', default: false})
  .option('hflip', {describe: 'horizontal flip', type: 'boolean', default: false})
  .option('vflip', {describe: 'vertical flip', type: 'boolean', default: false})
  .option('uneven', {describe: 'make lanes uneven if bitsize is odd', type: 'boolean', default: false})
  .option('trim', {describe: 'trim long bitfield names by specifying the horizontal space available for a single character', type: 'number'})
  .option('offset', {describe: 'offset for the lane index', type: 'number'})
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
