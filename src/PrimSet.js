import BaseSet from './BaseSet.js';

export default BaseSet ((x, y) => {
  if (x === y) return 0;
  return x < y ? -1 : 1;
});
