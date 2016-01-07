'use strict';

var lib = require('../lib'),
    onml = require('onml'),
    jsof = require('jsof'),
    expect = require('chai').expect;

var dat = {
    word: {
        src: [ { name: 'data', bits: 32 } ],
        dst: []
    },
    bytes: {
        src: [
            { name: 'A', bits: 8 },
            { name: 'B', bits: 7 },
            { name: 'C', bits: 5 },
            { name: 'D', bits: 6 },
            { name: 'E', bits: 3 }
        ],
        dst: []
    },
};

describe('basic', function () {
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
            var svg = ['svg', { viewBox: '0 0 400 100', width: 400, height: 100, xmlns: 'http://www.w3.org/2000/svg' }, dst];
            done();
        });
    });
});
