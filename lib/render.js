'use strict';

const tspan = require('tspan');


const round = Math.round;

const getSVG = (w, h) => ['svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  // TODO link ns?
  width: w,
  height: h,
  viewBox: [0, 0, w, h].join(' ')
}];

const tt = (x, y, obj) => Object.assign(
  {transform: 'translate(' + x + (y ? (',' + y) : '') + ')'},
  (typeof obj === 'object') ? obj : {}
);

const colors = { // TODO compare with WaveDrom
  2: 0,
  3: 80,
  4: 170,
  5: 45,
  6: 126,
  7: 215
};

const typeStyle = t => (colors[t] !== undefined)
  ? ';fill:hsl(' + colors[t] + ',100%,50%)'
  : '';

const norm = (obj, other) => Object.assign(
  Object
    .keys(obj)
    .reduce((prev, key) => {
      const val = Number(obj[key]);
      const valInt = isNaN(val) ? 0 : Math.round(val);
      if (valInt !== 0) { prev[key] = valInt; }
      return prev;
    }, {}),
  other
);

const text = (body, x, y) => ['text', norm({x: x, y: y})]
  .concat(tspan.parse(body));

const hline = (len, x, y) => ['line', norm({x1: x, x2: x + len, y1: y, y2: y})];
const vline = (len, x, y) => ['line', norm({x1: x, x2: x, y1: y, y2: y + len})];

const getLabel = (val, x, y, step, len) => {
  if (isNaN(Number(val))) {
    return text(val, x, y);
  }
  const res = ['g', {}];
  for (let i = 0; i < len; i++) {
    res.push(text(
      (val >> i) & 1,
      x + step * (len / 2 - i - 0.5),
      y
    ));
  }
  return res;
};

const getAttr = (e, opt, step, lsbm, msbm) => {
  const x = step * (opt.mod - ((msbm + lsbm) / 2) - 1);
  if (!Array.isArray(e.attr)) {
    return getLabel(e.attr, x, 0, step, e.bits);
  }
  return e.attr.reduce((prev, a, i) =>
    (a === undefined || a === null)
      ? prev
      : prev.concat([getLabel(a, x, 16 * i, step, e.bits)]), // TODO no magic numbers
  ['g', {}]);
};

const labelArr = (desc, opt) => {
  const step = opt.hspace / opt.mod;
  const bits = ['g', tt(round(step / 2), round(opt.vspace / 5))]; // TODO no magic numbers
  const names = ['g', tt(round(step / 2), round(opt.vspace / 2 + 4))]; // TODO no magic numbers
  const attrs = ['g', tt(round(step / 2), round(opt.vspace))];
  const blanks = ['g', tt(0, round(opt.vspace / 4))]; // TODO no magic numbers
  desc.map(e => {
    let lsbm = 0;
    let msbm = opt.mod - 1;
    let lsb = opt.index * opt.mod;
    let msb = (opt.index + 1) * opt.mod - 1;
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
      blanks.push(['rect', norm({
        x: step * (opt.mod - msbm - 1),
        // y: 0,
        width: step * (msbm - lsbm + 1),
        height: opt.vspace / 2
      }, {
        style: 'fill-opacity:0.1' + typeStyle(e.type)
      })]);
    }
    if (e.attr !== undefined) {
      attrs.push(getAttr(e, opt, step, lsbm, msbm));
    }
  });
  return ['g', blanks, bits, names, attrs];
};

const compactLabels = (desc, opt) => {
  const step = opt.hspace / opt.mod;
  const tx = 4.5 + opt.compact * 20 + step / 2; // TODO no magic numbers
  const labels = ['g', {
    'text-anchor': 'middle',
    'font-size': opt.fontsize,
    'font-family': opt.fontfamily || 'sans-serif',
    'font-weight': opt.fontweight || 'normal'
  }];
  for (let i = 0; i < opt.mod; i++) {
    labels.push(text(opt.mod - 1 - i, tx + step * i, opt.fontsize));
  }
  return labels;
};

const cage = (desc, opt) => {
  const {
    hspace,
    vspace,
    mod
  } = opt;
  const res = ['g',
    tt(0, round(vspace / 4), { // 25% of height
      stroke: 'black',
      'stroke-width': 1,
      'stroke-linecap': 'round'
    }),
    hline(hspace, 0, 0),
    vline(vspace / 2, 0, 0),
    hline(hspace, 0, vspace / 2)
  ];

  let i = opt.index * opt.mod,
    j = opt.mod;
  do {
    const xj = j * (hspace / mod);
    if ((j === opt.mod) || desc.some(e => (e.lsb === i))) {
      res.push(vline((vspace / 2), xj, 0)); // 50% of vertical space
    } else {
      res.push(vline((vspace / 16), xj, 0)); // TODO no magic numbers
      res.push(vline((vspace / 16), xj, vspace * 7 / 16)); // TODO no magic numbers
    }
    i++;
    j--;
  } while (j);
  return res;
};

const lane = (desc, opt) => {
  let ty = (opt.lanes - opt.index - 1) * opt.vspace + 0.5;
  let tx = 4.5;
  if (opt.compact) {
    ty = (opt.lanes - opt.index - 1) * opt.vspace / 2 + opt.fontsize / 2;
    tx += 20;
  }
  const res = ['g',
    tt(round(tx), round(ty), {
      'text-anchor': 'middle',
      'font-size': opt.fontsize,
      'font-family': opt.fontfamily || 'sans-serif',
      'font-weight': opt.fontweight || 'normal'
    }),
    cage(desc, opt),
    labelArr(desc, opt)
  ];
  if (opt.compact) {
    res.push(['g', text(opt.index, -10, opt.vspace / 2 + 4)]); // TODO no magic numbers
  }
  return res;
};

// Maximum number of attributes across all fields
const getMaxAttributes = desc =>
  desc.reduce((prev, field) =>
    Math.max(
      prev,
      (field.attr === undefined)
        ? 0
        : Array.isArray(field.attr)
          ? field.attr.length
          : 1
    ),
  0);

const isIntGTorDefault = opt => row => {
  const [key, min, def] = row;
  const val = Math.round(opt[key]);
  opt[key] = (typeof val === 'number' && val >= min) ? val : def;
};

const render = (desc, opt) => {
  opt = (typeof opt === 'object') ? opt : {};

  [ // key         min default
    ['vspace', 20, 80],
    ['hspace', 40, 800],
    ['lanes', 1, 1],
    ['bits', 1, 32],
    ['fontsize', 6, 14]
  ].map(isIntGTorDefault(opt));

  opt.compact = opt.compact || false;
  opt.bigendian = opt.bigendian || false;

  const maxAttributes = getMaxAttributes(desc) * 16; // TODO no magic numbers

  let width = opt.hspace + 9; // TODO no magic numbers
  let height = (opt.vspace + maxAttributes) * opt.lanes + 5; // TODO no magic numbers
  if (opt.compact) {
    width += 20; // TODO no magic numbers
    height = (opt.vspace + maxAttributes) * (opt.lanes + 1) / 2 + opt.fontsize;
  }
  const res = getSVG(width, height);

  let lsb = 0;
  const mod = opt.bits / opt.lanes;
  opt.mod = mod | 0;

  desc.map(e => {
    e.lsb = lsb;
    e.lsbm = lsb % mod;
    lsb += e.bits;
    e.msb = lsb - 1;
    e.msbm = e.msb % mod;
  });

  for (let i = 0; i < opt.lanes; i++) {
    opt.index = i;
    res.push(lane(desc, opt));
  }
  if (opt.compact) {
    res.push(compactLabels(desc, opt));
  }
  return res;
};

module.exports = render;
