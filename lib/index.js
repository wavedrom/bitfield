'use strict';

var tspan = require('tspan');

function hline (len, x, y) {
    var res = ['line'];
    var opt = {};
    if (x) {
        opt.x1 = x;
        opt.x2 = x + len;
    } else {
        opt.x2 = len;
    }
    if (y) {
        opt.y1 = y;
        opt.y2 = y;
    }
    res.push(opt);
    return res;
}

function vline (len, x, y) {
    var res = ['line'];
    var opt = {};
    if (x) {
        opt.x1 = x;
        opt.x2 = x;
    }
    if (y) {
        opt.y1 = y;
        opt.y2 = y + len;
    } else {
        opt.y2 = len;
    }
    res.push(opt);
    return res;
}

function labelArr (desc, options) {
    var step = options.hspace / options.mod;
    var bits  = ['g', {'transform': 'translate(' + (step / 2) + ',' + (options.vspace / 5) + ')'}];
    var names = ['g', {'transform': 'translate(' + (step / 2) + ',' + (options.vspace / 2 + 4) + ')'}];
    var attrs = ['g', {'transform': 'translate(' + (step / 2) + ',' + (options.vspace) + ')'}];
    var blanks = ['g', {'transform': 'translate(0,' + (options.vspace / 4) + ')'}];
    desc.forEach(function (e) {
        var lText, aText, lsbm, msbm, lsb, msb;
        lsbm = 0;
        msbm = options.mod - 1;
        lsb = options.index * options.mod;
        msb = (options.index + 1) * options.mod - 1;
        if (((e.lsb / options.mod) >> 0) === options.index) {
            lsbm = e.lsbm;
            lsb = e.lsb;
            if (((e.msb / options.mod) >> 0) === options.index) {
                msb = e.msb;
                msbm = e.msbm;
            }
        } else {
            if (((e.msb / options.mod) >> 0) === options.index) {
                msb = e.msb;
                msbm = e.msbm;
            } else {
                return;
            }
        }
        bits.push(['text', { x: step * (options.mod - lsbm - 1) }, lsb]);
        if (lsbm !== msbm) {
            bits.push(['text', { x: step * (options.mod - msbm - 1) }, msb]);
        }
        if (e.name) {
            lText = tspan.parse(e.name);
            lText.unshift({ x: step * (options.mod - ((msbm + lsbm) / 2) - 1) });
            lText.unshift('text');
            names.push(lText);
        } else {
            blanks.push(['rect', {
                style: 'fill-opacity:0.1',
                x: step * (options.mod - msbm - 1),
                y: 0,
                width: step * (msbm - lsbm + 1),
                height: options.vspace / 2
            }]);
        }
        if (e.attr) {
            aText = tspan.parse(e.attr);
            aText.unshift({ x: step * (options.mod - ((msbm + lsbm) / 2) - 1) });
            aText.unshift('text');
            attrs.push(aText);
        }
    });
    return ['g', blanks, bits, names, attrs];
}

function labels (desc, options) {
    return ['g', {'text-anchor': 'middle'},
        labelArr(desc, options)
    ];
}

function cage (desc, options) {
    var hspace = options.hspace;
    var vspace = options.vspace;
    var mod = options.mod;
    var res = ['g', {
        stroke: 'black',
        'stroke-width': 1,
        'stroke-linecap': 'round',
        transform: 'translate(0,' + (vspace / 4) + ')'
    }];

    res.push(hline(hspace));
    res.push(vline(vspace / 2));
    res.push(hline(hspace, 0, vspace / 2));

    var i = options.index * options.mod, j = options.mod;
    do {
        if ((j === options.mod) || desc.some(function (e) { return (e.lsb === i); })) {
            res.push(vline((vspace / 2), j * (hspace / mod)));
        } else {
            res.push(vline((vspace / 16), j * (hspace / mod)));
            res.push(vline((vspace / 16), j * (hspace / mod), vspace * 7 / 16));
        }
        i++; j--;
    } while (j);
    return res;
}

function lane (desc, options) {
    var res = ['g', {
        transform: 'translate(4.5,' + ((options.lanes - options.index - 1) * options.vspace + 0.5) + ')'
    }];
    res.push(cage(desc, options));
    res.push(labels(desc, options));
    return res;
}

function render (desc, options) {
    options = options || {
        vspace: 80,
        hspace: 640,
        lanes: 2,
        bits: 32
    };

    var res = ['svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: (options.hspace + 9),
        height: (options.vspace * options.lanes + 1),
        viewBox: [0, 0,
            (options.hspace + 9),
            (options.vspace * options.lanes + 1)
        ].join(' ')
    }];

    var lsb = 0;
    var mod = options.bits / options.lanes;
    options.mod = mod;
    desc.forEach(function (e) {
        e.lsb = lsb;
        e.lsbm = lsb % mod;
        lsb += e.bits;
        e.msb = lsb - 1;
        e.msbm = e.msb % mod;
    });

    var i;
    for (i = 0; i < options.lanes; i++) {
        options.index = i;
        res.push(lane(desc, options));
    }
    return res;
}

exports.render = render;
