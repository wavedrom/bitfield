#!/usr/bin/env node
'use strict';

var lib = require('../lib'),
    fs = require('fs-extra'),
    yargs = require('yargs'),
    onml = require('onml');

var argv = yargs.argv;
var fileName;
var options = {
    vspace: 80,
    hspace: 640,
    lanes: 2,
    bits: 32
};

if (argv.input){
    if(argv.vspace){options.vspace = argv.vspace}
    if(argv.hspace){options.hspace = argv.hspace}
    if(argv.lanes){options.lanes = argv.lanes}
    if(argv.bits){options.bits = argv.bits}
    if(argv.font_family){options.font_family = argv.font_family}

    // if (argv.vspace && argv.hspace && argv.lanes && argv.bits){
    //   // console.log(options.vspace);
    //     options = {
    //         vspace: argv.vspace,
    //         hspace: argv.hspace,
    //         lanes: argv.lanes,
    //         bits: argv.bits
    //     };
    // }
    fileName = argv.input;
    fs.readJson(fileName, function (err, src) {
        var res = lib.render(src, options);
        var svg = onml.s(res);
        console.log(svg);
    });
} else {
    console.log(argv);
}
