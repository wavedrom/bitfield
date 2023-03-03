[![NPM version](https://img.shields.io/npm/v/bit-field.svg)](https://www.npmjs.org/package/bit-field)
[![Linux](https://github.com/wavedrom/bitfield/actions/workflows/linux.yml/badge.svg)](https://github.com/wavedrom/bitfield/actions/workflows/linux.yml)
[![MacOS](https://github.com/wavedrom/bitfield/actions/workflows/macos.yml/badge.svg)](https://github.com/wavedrom/bitfield/actions/workflows/macos.yml)
[![Windows](https://github.com/wavedrom/bitfield/actions/workflows/windows.yml/badge.svg)](https://github.com/wavedrom/bitfield/actions/workflows/windows.yml)
[![Coverage Status](https://coveralls.io/repos/github/wavedrom/bitfield/badge.svg?branch=trunk)](https://coveralls.io/github/wavedrom/bitfield?branch=trunk)

## Install

```sh
npm i bit-field
```

## Library usage

```js
const render = require('bit-field/lib/render');
const onml = require('onml');

const reg = [
  {bits: 8, name: 'data'}
];

const options = {
  hspace: 888
};

const jsonml = render(reg, options);
const html = onml.stringify(jsonml);
// <svg...>
```

## CLI Usage

```sh
npx bit-field [options] > alpha.svg
```

### options

```sh
Options:
      --version     Show version number                                [boolean]
  -i, --input       path to the source                                [required]
      --vspace      vertical space                        [number] [default: 80]
      --hspace      horizontal space                     [number] [default: 640]
      --lanes       rectangle lanes                        [number] [default: 2]
      --bits        overall bitwidth                      [number] [default: 32]
      --fontsize    font size                             [number] [default: 14]
      --fontfamily  font family                          [default: "sans-serif"]
      --fontweight  font weight                              [default: "normal"]
      --compact     compact format                    [boolean] [default: false]
      --hflip       horizontal flip                   [boolean] [default: false]
      --vflip       vertical flip                     [boolean] [default: false]
      --trim        trim long names                                     [number]
      --offset      offset the index lanes                              [number]
      --help        Show help                                          [boolean]
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

![Heat Sink](test/alpha.svg)

## Online Examples

https://observablehq.com/collection/@drom/bitfield
