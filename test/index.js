const jsv = require('jsverify');
const spec = require('./spec');

const PrimSet  = require('../src/PrimSet');
const BoxedSet = require('../src/BoxedSet');
const IntSet   = require('../src/IntSet');


describe('PrimSet', () => {
  spec(PrimSet, jsv.number);
  spec(PrimSet, jsv.string);
  spec(PrimSet, jsv.bool);
});

describe('BoxedSet', () => {
  describe('Homogeneous', () => {
    spec(BoxedSet, jsv.number);
    spec(BoxedSet, jsv.string);
    spec(BoxedSet, jsv.bool);
    spec(BoxedSet, jsv.dict(jsv.number));
    spec(BoxedSet, jsv.array(jsv.number));
  });
  describe('Heterogeneous', () => {
    spec(BoxedSet, jsv.json);
  });
});

describe('IntSet', () => {
  spec(IntSet, jsv.int32);
});
