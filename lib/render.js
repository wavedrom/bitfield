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
    var x = opt.xattr(lsbm, msbm, step);
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
            } else if (!(lsb > e.lsb && msb < e.msb)) {
                return;
            }
        }
        if (!opt.compact) {
            var lsbn = opt.bitscaler(lsb);
            var msbn = opt.bitscaler(msb);
            bits.push(text(lsbn, step * opt.nlabel(lsbm)));
            if (lsbm !== msbm && lsbn !== msbn) {
                bits.push(text(msbn, step * opt.nlabel(msbm)));
            }
        }
        if (e.name) {
            names.push(getLabel(
                e.name,
                opt.xname(lsbm, msbm, step),
                0,
                step,
                e.bits
            ));
        }

        if ((e.name === undefined) || (e.type !== undefined)) {
            blanks.push(['rect', {
                style: 'fill-opacity:0.1' + typeStyle(e.type),
                x: step * opt.nlabel(lsbm, msbm),
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

function compactLabels(desc, opt) {
    var step = opt.hspace / opt.mod;
    var tx = 4.5 + opt.compact*20 + step/2;
    var labels = ['g', {
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    }];
    for (var i = 0; i < opt.mod; i++) {
        if ((i % opt.bitscale) != 0) { continue; }
        var lbl = opt.bitscaler(opt.nlabel(i));
        labels.push(text(lbl, tx+ step*i, opt.fontsize));
    }
    return labels;
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
    var istep = opt.bigendian ? -1: 1;
    if (opt.bigendian) { i += opt.mod; }
    do {
        if ((j === opt.mod) || desc.some(function (e) { return (e.lsb === i); })) {
            res.push(vline((vspace / 2), j * (hspace / mod)));
        } else {
            res.push(vline((vspace / 16), j * (hspace / mod)));
            res.push(vline((vspace / 16), j * (hspace / mod), vspace * 7 / 16));
        }
        i += istep; j--;
    } while (j);
    return res;
}


function lane (desc, opt) {
    var ty = opt.ylanetext(opt.index);
    var tx = 4.5;
    if (opt.compact) {
        tx += 20;
    }
    var lane = ['g', {
        transform: t(tx, ty),
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    },
    cage(desc, opt),
    labelArr(desc, opt)
    ];
    if (opt.compact) {
        lane.push(['g', text(opt.index, -10, opt.vspace/2 + 4)]);
    }
    return lane;
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
    opt.bitscale = isIntGTorDefault(opt.bitscale, 0, 1);

    opt.bitscaler = function(bit) {
        return Math.floor(bit / opt.bitscale);
    };
    opt.nlabel = function(lsb, msb) {
        var n = msb ? msb: lsb;
        return opt.bigendian ? lsb: opt.mod - n - 1;
    };
    opt.xname = function(lsb, msb, step) {
        return opt.bigendian ?
            step * (msb + lsb) / 2:
            step * (opt.mod - ((msb + lsb) / 2) - 1);
    };
    opt.xattr = function(lsb, msb, step) {
        return opt.bigendian ?
            step * (msb + lsb) / 2:
            step * (opt.mod - ((msb + lsb) / 2) - 1);
    };
    opt.ylanetext = function(index) {
        var ty = 0;
        if (opt.bigendian && opt.compact) {
            ty = index * opt.vspace / 2 + opt.fontsize / 2;
        } else if (opt.bigendian) {
            ty = index * opt.vspace + 0.5;
        } else if (opt.compact) {
            ty = (opt.lanes - index - 1) * opt.vspace / 2 + opt.fontsize / 2;
        } else {
            ty = (opt.lanes - index - 1) * opt.vspace + 0.5;
        }
        return ty;
    };

    var attributes = desc.reduce(function (prev, cur) {
        return Math.max(prev, (Array.isArray(cur.attr)) ? cur.attr.length : 0);
    }, 0) * 16;

    var width = opt.hspace + 9;
    var height = (opt.vspace + attributes) * opt.lanes + 5;
    if (opt.compact) {
        width += 20;
        height = (opt.vspace + attributes) * (opt.lanes + 1)/2 + opt.fontsize;
    }
    var res = getSVG(width, height);

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
    if (opt.compact) {
        res.push(compactLabels(desc, opt));
    }
    return res;
}

module.exports = render;
