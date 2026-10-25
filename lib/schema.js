'use strict';

// JSON Schema (draft-07) of the bit-field input: {reg: [...], config: {...}}
// Used by wavedrom-schema https://github.com/wavedrom/schema
// Keep in sync with render.js

const ref = name => ({$ref: '#/definitions/' + name});

const label = {
  description: 'Text (string / JsonML). A number is rendered as its binary value, one bit per bit cell.',
  $ref: '#/definitions/textSpan'
};

const laneLabel = side => ({
  description: 'Lane labels on the ' + side + ' side: string - same label on every lane; number N - lane index + N; array - label per lane (index 0 = LSB lane)',
  oneOf: [
    {type: 'string'},
    {type: 'number'},
    {type: 'array', items: label}
  ]
});

// text definitions (tspan): shared with wavedrom-schema
const jsonml = {
  type: 'array',
  title: 'JsonML',
  description: 'JsonML (SVG) markup: ["tag", {attributes}, ...children], e.g. ["tspan", {"class": "h1"}, "Title"]. Usual tag is "tspan"; children are strings, numbers or nested JsonML nodes.',
  minItems: 1,
  items: {
    description: 'First item: SVG tag name (usually "tspan"); then optional attributes object; then children',
    anyOf: [
      {type: 'string', description: 'Tag name (first item) or text'},
      {type: 'number'},
      {
        type: 'object',
        description: 'SVG attributes, e.g. {"class": "h3"}, {"fill": "red"}, {"font-weight": "bold"}, {"dy": "-5"}. Theme classes: h1..h6, muted, info, success, warning, error',
        additionalProperties: {
          oneOf: [
            {type: 'string'},
            {type: 'number'}
          ]
        }
      },
      ref('jsonml')
    ]
  }
};

const textSpan = {
  description: 'Text: plain string with optional inline markup <b> <i> <o> (overline) <ins> (underline) <s> (strike) <sub> <sup> <tt> (monospace), e.g. "CS<sub>n</sub>", "<o>RST</o>"; or a number; or JsonML (SVG tspan) markup, e.g. ["tspan", {"class": "h1"}, "Title"]',
  oneOf: [
    {type: 'string'},
    {type: 'number'},
    ref('jsonml')
  ]
};

module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'register',
  description: 'WaveDrom bit-field (register) diagram\nhttps://github.com/wavedrom/bitfield',
  required: ['reg'],
  properties: {
    reg: {
      type: 'array',
      description: 'List of bit fields, starting from LSB (bit 0). Sum of "bits" defines the register width unless config.bits is set.',
      items: {
        type: 'object',
        required: ['bits'],
        properties: {
          bits: {
            type: 'integer',
            minimum: 1,
            description: 'Field width in bits'
          },
          name: {
            description: 'Field name. String / JsonML is rendered centered; a number is rendered as binary value across the field bits (e.g. opcode 0x37). Field without name and type is drawn as reserved (shaded).',
            $ref: '#/definitions/textSpan'
          },
          attr: {
            description: 'Field attribute(s), rendered below the field, one row per array item. Number is rendered as binary. null items are skipped.',
            oneOf: [
              {type: 'string'},
              {type: 'number'},
              {
                type: 'array',
                items: {
                  oneOf: [
                    {type: 'string'},
                    {type: 'number'},
                    {type: 'null'},
                    ref('jsonml')
                  ]
                }
              }
            ]
          },
          type: {
            type: 'integer',
            minimum: 0,
            description: 'Field color type: 2 red, 3 lime, 4 cyan, 5 amber, 6 green, 7 blue; other values - gray shade. Used as key for config.legend.'
          },
          rotate: {
            type: 'number',
            description: 'Rotation angle of the field name (degrees), e.g. -90 for narrow fields'
          },
          rect: {
            type: 'object',
            description: 'Extra SVG attributes for the field background <rect>, e.g. {"style": "fill:#ff0;fill-opacity:0.3"}'
          }
        }
      }
    },
    config: {
      type: 'object',
      description: 'Rendering options',
      properties: {
        hspace: {type: 'integer', minimum: 40, description: 'Diagram width (px)', default: 800},
        vspace: {type: 'number', exclusiveMinimum: 0, description: 'Lane height (px). Default: (max number of attr rows + 4) * fontsize'},
        lanes: {type: 'integer', minimum: 1, description: 'Number of lanes (rows) the register is split into', default: 1},
        bits: {type: 'integer', minimum: 1, description: 'Overall bit width (default: sum of field bits)'},
        fontsize: {type: 'integer', minimum: 6, description: 'Font size (px)', default: 14},
        fontfamily: {type: 'string', description: 'Font family', default: 'sans-serif'},
        fontweight: {type: 'string', description: 'Font weight', default: 'normal'},
        compact: {type: 'boolean', description: 'Compact format: lanes stacked without gaps, bit numbers shown once on top', default: false},
        hflip: {type: 'boolean', description: 'Horizontal flip: LSB lane on top', default: false},
        vflip: {type: 'boolean', description: 'Vertical flip: bit 0 on the left', default: false},
        sparse: {type: 'boolean', description: 'Sparse cage: draw tick marks only at field boundaries', default: false},
        uneven: {type: 'boolean', description: 'Uneven lanes: with odd bit width the last lane is one bit shorter (used with sparse)', default: false},
        trim: {type: 'number', exclusiveMinimum: 0, description: 'Trim long field names to fit the field ("..."); value is the estimated character width (px), e.g. 8'},
        offset: {type: 'integer', description: 'Offset added to the bit index labels', default: 0},
        legend: {
          type: 'object',
          description: 'Color legend above the diagram: {"label": type}, e.g. {"Control": 2, "Status": 4}',
          additionalProperties: {type: 'integer', minimum: 0}
        },
        margin: {
          type: 'object',
          description: 'Margins around the diagram (px). Defaults depend on fontsize, attr rows and labels.',
          properties: {
            top: {type: 'number', description: 'Top margin'},
            right: {type: 'number', description: 'Right margin'},
            bottom: {type: 'number', description: 'Bottom margin'},
            left: {type: 'number', description: 'Left margin'}
          }
        },
        label: {
          type: 'object',
          description: 'Lane labels on the left / right side (margins grow to 10% of hspace)',
          properties: {
            left: laneLabel('left'),
            right: laneLabel('right')
          }
        }
      }
    }
  },
  definitions: {
    textSpan: textSpan,
    jsonml: jsonml
  }
};
