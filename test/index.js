import jsv from 'jsverify';
import spec from './spec/index.js';

import PrimSet from '../src/PrimSet.js';
import BoxedSet from '../src/BoxedSet.js';
import IntSet from '../src/IntSet.js';


describe ('PrimSet', () => {
  spec (PrimSet, jsv.number);
  spec (PrimSet, jsv.string);
  spec (PrimSet, jsv.bool);
});

describe ('BoxedSet', () => {
  function Thing(x) {
    this.x = x;
  }
  const ArbThing = jsv.number.smap (n => new Thing (n), thing => thing.x);
  it ('Homogeneous', () => {
    spec (BoxedSet, jsv.number);
    spec (BoxedSet, jsv.string);
    spec (BoxedSet, jsv.bool);
    spec (BoxedSet, jsv.dict (jsv.number));
    spec (BoxedSet, jsv.array (jsv.number));
    spec (BoxedSet, ArbThing);
  });
  it ('Heterogeneous', () => {
    spec (BoxedSet, jsv.oneof (jsv.constant (Object.create (null)), ArbThing, jsv.json));
  });
});

describe ('IntSet', () => {
  spec (IntSet, jsv.int32);
});
