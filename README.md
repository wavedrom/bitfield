[![Build Status](https://travis-ci.org/drom/bitfield.svg?branch=master)](https://travis-ci.org/drom/bitfield)

# BitField

## Usage

```js
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
