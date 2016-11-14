#!/usr/bin/env node
'use strict';

var lib = require('../lib'),
    fs = require('fs-extra'),
    yargs = require('yargs'),
    onml = require('onml');

var argv = yargs.count('icestorm').argv;
var fileName;
var options = {
    vspace: 80,
    hspace: 640,
    lanes: 2,
    bits: 32
};

if (argv.input){
    if (argv.vspace && argv.hspace && argv.lanes && argv.bits){
        options = {
            vspace: argv.vspace,
            hspace: argv.hspace,
            lanes: argv.lanes,
            bits: argv.bits
        };
    }
    fileName = argv.input;
    fs.readJson(fileName, function (err, src) {
        var res = lib.render(src, options);
        var svg = onml.s(res);
        console.log(svg);
    });
} else {
    console.log(argv);
}
