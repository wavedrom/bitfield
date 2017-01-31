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
    if(argv.fontfamily){
      options.fontfamily = argv.fontfamily
    }else{
      options.fontfamily = "sans-serif" // default
    }
    if(argv.fontweight){
      options.fontweight = argv.fontweight
    }else{
      options.fontweight = "normal" // default
    }
    if(argv.fontsize){
      options.fontsize = argv.fontsize
    }else{
      options.fontsize = 14 // default
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
