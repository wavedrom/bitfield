'use strict';

var lib = require('../lib'),
    onml = require('onml'),
    jsof = require('jsof');


var dat = {
    bigendian1: {
        src: [
            {bits: 1, name: '01h',  attr: 'send'},
            {bits: 1, name: '82h',  attr: 'resp'},
            {bits: 3}
        ],
        dst: [],
        opt: {hspace: 800, bits: 5, bigendian: true}
    },
    bigendian2: {
        src: [
            {bits: 2, name: '5Ah', attr: 'delim'},
            {bits: 2, name: '01h', attr: 'cmd(send)'},
            {bits: 2, name: '01h', attr: 'len'},
            {bits: 2, name: 'D1h', attr: 'reg'},
            {bits: 4},
            {bits: 2, name: '??h', attr: 'chksum'},
            {bits: 2, name: 'C3h', attr: 'e-delim'}
        ],
        dst: [],
        opt: {hspace: 800, bits: 16, lanes: 2,
            bigendian: true, bitscale: 2}
    },
    bigendian3: {
        src: [
            {bits: 2, name: '5Ah'},

            {bits: 2, name: '82h'},
            {bits: 2, name: '05h'},
            {bits: 2, name: '30h'},

            {bits: 2, name: '2Eh'},
            {bits: 2, name: '34h'},
            {bits: 2, name: '2Eh'},
            {bits: 2, name: '31h'},

            {bits: 8},

            {bits: 4},
            {bits: 2, name: '??h'},
            {bits: 2, name: 'C3h'}
        ],
        dst: [],
        opt: {hspace: 800, bits: 32, lanes: 4, compact: true,
            bigendian: true, bitscale: 2}
    }
};

describe('bigendian', function () {
    Object.keys(dat).forEach(function (key) {
        it(key, function (done) {
            var src = dat[key].src;
            var dst = dat[key].dst;
            var opt = dat[key].opt;
            var res = lib.render(src, opt);
            try {
                // expect(res).to.deep.eq(dst);
                console.log(onml.stringify(res));
            } catch (err) {
                console.log(jsof.s(res));
                throw err;
            }
            dst.unshift('text', {x: 20, y: 20, 'font-size': 16 });
            // var svg = ['svg', { viewBox: '0 0 400 100', width: 400, height: 100, xmlns: 'http://www.w3.org/2000/svg' }, dst];
            done();
        });
    });
});
/* eslint no-console: 0 */
/* eslint-env mocha */
