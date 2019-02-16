#!/usr/bin/env node
'use strict';

var fs = require('fs-extra');
var yargs = require('yargs');
var onml = require('onml');

var lib = require('../lib');

var argv = yargs
    .option('input', {
        alias: 'i',
        describe: 'path to the source'
    })
    .demandOption(['input'])
    .help()
    .argv;

var fileName;

fileName = argv.input;
fs.readJson(fileName, function (err, src) {
    var res = lib.render(src, argv);
    var svg = onml.s(res);
    console.log(svg);
});

/* eslint no-console: 0 */
