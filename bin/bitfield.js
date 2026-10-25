#!/usr/bin/env node
'use strict';

const {parseArgs} = require('util');
const fs = require('fs').promises;
const onml = require('onml');

const lib = require('../lib');

const argv = parseArgs({
  args: process.argv.slice(2),
  options: {
    input: {type: 'string', short: 'i'},
    vspace: {type: 'string', default: '80'},
    hspace: {type: 'string', default: '640'},
    lanes: {type: 'string', default: '2'},
    bits: {type: 'string'},
    fontsize: {type: 'string', default: '14'},
    fontfamily: {type: 'string', default: 'sans-serif'},
    fontweight: {type: 'string', default: 'normal'},
    compact: {type: 'boolean', default: false},
    hflip: {type: 'boolean', default: false},
    vflip: {type: 'boolean', default: false},
    uneven: {type: 'boolean', default: false},
    trim: {type: 'string'},
    offset: {type: 'string'},
    help: {type: 'boolean', default: false}
  }
});

const usage = [
  'Usage: bitfield [options] <input>',
  '',
  'Options:',
  '  -i, --input       path to the source                                [string]',
  '      --vspace      vertical space                        [number] [default: 80]',
  '      --hspace      horizontal space                     [number] [default: 640]',
  '      --lanes       rectangle lanes                        [number] [default: 2]',
  '      --bits        overall bitwidth                      [number]',
  '      --fontsize    font size                             [number] [default: 14]',
  '      --fontfamily  font family                          [string] [default: "sans-serif"]',
  '      --fontweight  font weight                          [string] [default: "normal"]',
  '      --compact     compact format                    [boolean] [default: false]',
  '      --hflip       horizontal flip                   [boolean] [default: false]',
  '      --vflip       vertical flip                     [boolean] [default: false]',
  '      --uneven      make lanes uneven if bitsize is odd [boolean] [default: false]',
  '      --trim        trim long names                                     [number]',
  '      --offset      offset the index lanes                              [number]',
  '      --help        Show this help                                     [boolean]'
].join('\n');

const opt = {
  hspace: Number(argv.values.hspace ?? 640),
  vspace: Number(argv.values.vspace ?? 80),
  lanes: Number(argv.values.lanes ?? 2),
  bits: argv.values.bits === undefined ? undefined : Number(argv.values.bits),
  fontsize: Number(argv.values.fontsize ?? 14),
  fontfamily: argv.values.fontfamily ?? 'sans-serif',
  fontweight: argv.values.fontweight ?? 'normal',
  compact: argv.values.compact ?? false,
  hflip: argv.values.hflip ?? false,
  vflip: argv.values.vflip ?? false,
  uneven: argv.values.uneven ?? false,
  trim: argv.values.trim === undefined ? undefined : Number(argv.values.trim),
  offset: argv.values.offset === undefined ? undefined : Number(argv.values.offset)
};

const main = async (fileName) => {
  const src = JSON.parse(await fs.readFile(fileName, 'utf8'));
  const res = lib.render(src, opt);
  console.log(onml.s(res, 2));
};

if (argv.values.help) {
  console.log(usage);
  process.exit(0);
}

if (argv.values.input === undefined) {
  console.error('Missing required option: --input <path>');
  console.error(usage);
  process.exit(1);
}

main(argv.values.input).catch((err) => {
  console.error(err);
  process.exit(1);
});

/* eslint no-console: 0 */
