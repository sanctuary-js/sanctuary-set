'use strict';

const BaseSet = require('./BaseSet');

// TODO: Propose addition of Ord to FL.
module.exports = BaseSet(function compare(x, y) {
  return x['fantasy-land/compare'](y);
});
