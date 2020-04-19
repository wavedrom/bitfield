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
  const x = opt.vflip
    ? step * ((msbm + lsbm) / 2)
    : step * (opt.mod - ((msbm + lsbm) / 2) - 1);

  if (!Array.isArray(e.attr)) {
    return getLabel(e.attr, x, 0, step, e.bits);
  }
  return e.attr.reduce((prev, a, i) =>
    (a === undefined || a === null)
      ? prev
      : prev.concat([getLabel(a, x, opt.fontsize * i, step, e.bits)]),
  ['g', {}]);
};

const labelArr = (desc, opt) => {
  const {margin, hspace, vspace, mod, index, fontsize, vflip, compact} = opt;
  const width = hspace - margin.left - margin.right - 1;
  const height = vspace - margin.top - margin.bottom;
  const step = width / mod;
  const blanks = ['g'];
  const bits = ['g', tt(round(step / 2), -3)];
  const names = ['g', tt(round(step / 2), round(height / 2 + fontsize / 3))]; // alignment-baseline: middle
  const attrs = ['g', tt(round(step / 2), round(height + fontsize - 1))]; // middle: hanging
  desc.map(e => {
    let lsbm = 0;
    let msbm = mod - 1;
    let lsb = index * mod;
    let msb = (index + 1) * mod - 1;
    if (((e.lsb / mod) >> 0) === index) {
      lsbm = e.lsbm;
      lsb = e.lsb;
      if (((e.msb / mod) >> 0) === index) {
        msb = e.msb;
        msbm = e.msbm;
      }
    } else {
      if (((e.msb / mod) >> 0) === index) {
        msb = e.msb;
        msbm = e.msbm;
      } else if (!(lsb > e.lsb && msb < e.msb)) {
        return;
      }
    }
    if (!compact) {
      bits.push(text(lsb, step * (vflip ? lsbm : (mod - lsbm - 1))));
      if (lsbm !== msbm) {
        bits.push(text(msb, step * (vflip ? msbm : (mod - msbm - 1))));
      }
    }
    if (e.name) {
      names.push(getLabel(
        e.name,
        step * (vflip
          ? ((msbm + lsbm) / 2)
          : (mod - ((msbm + lsbm) / 2) - 1)
        ),
        0,
        step,
        e.bits
      ));
    }

    if ((e.name === undefined) || (e.type !== undefined)) {
      blanks.push(['rect', norm({
        x: step * (vflip ? lsbm : (mod - msbm - 1)),
        width: step * (msbm - lsbm + 1),
        height: height
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
  const {hspace, margin, mod, fontsize, vflip} = opt;
  const width = hspace - margin.left - margin.right - 1;
  const step = width / mod;
  const labels = ['g', tt(margin.left, -3)];
  for (let i = 0; i < mod; i++) {
    labels.push(text(
      vflip ? i : (mod - i - 1),
      step * (i + .5),
      fontsize
    ));
  }
  return labels;
};

const cage = (desc, opt) => {
  const {hspace, vspace, mod, margin, index, vflip} = opt;
  const width = hspace - margin.left - margin.right - 1;
  const height = vspace - margin.top - margin.bottom;
  const res = ['g',
    {
      stroke: 'black',
      'stroke-width': 1,
      'stroke-linecap': 'round'
    },
    hline(width, 0, 0),
    vline(height, (vflip ? width : 0), 0),
    hline(width, 0, height)
  ];

  let i = index * mod;
  const delta = vflip ? 1 : -1;
  let j = vflip ? 0 : mod;

  for (let k = 0; k < mod; k++) {
    const xj = j * (width / mod);
    if ((k === 0) || desc.some(e => (e.lsb === i))) {
      res.push(vline(height, xj, 0));
    } else {
      res.push(vline((height >>> 3), xj, 0));
      res.push(vline(-(height >>> 3), xj, height));
    }
    i++;
    j += delta;
  }
  return res;
};

const lane = (desc, opt) => {
  const {index, vspace, margin, fontsize, hflip, lanes, compact} = opt;
  const height = vspace - margin.top - margin.bottom;

  let tx = margin.left;
  const idx = hflip ? index : (lanes - index - 1);
  let ty = round(idx * vspace + margin.top);
  if (compact) {
    ty = round(idx * height + margin.top);
  }
  const res = ['g',
    tt(tx, ty),
    cage(desc, opt),
    labelArr(desc, opt)
  ];
  if (compact) {
    res.push(['g', {'text-anchor': 'end'},
      text(index, -4, round(height / 2 + fontsize / 3))
    ]);
  }
  return res;
};

// Maximum number of attributes across all fields
// const getMaxAttributes = desc =>
//   desc.reduce((prev, field) =>
//     Math.max(
//       prev,
//       (field.attr === undefined)
//         ? 0
//         : Array.isArray(field.attr)
//           ? field.attr.length
//           : 1
//     ),
//   0);

const isIntGTorDefault = opt => row => {
  const [key, min, def] = row;
  const val = Math.round(opt[key]);
  opt[key] = (typeof val === 'number' && val >= min) ? val : def;
};

const render = (desc, opt) => {
  opt = (typeof opt === 'object') ? opt : {};

  [ // key         min default
    ['vspace', 20, 60],
    ['hspace', 40, 800],
    ['lanes', 1, 1],
    ['bits', 1, 32],
    ['fontsize', 6, 14]
  ].map(isIntGTorDefault(opt));

  opt.fontfamily = opt.fontfamily || 'sans-serif';
  opt.fontweight = opt.fontweight || 'normal';
  opt.compact = opt.compact || false;
  opt.hflip = opt.hflip || false;
  opt.margin = opt.margin || {};

  const {hspace, vspace, lanes, margin, compact, fontsize, bits} = opt;

  if (margin.right === undefined) { margin.right = 4; }
  if (margin.left === undefined) {
    if (compact) {
      margin.left = 32;
    } else {
      margin.left = margin.right;
    }
  }
  if (margin.top === undefined) { margin.top = fontsize; }
  if (margin.bottom === undefined) { margin.bottom = margin.top; }

  // const maxAttributes = getMaxAttributes(desc) * fontsize;

  let width = hspace;
  let height = vspace * lanes;
  if (compact) {
    height -= (lanes - 1) * (margin.top + margin.bottom);
  }

  const res = ['g',
    tt(0.5, 0.5, {
      'text-anchor': 'middle',
      'font-size': opt.fontsize,
      'font-family': opt.fontfamily,
      'font-weight': opt.fontweight
    })
  ];

  let lsb = 0;
  const mod = bits / lanes;
  opt.mod = mod | 0;

  desc.map(e => {
    e.lsb = lsb;
    e.lsbm = lsb % mod;
    lsb += e.bits;
    e.msb = lsb - 1;
    e.msbm = e.msb % mod;
  });

  for (let i = 0; i < lanes; i++) {
    opt.index = i;
    res.push(lane(desc, opt));
  }
  if (compact) {
    res.push(compactLabels(desc, opt));
  }
  return getSVG(width, height).concat([res]);
};

module.exports = render;
