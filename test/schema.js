'use strict';

const Ajv = require('ajv');
const {expect} = require('chai');

const schema = require('../lib/schema.js');

/* eslint-env mocha */

const good = {
  alpha: {reg: require('./alpha.json')},
  rv32iAlu: {reg: require('./rv32i-alu.json')},
  opivi: {
    reg: [
      {bits: 7, name: 0x37, attr: ['OPIVI']},
      {bits: 5, name: 'vd', type: 2},
      {bits: 3, name: 3},
      {bits: 5, name: 'simm5', type: 5}
    ]
  },
  attrRows: {
    reg: [
      {bits: 7, name: 0x07, attr: ['VLxU,VLE zero-extended', 'VLxU sign-extended']},
      {bits: 5, name: 'lumop', attr: [0, 16, null, 16]},
      {bits: 3, name: ['tspan', {class: 'h3'}, 'nf'], attr: [['tspan', 'x<sub>1</sub>']]}
    ]
  },
  config: {
    reg: [
      {bits: 8, name: 'ctrl', type: 2, rect: {style: 'fill:#ff0'}, rotate: -90},
      {bits: 8, name: 'stat', type: 4}
    ],
    config: {
      hspace: 800, vspace: 60, lanes: 2, bits: 16, fontsize: 12, fontfamily: 'monospace', fontweight: 'bold',
      compact: true, hflip: true, vflip: true, sparse: true, uneven: true,
      offset: 16, trim: 8, legend: {Control: 2, Status: 4},
      label: {left: 'R', right: ['lo', 'hi']},
      margin: {top: 10, right: 4, bottom: 10, left: 4}
    }
  }
};

const bad = {
  missing: {},
  notArray: {reg: {bits: 1}},
  noBits: {reg: [{name: 'x'}]},
  zeroBits: {reg: [{bits: 0}]},
  type: {reg: [{bits: 1, type: 'x'}]},
  attr: {reg: [{bits: 1, attr: {a: 1}}]},
  hspace: {reg: [{bits: 1}], config: {hspace: 10}},
  fontsize: {reg: [{bits: 1}], config: {fontsize: 2}},
  legend: {reg: [{bits: 1}], config: {legend: {a: 'red'}}},
  label: {reg: [{bits: 1}], config: {label: {left: true}}}
};

describe('schema', () => {
  const validate = new Ajv({strict: true}).compile(schema);
  const check = (data, expected) => {
    const res = validate(data);
    expect(res, JSON.stringify(validate.errors)).to.equal(expected);
  };
  Object.keys(good).forEach(key => it(key, () => check(good[key], true)));
  Object.keys(bad).forEach(key => it('negative ' + key, () => check(bad[key], false)));
});
