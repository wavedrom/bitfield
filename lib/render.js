'use strict';

var tspan = require('tspan');

var colors = {
    2: 0,
    3: 80,
    4: 170,
    5: 45,
    6: 126,
    7: 215
};

function typeStyle (t) {
    var color = colors[t];
    return (color !== undefined) ? ';fill:hsl(' + color + ',100%,50%)' : '';
}

function t (x, y) {
    return 'translate(' + x + ',' + y + ')';
}

function text (body, x, y) {
    var attr = {};
    if (x) { attr.x = x; }
    if (y) { attr.y = y; }
    return ['text', attr].concat(tspan.parse(body));
}

function isIntGTorDefault(val, min, def) {
    return (typeof val === 'number' && val > min) ? (val |0) : def;
}

function getSVG (w, h) {
    return ['svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: w,
        height: h,
        viewBox: [0, 0, w, h].join(' ')
    }];
}

function hline (len, x, y) {
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
    return ['line', opt];
}

function vline (len, x, y) {
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
    return ['line', opt];
}

function getLabel (val, x, y, step, len) {
    var i, res = ['g', {}];
    if (typeof val === 'number') {
        for (i = 0; i < len; i++) {
            res.push(text(
                (val >> i) & 1,
                x + step * (len / 2 - i - 0.5),
                y
            ));
        }
        return res;
    }
    return text(val, x, y);
}

function getAttr (e, opt, step, lsbm, msbm) {
    var x = step * (opt.mod - ((msbm + lsbm) / 2) - 1);
    if (Array.isArray(e.attr)) {
        return e.attr.reduce(function (prev, a, i) {
            if (a === undefined || a === null) {
                return prev;
            }
            return prev.concat([getLabel(a, x, 16 * i, step, e.bits)]);
        }, ['g', {}]);
    }
    return getLabel(e.attr, x, 0, step, e.bits);
}

function labelArr (desc, opt) {
    var step = opt.hspace / opt.mod;
    var bits  = ['g', {transform: t(step / 2, opt.vspace / 5)}];
    var names = ['g', {transform: t(step / 2, opt.vspace / 2 + 4)}];
    var attrs = ['g', {transform: t(step / 2, opt.vspace)}];
    var blanks = ['g', {transform: t(0, opt.vspace / 4)}];
    desc.forEach(function (e) {
        var lsbm, msbm, lsb, msb;
        lsbm = 0;
        msbm = opt.mod - 1;
        lsb = opt.index * opt.mod;
        msb = (opt.index + 1) * opt.mod - 1;
        if (((e.lsb / opt.mod) >> 0) === opt.index) {
            lsbm = e.lsbm;
            lsb = e.lsb;
            if (((e.msb / opt.mod) >> 0) === opt.index) {
                msb = e.msb;
                msbm = e.msbm;
            }
        } else {
            if (((e.msb / opt.mod) >> 0) === opt.index) {
                msb = e.msb;
                msbm = e.msbm;
            } else {
                return;
            }
        }
        if (opt.compact) {
            if (opt.index == opt.lanes-1) {
                var fields = opt.bits/opt.lanes;
                for (var i = 0; i < fields; i++) {
                    bits.push(text(fields - 1 - i, step*i));
                }
            }
        } else {
            bits.push(text(lsb, step * (opt.mod - lsbm - 1)));
            if (lsbm !== msbm) {
                bits.push(text(msb, step * (opt.mod - msbm - 1)));
            }
        }
        if (e.name) {
            names.push(getLabel(
                e.name,
                step * (opt.mod - ((msbm + lsbm) / 2) - 1),
                0,
                step,
                e.bits
            ));
        }

        if ((e.name === undefined) || (e.type !== undefined)) {
            blanks.push(['rect', {
                style: 'fill-opacity:0.1' + typeStyle(e.type),
                x: step * (opt.mod - msbm - 1),
                y: 0,
                width: step * (msbm - lsbm + 1),
                height: opt.vspace / 2
            }]);
        }
        if (e.attr !== undefined) {
            attrs.push(getAttr(e, opt, step, lsbm, msbm));
        }
    });
    return ['g', blanks, bits, names, attrs];
}

function cage (desc, opt) {
    var hspace = opt.hspace;
    var vspace = opt.vspace;
    var mod = opt.mod;
    var res = ['g', {
        transform: t(0, vspace / 4),
        stroke: 'black',
        'stroke-width': 1,
        'stroke-linecap': 'round'
    }];

    res.push(hline(hspace));
    res.push(vline(vspace / 2));
    res.push(hline(hspace, 0, vspace / 2));

    var i = opt.index * opt.mod, j = opt.mod;
    do {
        if ((j === opt.mod) || desc.some(function (e) { return (e.lsb === i); })) {
            res.push(vline((vspace / 2), j * (hspace / mod)));
        } else {
            res.push(vline((vspace / 16), j * (hspace / mod)));
            res.push(vline((vspace / 16), j * (hspace / mod), vspace * 7 / 16));
        }
        i++; j--;
    } while (j);
    return res;
}


function lane (desc, opt) {
    var ty = (opt.lanes - opt.index - 1);
    var frontLabel="";
    if (opt.compact) {
        ty = ty * opt.vspace / 2;
        frontLabel = text(opt.index, -10, opt.vspace/2 + 4);
    } else {
        ty = ty * opt.vspace + 0.5;
    }
    var tx = 4.5 + opt.compact*20;
    return ['g', {
        transform: t(tx, ty),
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    },
    cage(desc, opt),
    labelArr(desc, opt),
    ['g', frontLabel]
    ];
}

function render (desc, opt) {
    opt = (typeof opt === 'object') ? opt : {};

    opt.vspace = isIntGTorDefault(opt.vspace, 19, 80);
    opt.hspace = isIntGTorDefault(opt.hspace, 39, 800);
    opt.lanes = isIntGTorDefault(opt.lanes, 0, 1);
    opt.bits = isIntGTorDefault(opt.bits, 4, 32);
    opt.fontsize = isIntGTorDefault(opt.fontsize, 5, 14);

    opt.compact = opt.compact || false;
    opt.bigendian = opt.bigendian || false;

    var attributes = desc.reduce(function (prev, cur) {
        return Math.max(prev, (Array.isArray(cur.attr)) ? cur.attr.length : 0);
    }, 0) * 16;
    var res = getSVG(opt.hspace + 9 + 20*opt.compact, (opt.vspace + attributes) * opt.lanes + 5);

    var lsb = 0;
    var mod = opt.bits / opt.lanes;
    opt.mod = mod |0;

    desc.forEach(function (e) {
        e.lsb = lsb;
        e.lsbm = lsb % mod;
        lsb += e.bits;
        e.msb = lsb - 1;
        e.msbm = e.msb % mod;
    });

    var i;
    for (i = 0; i < opt.lanes; i++) {
        opt.index = i;
        res.push(lane(desc, opt));
    }
    return res;
}

module.exports = render;
