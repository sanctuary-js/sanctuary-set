'use strict';

const BaseSet = require ('./BaseSet');

//  TODO: Propose addition of Ord to FL.
module.exports = BaseSet ((x, y) => x['fantasy-land/compare'] (y));
