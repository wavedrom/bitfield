[![NPM version](https://img.shields.io/npm/v/bit-field.svg)](https://www.npmjs.org/package/bit-field)
[![Travis ](https://travis-ci.org/drom/bitfield.svg?branch=master)](https://travis-ci.org/drom/bitfield)
[![appVeyor](https://ci.appveyor.com/api/projects/status/o4q4cpfclmqnxgmy?svg=true)](https://ci.appveyor.com/project/drom/bitfield)

## Install

```sh
npm i bit-field
```

## Usage

```sh
bin/bitfield.js test/alpha.json > alpha.svg
```

### alpha.json

```json
[
    { "name": "IPO",   "bits": 8, "attr": "RO" },
    {                  "bits": 7 },
    { "name": "BRK",   "bits": 5, "attr": "RW" },
    { "name": "CPK",   "bits": 1 },
    { "name": "Clear", "bits": 3 },
    { "bits": 8 }
]
```
### alpha.svg

![Heat Sink](https://rawgit.com/drom/bitfield/master/test/alpha.svg)
