'use strict';

const BaseSet = require ('./BaseSet');

module.exports = BaseSet ((x, y) => {
  if (x === y) return 0;
  return x < y ? -1 : 1;
});
