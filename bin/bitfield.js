#!/usr/bin/env node
'use strict';

var lib = require('../lib'),
    fs = require('fs-extra'),
    yargs = require('yargs'),
    onml = require('onml');

var argv = yargs.argv;
var fileName;

if (argv._.length === 1) {
    fileName = argv._[0];
    fs.readJson(fileName, function (err, src) {
        var res = lib.render(src);
        var svg = onml.s(res);
        console.log(svg);
    });
} else {
    console.log(argv);
}
