[![NPM version](https://img.shields.io/npm/v/bit-field.svg)](https://www.npmjs.org/package/bit-field)
[![Travis ](https://travis-ci.org/wavedrom/bitfield.svg?branch=master)](https://travis-ci.org/wavedrom/bitfield)
[![Coverage Status](https://coveralls.io/repos/github/wavedrom/bitfield/badge.svg?branch=master)](https://coveralls.io/github/wavedrom/bitfield?branch=master)

## Install

```sh
npm i bit-field
```

## Library usage

```js
var render = require('bit-field/lib/render');
var onml = require('onml');

var reg = [
  {bits: 8, name: 'data'}
];

var options = {
  hspace: 888
};

var jsonml = render(reg, options);
var html = onml.stringify(jsonml);
// <svg...>
```

## CLI Usage

```sh
npx bit-field [options] > alpha.svg
```

### options

```sh
Options:
  --version     Show version number                                    [boolean]
  --input, -i   path to the source                                    [required]
  --vspace      vertical space                                     [default: 80]
  --hspace      horizontal space                                  [default: 640]
  --lanes       rectangle lanes                                     [default: 2]
  --bits        overall bitwidth                                   [default: 32]
  --fontsize    font size                                          [default: 14]
  --hflip       horizontal flip                                 [default: false]
  --vflip       vertical flip                                   [default: false]
  --compact     compact format                                  [default: false]
  --fontfamily  font family                              [default: "sans-serif"]
  --fontweight  font weight                                  [default: "normal"]
  --help        Show help                                              [boolean]
```

### alpha.json

```json
[
    { "name": "IPO",   "bits": 8, "attr": "RO" },
    {                  "bits": 7 },
    { "name": "BRK",   "bits": 5, "attr": "RW", "type": 4 },
    { "name": "CPK",   "bits": 1 },
    { "name": "Clear", "bits": 3 },
    { "bits": 8 }
]
```
### alpha.svg

![Heat Sink](https://rawgit.com/wavedrom/bitfield/master/test/alpha.svg)

## Online Examples

https://observablehq.com/collection/@drom/bitfield
