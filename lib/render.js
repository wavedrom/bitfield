'use strict';

const tspan = require('tspan');

// ----- ✂ ------------------------------------------------------------

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

const text = (body, x, y, rotate) => {
  const props = {y: 6};
  if (rotate !== undefined) {
    props.transform = 'rotate(' + rotate + ')';
  }
  return ['g', tt(round(x), round(y)), ['text', props].concat(tspan.parse(body))];
};

const hline = (len, x, y) => ['line', norm({x1: x, x2: x + len, y1: y, y2: y})];
const vline = (len, x, y) => ['line', norm({x1: x, x2: x, y1: y, y2: y + len})];

const getLabel = (val, x, y, step, len, rotate) => {
  if (typeof val !== 'number') {
    return text(val, x, y, rotate);
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
  const bits = ['g', tt(round(step / 2), -round(0.5 * fontsize + 4))];
  const names = ['g', tt(round(step / 2), round(0.5 * height + 0.4 * fontsize - 6))];
  const attrs = ['g', tt(round(step / 2), round(height + 0.7 * fontsize - 2))];
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
    if (e.name !== undefined) {
      names.push(getLabel(
        e.name,
        step * (vflip
          ? ((msbm + lsbm) / 2)
          : (mod - ((msbm + lsbm) / 2) - 1)
        ),
        0,
        step,
        e.bits,
        e.rotate
      ));
    }

    if ((e.name === undefined) || (e.type !== undefined)) {
      if (!(opt.compact && e.type === undefined)) {
        blanks.push(['rect', norm({
          x: step * (vflip ? lsbm : (mod - msbm - 1)),
          width: step * (msbm - lsbm + 1),
          height: height
        }, {
          style: 'fill-opacity:0.1' + typeStyle(e.type)
        })]);
      }
    }
    if (e.attr !== undefined) {
      attrs.push(getAttr(e, opt, step, lsbm, msbm));
    }
  });
  return ['g', blanks, bits, names, attrs];
};

const getLabelMask = (desc, mod) => {
  const mask = [];
  let idx = 0;
  desc.map(e => {
    mask[idx % mod] = true;
    idx += e.bits;
    mask[(idx - 1) % mod] = true;
  });
  return mask;
};

const compactLabels = (desc, opt) => {
  const {hspace, margin, mod, fontsize, vflip} = opt;
  const width = hspace - margin.left - margin.right - 1;
  const step = width / mod;
  const labels = ['g', tt(margin.left, -3)];

  const mask = getLabelMask(desc, mod);

  for (let i = 0; i < mod; i++) {
    const idx = vflip ? i : (mod - i - 1);
    if (mask[idx]) {
      labels.push(text(
        idx,
        step * (i + .5),
        0.5 * fontsize + 4
      ));
    }
  }

  return labels;
};

const skipDrawingEmptySpace = (desc, opt, laneIndex, laneLength, globalIndex) => {
  if (!opt.compact)
    return false;
  
  const isEmptyBitfield = (bitfield) => bitfield.name === undefined && bitfield.type === undefined;
  var bitfieldIndex = desc.findIndex((e) => isEmptyBitfield(e) && globalIndex >= e.lsb && globalIndex <= e.msb + 1);

  if (bitfieldIndex === -1)
    return false;

  if (globalIndex > desc[bitfieldIndex].lsb && globalIndex < desc[bitfieldIndex].msb + 1)
    return true;

  if (globalIndex == desc[bitfieldIndex].lsb && (laneIndex === 0 || bitfieldIndex > 0 && isEmptyBitfield(desc[bitfieldIndex - 1])))
    return true;
  
  if (globalIndex == desc[bitfieldIndex].msb + 1 && (laneIndex === laneLength || bitfieldIndex < desc.length - 1 && isEmptyBitfield(desc[bitfieldIndex + 1])))
    return true;
          
  return false;
}

