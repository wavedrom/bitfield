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
bin/bitfield.js [options] > alpha.svg
```

### options

```
--input      : input JSON filename - must be specified always
--vspace     : vertical space - default 80
--hspace     : horizontal space - default 640
--lanes      : rectangle lanes - default 2
--bits       : overall bitwidth - default 32
--bigendian  : - default false
--fontfamily : - default sans-serif
--fontweight : - default normal
--fontsize   : - default 14
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
