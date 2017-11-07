#!/usr/bin/env node
'use strict';

var lib = require('../lib'),
    fs = require('fs-extra'),
    yargs = require('yargs'),
    onml = require('onml');

var argv = yargs.argv;
var fileName;

if (argv.input) {
    fileName = argv.input;
    fs.readJson(fileName, function (err, src) {
        var res = lib.render(src, argv);
        var svg = onml.s(res);
        console.log(svg);
    });
} else {
    console.log(argv);
}

/* eslint no-console: 0 */
