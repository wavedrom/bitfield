'use strict';

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

function labelBit (desc, options) {
    var step = options.hspace / options.mod;
    var res = ['g', {'transform': 'translate(' + (step / 2) + ',' + (options.vspace / 5) + ')'}];
    desc.forEach(function (e) {
        if (((e.lsb / options.mod) >> 0) === options.index) {
            res.push(['text', { x: step * (options.mod - e.lsbm - 1) }, e.lsb]);
        }
        if (((e.msb / options.mod) >> 0) === options.index) {
            res.push(['text', { x: step * (options.mod - e.msbm - 1) }, e.msb]);
        }
    });
    return res;
}

function labelName (desc, options) {
    var res = ['g', {'transform': 'translate(0,44)'}];
    return res;
}

function labelAttr (desc, options) {
    var res = ['g', {'transform': 'translate(0,73.6)'}];
    return res;
}

function labels (desc, options) {
    return ['g', {'text-anchor': 'middle'},
        labelBit(desc, options),
        labelName(desc, options),
        labelAttr(desc, options)
    ];
    res.push(bits);
    return res;
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
