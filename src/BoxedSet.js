import BaseSet from './BaseSet.js';

const compareObject = (x, y) => {
  if (x.constructor !== y.constructor) {
    if (x.constructor == null) {
      return 1;
    }
    if (y.constructor == null) {
      return -1;
    }
    return x.constructor.name < y.constructor.name ? -1 : 1;
  }

  const xKeys = Object.keys (x);
  const yKeys = Object.keys (y);
  if (xKeys.length !== yKeys.length) {
    return xKeys.length < yKeys.length ? -1 : 1;
  }

  xKeys.sort ();
  const xKeysStr = xKeys.join (',');

  yKeys.sort ();
  const yKeysStr = yKeys.join (',');

  if (xKeysStr !== yKeysStr) {
    return xKeysStr < yKeysStr ? -1 : 1;
  }

  for (const p of xKeys) {
    const res = compare (x[p], y[p]);
    if (res === 1) {
      return 1;
    }
    if (res === -1) {
      return -1;
    }
  }

  return 0;
};

const compareArray = (x, y) => {
  if (x.length !== y.length) {
    return x.length < y.length ? -1 : 1;
  }
  let i = 0, order;
  while (i < x.length) {
    order = compare (x[i], y[i]);
    if (order !== 0) {
      return order;
    }
    i += 1;
  }
  return 0;
};

const objectType = a => (Object.prototype.toString.call (a)).slice (8, -1);

const compare = (x, y) => {
  if (x === y) return 0;
  const typeX = objectType (x);
  const typeY = objectType (y);
  if (typeX !== typeY) return typeX < typeY ? -1 : 1;
  switch (typeX) {
    case 'Number':
    case 'String':
    case 'Boolean': {
      const x_ = x.valueOf (), y_ = y.valueOf ();
      return x_ === y_ ? 0 : x_ < y_ ? -1 : 1;
    }
  }
  if (typeX === 'Array') return compareArray (x, y);
  return compareObject (x, y);
};

export default BaseSet (compare);