const cage = (desc, opt) => {
  const {hspace, vspace, mod, margin, index, vflip} = opt;
  const width = hspace - margin.left - margin.right - 1;
  const height = vspace - margin.top - margin.bottom;
  const res = ['g',
    {
      stroke: 'black',
      'stroke-width': 1,
      'stroke-linecap': 'round'
    }
  ];
  const skipEdge = opt.uneven && (opt.bits % 2 === 1) && (index === (opt.lanes - 1));
  if (skipEdge) {
    if (vflip) {
      res.push(hline(width - (width / mod), 0, 0));
      res.push(hline(width - (width / mod), 0, height));
    } else {
      res.push(hline(width - (width / mod), width / mod, 0));
      res.push(hline(width - (width / mod), width / mod, height));
    }
  } else if (!opt.compact) {
    res.push(hline(width, 0, 0));
    res.push(hline(width, 0, height));
    res.push(vline(height, (vflip ? width : 0), 0));
  }

  let i = index * mod;
  const delta = vflip ? 1 : -1;
  let j = vflip ? 0 : mod;
  
  for (let k = 0; k <= mod; k++) {
    if (skipDrawingEmptySpace(desc, opt, k, mod, i)) {
      i++;
      j += delta;
      continue;
    }
    
    const xj = j * (width / mod);
    if ((k === 0) || (k === mod) || desc.some(e => (e.msb + 1 === i))) {
      res.push(vline(height, xj, 0));
    } else {
      res.push(vline((height >>> 3), xj, 0));
      res.push(vline(-(height >>> 3), xj, height));
    }

    if (opt.compact && k !== 0 && !skipDrawingEmptySpace(desc, opt, k - 1, mod, i - 1)) {
      res.push(hline(width / mod, xj, 0));
      res.push(hline(width / mod, xj, height));
    }

    i++;
    j += delta;
  }
  return res;
};

const lane = (desc, opt) => {
  const {index, vspace, hspace, margin, hflip, lanes, compact, label} = opt;
  const height = vspace - margin.top - margin.bottom;
  const width = hspace - margin.left - margin.right - 1;

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

  if (label && label.left !== undefined) {
    const lab = label.left;
    let txt = index;
    if (typeof lab === 'string') {
      txt = lab;
    } else
    if (typeof lab === 'number') {
      txt += lab;
    } else
    if (typeof lab === 'object') {
      txt = lab[index] || txt;
    }
    res.push(['g', {'text-anchor': 'end'},
      text(txt, -4, round(height / 2))
    ]);
  }

  if (label && label.right !== undefined) {
    const lab = label.right;
    let txt = index;
    if (typeof lab === 'string') {
      txt = lab;
    } else
    if (typeof lab === 'number') {
      txt += lab;
    } else
    if (typeof lab === 'object') {
      txt = lab[index] || txt;
    }
    res.push(['g', {'text-anchor': 'start'},
      text(txt, width + 4, round(height / 2))
    ]);
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

const getTotalBits = desc =>
  desc.reduce((prev, field) => prev + ((field.bits === undefined) ? 0 : field.bits), 0);

const isIntGTorDefault = opt => row => {
  const [key, min, def] = row;
  const val = Math.round(opt[key]);
  opt[key] = (typeof val === 'number' && val >= min) ? val : def;
};

const render = (desc, opt) => {
  opt = (typeof opt === 'object') ? opt : {};


  [ // key         min default
    // ['vspace', 20, 60],
    ['hspace', 40, 800],
    ['lanes', 1, 1],
    ['bits', 1, undefined],
    ['fontsize', 6, 14]
  ].map(isIntGTorDefault(opt));
  const maxAttributes = getMaxAttributes(desc);

  opt.vspace = opt.vspace || ((maxAttributes + 4) * opt.fontsize);

  opt.fontfamily = opt.fontfamily || 'sans-serif';
  opt.fontweight = opt.fontweight || 'normal';
  opt.compact = opt.compact || false;
  opt.hflip = opt.hflip || false;
  opt.uneven = opt.uneven || false;
  opt.margin = opt.margin || {};

  if (opt.bits === undefined) {
    opt.bits = getTotalBits(desc);
  }

  const {hspace, vspace, lanes, margin, compact, fontsize, bits, label} = opt;

  if (margin.right === undefined) {
    if (label && label.right !== undefined) {
      margin.right = round(.1 * hspace);
    } else {
      margin.right = 4;
    }
  }

  if (margin.left === undefined) {
    if (label && label.left !== undefined) {
      margin.left = round(.1 * hspace);
    } else {
      margin.left = 4; // margin.right;
    }
  }
  if (margin.top === undefined) {
    margin.top = 1.5 * fontsize;
    if (margin.bottom === undefined) {
      margin.bottom = fontsize * (maxAttributes) + 4;
    }
  } else {
    if (margin.bottom === undefined) {
      margin.bottom = 4;
    }
  }

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
  const mod = Math.ceil(bits * 1.0 / lanes);
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

// ----- ✂ ------------------------------------------------------------

module.exports = render;
