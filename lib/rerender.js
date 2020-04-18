'use strict';

function rerender (React) {
  const $ = React.createElement;

  return function BitField () {
    return $('g', {});
  };
}

module.exports = rerender;
