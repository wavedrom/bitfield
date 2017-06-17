#!/usr/bin/env node
'use strict';

var lib = require('../lib'),
    fs = require('fs-extra'),
    yargs = require('yargs'),
    onml = require('onml');

var argv = yargs.argv;
var fileName;

var options = {
    vspace: argv.vspace || 80,
    hspace: argv.hspace || 640,
    lanes:  argv.lanes  || 2,
    bits:   argv.bits   || 32,
    bigendian: argv.gigendian || false,
    fontfamily: argv.fontfamily || "sans-serif",
    fontweight : argv.fontweight || "normal",
    fontsize : argv.fontsize || 14,
};

if (argv.input) {
    fileName = argv.input;
    fs.readJson(fileName, function (err, src) {
        var res = lib.render(src, options);
        var svg = onml.s(res);
        console.log(svg);
    });
} else {
    console.log(argv);
}
