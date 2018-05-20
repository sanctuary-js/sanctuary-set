'use strict';

const jsv = require ('jsverify');
const spec = require ('./spec');

const PrimSet  = require ('../src/PrimSet');
const BoxedSet = require ('../src/BoxedSet');
const IntSet   = require ('../src/IntSet');


test ('PrimSet', () => {
  spec (PrimSet, jsv.number);
  spec (PrimSet, jsv.string);
  spec (PrimSet, jsv.bool);
});

test ('BoxedSet', () => {
  function Thing(x) {
    this.x = x;
  }
  const ArbThing = jsv.number.smap (n => new Thing (n), thing => thing.x);
  test ('Homogeneous', () => {
    spec (BoxedSet, jsv.number);
    spec (BoxedSet, jsv.string);
    spec (BoxedSet, jsv.bool);
    spec (BoxedSet, jsv.dict (jsv.number));
    spec (BoxedSet, jsv.array (jsv.number));
    spec (BoxedSet, ArbThing);
  });
  test ('Heterogeneous', () => {
    spec (BoxedSet, jsv.oneof (jsv.constant (Object.create (null)), ArbThing, jsv.json));
  });
});

test ('IntSet', () => {
  spec (IntSet, jsv.int32);
});
