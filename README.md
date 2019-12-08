[![NPM version](https://img.shields.io/npm/v/bit-field.svg)](https://www.npmjs.org/package/bit-field)
[![Travis ](https://travis-ci.org/drom/bitfield.svg?branch=master)](https://travis-ci.org/drom/bitfield)
[![appVeyor](https://ci.appveyor.com/api/projects/status/o4q4cpfclmqnxgmy?svg=true)](https://ci.appveyor.com/project/drom/bitfield)

## Install

```sh
npm i bit-field
```

## Library usage

```js
var render = require('bit-filed/lib/render');
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
  --bigendian   endianness                                      [default: false]
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

![Heat Sink](https://rawgit.com/drom/bitfield/master/test/alpha.svg)

## Online Examples

  * https://beta.observablehq.com/@drom/nop-v
