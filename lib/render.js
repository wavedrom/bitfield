'use strict';

var tspan = require('tspan');
var pixelWidth = require('string-pixel-width');

function typeStyle (t) {
    var res;
    switch (t) {
    case 2: res = 0; break;
    case 3: res = 80; break;
    case 4: res = 170; break;
    case 5: res = 45; break;
    case 6: res = 126; break;
    case 7: res = 215; break;
    default: return '';
    }
    return ';fill:hsl(' + res + ',100%,50%)';
}

function t (x, y) {
    return 'translate(' + x + ',' + y + ')';
}

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

function labelArr (desc, opt) {
    var step = opt.hspace / opt.mod;
    var bits  = ['g', {transform: t(step / 2, opt.vspace / 5)}];
    var names = ['g', {transform: t(step / 2, opt.vspace / 2 + 4)}];
    var attrs = ['g', {transform: t(step / 2, opt.vspace)}];
    var blanks = ['g', {transform: t(0, opt.vspace / 4)}];
    var fontsize = opt.fontsize;
    var fontfamily = opt.fontfamily;
    var fontweight = opt.fontweight;
    desc.forEach(function (e) {
        var lText, aText, lsbm, msbm, lsb, msb;
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
        bits.push(['text', {
            x: step * (opt.mod - lsbm - 1),
            'font-size': fontsize,
            'font-family': fontfamily,
            'font-weight': fontweight
        }, lsb.toString()]);
        if (lsbm !== msbm) {
            bits.push(['text', {
                x: step * (opt.mod - msbm - 1),
                'font-size': fontsize,
                'font-family': fontfamily,
                'font-weight': fontweight
            }, msb.toString()]);
        }
        if (e.name) {
            var fittedName = e.name;
            var availableBitsOnLane = e.bits;
            
            if (msbm + 1 - e.bits < 0) {
                availableBitsOnLane = e.bits + msbm + 1 - e.bits;
            } else if (msbm + e.bits > opt.mod) {
                availableBitsOnLane = opt.mod - msbm;
            }

            if (pixelWidth(fittedName, {font: opt.fontfamily, size: opt.fontsize}) > availableBitsOnLane * step) {
                while (pixelWidth(fittedName + '...', {font: opt.fontfamily, size: opt.fontsize}) > availableBitsOnLane * step) {
                    fittedName = fittedName.substring(0, fittedName.length - 1);
                }

                fittedName = fittedName + '...';
                lText = tspan.parse(fittedName);
                lText.push(['title', {}, e.name]);
            } else {
                lText = tspan.parse(e.name);
            }

            lText.unshift({
                x: step * (opt.mod - ((msbm + lsbm) / 2) - 1),
                'font-size': fontsize,
                'font-family': fontfamily,
                'font-weight': fontweight
            });
            lText.unshift('text');
            names.push(lText);
        }

        if ((e.name === undefined) || (e.type !== undefined)) {
            let style = 'fill-opacity:0.1' + typeStyle(e.type);
            blanks.push(['rect', {
                style: style,
                x: step * (opt.mod - msbm - 1),
                y: 0,
                width: step * (msbm - lsbm + 1),
                height: opt.vspace / 2
            }]);
        }
        if (e.attr) {
            aText = tspan.parse(e.attr);
            aText.unshift({
                x: step * (opt.mod - ((msbm + lsbm) / 2) - 1),
                'font-size': fontsize,
                'font-family': fontfamily,
                'font-weight': fontweight
            });
            aText.unshift('text');
            attrs.push(aText);
        }
    });
    return ['g', blanks, bits, names, attrs];
}

function labels (desc, opt) {
    return ['g', {'text-anchor': 'middle'},
        labelArr(desc, opt)
    ];
}

function cage (desc, opt) {
    var hspace = opt.hspace;
    var vspace = opt.vspace;
    var mod = opt.mod;
    var res = ['g', {
        stroke: 'black',
        'stroke-width': 1,
        'stroke-linecap': 'round',
        transform: t(0, vspace / 4)
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
    var res = ['g', {
        transform: t(4.5, (opt.lanes - opt.index - 1) * opt.vspace + 0.5)
    }];
    res.push(cage(desc, opt));
    res.push(labels(desc, opt));
    return res;
}

function isIntGTorDefault(val, min, def) {
    return (typeof val === 'number' && val > min) ? (val |0) : def;
}

function render (desc, opt) {
    opt = (typeof opt === 'object') ? opt : {};

    opt.vspace = isIntGTorDefault(opt.vspace, 19, 80);
    opt.hspace = isIntGTorDefault(opt.hspace, 39, 640);
    opt.lanes = isIntGTorDefault(opt.lanes, 0, 2);
    opt.bits = isIntGTorDefault(opt.bits, 4, 32);
    opt.fontsize = isIntGTorDefault(opt.fontsize, 5, 14);

    opt.bigendian = opt.bigendian || false;
    opt.fontfamily = 'Arial';
    opt.fontweight = opt.fontweight || 'normal';

    var res = ['svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: (opt.hspace + 9),
        height: (opt.vspace * opt.lanes + 5),
        viewBox: [
            0,
            0,
            (opt.hspace + 9),
            (opt.vspace * opt.lanes + 5)
        ].join(' ')
    }];

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
