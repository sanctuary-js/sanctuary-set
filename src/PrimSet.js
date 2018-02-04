'use strict';

var BaseSet = require('./BaseSet');

module.exports = BaseSet(function compare(x, y) {
  if (x === y) return 0;
  return x < y ? -1 : 1;
});
