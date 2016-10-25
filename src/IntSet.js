'use strict';

/**
 * A set specialised to 32bit integer values. The implementation is based on
 * "Fast Mergeable Integer Maps" -- http://ittc.ku.edu/~andygill/papers/IntMap98.pdf
 * and https://hackage.haskell.org/package/containers/docs/Data-IntSet.html
 */

const
  BinType = 0,
  TipType = 1,
  NilType = 2;

// contains left/right subtrees
function Bin(prefix, mask, left, right) {
  return {
    type: BinType,
    prefix: prefix | 0, // the common bitwise prefix of the elements of the left/right subtrees
    mask: mask | 0,     // the position of the highest bit that differs between subtrees
    left: left,         // the subtree whose prefix has `0` for the mask field
    right: right        // the subtree whose prefix has `1` for the mask field
  };
}

// smart constructor to ensure left/right is never Nil
function bin(prefix, mask, left, right) {
  if (right.type === NilType) return left;
  if (left.type === NilType) return right;
  return Bin(prefix, mask, left, right);
}

// contains a up to 32 values using a bitmap and common prefix
function Tip(prefix, bitmap) {
  return {
    type: TipType,
    prefix: prefix | 0,  // the common prefix shared by all values in the bitmap
    bitmap: bitmap >>> 0 // determines stored values by their bitwise position
  };
}

// smart constructor to ensure tip never contains a bitmap of 0
function tip(prefix, bitmap) {
  return bitmap === 0 ? Nil : Tip(prefix, bitmap);
}

// an empty set
const Nil = {type: NilType};

// the number of elements in the set
function size(set) {
  switch (set.type) {
    case BinType: return size(set.left) + size(set.right);
    case TipType: return bitcount(set.bitmap);
    case NilType: return 0;
  }
}

// the number of bits set in the given integer
function bitcount(_x) {
  let a = 0;
  let x = _x;
  while (true) {
    if (x === 0) return a;
    a += 1;
    x &= x - 1;
  }
}

// returns a prefix of an int using the given mask bit
function mask(i, m) {
  return (i & (~(m - 1) ^ m)) | 0;
}

// returns true if the given integer `i` masked by integer `m` equals 0
function zero(i, m) {
  return (i & m) === 0;
}

// returns true if the mask of the given int does _not_ match the given prefix
function nomatch(i, p, m) {
  return mask(i, m) !== p;
}

// prefix of a value with the size of an int zeroed out at the lower end
function prefixOf(x) {
  return x & ~31;
}

// the bitmap position for a given 32 bit int
function bitmapOf(x) {
  return 1 << (x & 31);
}

// returns true if the given int exists in the set
function contains(x, _set) {
  let set = _set;

  while (true) {
    switch (set.type) {
      case BinType:
        if (nomatch(x, set.prefix, set.mask)) return false;
        if (zero(x, set.mask)) {
          set = set.left;
          continue;
        }
        set = set.right;
        break;
      case TipType:
        return prefixOf(x) === set.prefix && (bitmapOf(x) & set.bitmap) !== 0;
      default:
        return false;
    }
  }
}

// uint comparison
function shorter(m1, m2) {
  return (m1 >>> 0) > (m2 >>> 0);
}

// the highest bit value of `p1 xor p2`
function branchMask(p1, p2) {
  let v = p1 ^ p2;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  v ^= v >>> 1;
  return v | 0;
}

// join two subtrees, with their respective prefixes
function link(p1, t1, p2, t2) {
  const m = branchMask(p1, p2);
  const p = mask(p1, m);
  return zero(p1, m) ? Bin(p, m, t1, t2) : Bin(p, m, t2, t1);
}

// adds the given int to the set
function insert(x, set) {
  return insertBM(prefixOf(x), bitmapOf(x), set);
}

// inserts the prefix and bitmap into the given set
function insertBM(prefix, bitmap, set) {
  switch (set.type) {
    case BinType:
      if (nomatch(prefix, set.prefix, set.mask)) {
        return link(prefix, Tip(prefix, bitmap), set.prefix, set);
      }

      if (zero(prefix, set.mask)) {
        return Bin(set.prefix, set.mask, insertBM(prefix, bitmap, set.left), set.right);
      }

      return Bin(set.prefix, set.mask, set.left, insertBM(prefix, bitmap, set.right));

    case TipType:
      if (prefix === set.prefix) {
        return Tip(prefix, bitmap | set.bitmap);
      }

      return link(prefix, Tip(prefix, bitmap), set.prefix, set);

    default:
      return Tip(prefix, bitmap);
  }
}

// removes the given int from the set
function remove(x, set) {
  return removeBM(prefixOf(x), bitmapOf(x), set);
}

// removes the prefix and bitmap from the given set
function removeBM(prefix, bitmap, set) {
  switch (set.type) {
    case BinType:
      if (nomatch(prefix, set.prefix, set.mask)) {
        return set;
      }
      if (zero(prefix, set.mask)) {
        return bin(set.prefix, set.mask, removeBM(prefix, bitmap, set.left), set.right);
      }
      return bin(set.prefix, set.mask, set.left, removeBM(prefix, bitmap, set.right));

    case TipType:
      return set.prefix === prefix ? tip(prefix, set.bitmap & ~bitmap) : set;

    default:
      return Nil;
  }
}

// returns a set containing the union of the two given sets
function union(set1, set2) {
  switch (set1.type) {
    case BinType:
      switch (set2.type) {
        case BinType:
          if (shorter(set1.mask, set2.mask)) {
            if (nomatch(set2.prefix, set1.prefix, set1.mask)) {
              return link(set1.prefix, set1, set2.prefix, set2);
            }
            if (zero(set2.prefix, set1.mask)) {
              return Bin(set1.prefix, set1.mask, union(set1.left, set2), set1.right);
            }
            return Bin(set1.prefix, set1.mask, set1.left, union(set1.right, set2));
          } else if (shorter(set2.mask, set1.mask)) {
            if (nomatch(set1.prefix, set2.prefix, set2.mask)) {
              return link(set1.prefix, set1, set2.prefix, set2);
            }
            if (zero(set1.prefix, set2.mask)) {
              return Bin(set2.prefix, set2.mask, union(set1, set2.left), set2.right);
            }
            return Bin(set2.prefix, set2.mask, set2.left, union(set1, set2.right));
          } else if (set1.prefix === set2.prefix) {
            return Bin(set1.prefix, set1.mask, union(set1.left, set2.left), union(set1.right, set2.right));
          } else {
            return link(set1.prefix, set1, set2.prefix, set2);
          }

        case TipType:
          return insertBM(set2.prefix, set2.bitmap, set1);

        default:
          return set1;
      }

    case TipType:
      return insertBM(set1.prefix, set1.bitmap, set2);

    default:
      return set2;
  }
}

// returns a set containing all elements from `set1` that do not exist in `set2`
function difference(set1, _set2) {
  let set2 = _set2;

  switch (set1.type) {
    case BinType:
      switch (set2.type) {
        case BinType:
          if (shorter(set1.mask, set2.mask)) {
            if (nomatch(set2.prefix, set1.prefix, set1.mask)) {
              return set1;
            }
            if (zero(set2.prefix, set1.mask)) {
              return bin(set1.prefix, set1.mask, difference(set1.left, set2), set1.right);
            }
            return bin(set1.prefix, set1.mask, set1.left, difference(set1.right, set2));
          } else if (shorter(set2.mask, set1.mask)) {
            if (nomatch(set1.prefix, set2.prefix, set2.mask)) {
              return set1;
            }
            if (zero(set1.prefix, set2.mask)) {
              return difference(set1, set2.left);
            }
            return difference(set1, set2.right);
          } else if (set1.prefix === set2.prefix) {
            return bin(set1.prefix, set1.mask, difference(set1.left, set2.left), difference(set1.right, set2.right));
          } else {
            return set1;
          }

        case TipType:
          return removeBM(set2.prefix, set2.bitmap, set1);

        default:
          return set1;
      }

    case TipType:
      while (true) {
        switch (set2.type) {
          case BinType:
            if (nomatch(set1.prefix, set2.prefix, set2.mask)) return set1;
            if (zero(set1.prefix, set2.mask)) {
              set2 = set2.left;
              continue;
            }
            set2 = set2.right;
            continue;

          case TipType:
            return set1.prefix === set2.prefix ? tip(set1.prefix, set1.bitmap & ~set2.bitmap) : set1;

          default:
            return set1;
        }
      }

    default:
      return Nil;
  }
}

// returns a set containing the intersection of the two given sets
function intersect(_set1, _set2) {
  let set1 = _set1;
  let set2 = _set2;

  switch (set1.type) {
    case BinType:
      switch (set2.type) {
        case BinType:
          if (shorter(set1.mask, set2.mask)) {
            if (nomatch(set2.prefix, set1.prefix, set1.mask)) return Nil;
            if (zero(set2.prefix, set1.mask)) return intersect(set1.left, set2);
            return intersect(set1.right, set2);
          } else if (shorter(set2.mask, set1.mask)) {
            if (nomatch(set1.prefix, set2.prefix, set2.mask)) return Nil;
            if (zero(set1.prefix, set2.mask)) return intersect(set1, set2.left);
            return intersect(set1, set2.right);
          } else if (set1.prefix === set2.prefix) {
            return bin(set1.prefix, set1.mask, intersect(set1.left, set2.left), intersect(set1.right, set2.right));
          } else {
            return Nil;
          }

        case TipType:
          while (true) {
            switch (set1.type) {
              case BinType:
                if (nomatch(set2.prefix, set1.prefix, set1.mask)) return Nil;
                if (zero(set2.prefix, set1.mask)) {
                  set1 = set1.left;
                  continue;
                }
                set1 = set1.right;
                continue;

              case TipType:
                return set1.prefix === set2.prefix ? tip(set1.prefix, set1.bitmap & set2.bitmap) : Nil;

              // I don't believe it is possible to ever reach here but
              // it is better than the alternative of an infinite loop
              default:
                return Nil;
            }
          }

        default:
          return Nil;
      }

    case TipType:
      while (true) {
        switch (set2.type) {
          case BinType:
            if (nomatch(set1.prefix, set2.prefix, set2.mask)) return Nil;
            if (zero(set1.prefix, set2.mask)) {
              set2 = set2.left;
              continue;
            }
            set2 = set2.right;
            continue;

          case TipType:
            return set1.prefix === set2.prefix ? tip(set1.prefix, set1.bitmap & set2.bitmap) : Nil;

          default:
            return Nil;
        }
      }

    default:
      return Nil;
  }
}

// returns the empty set
function empty() {
  return Nil;
}

// returns a singleton set containing the given value
function of(x) {
  return Tip(prefixOf(x), bitmapOf(x));
}

// returns a set containing all values from the given Foldable instance
function fromFoldable(f) {
  return f.reduce(function fromFoldableF(t, k) {
    return insert(k, t);
  }, Nil);
}

// returns the lowest bit set for the given int
function lowestBitSet(_n) {
  let n = _n;
  let b = 0;
  if ((n & 0xFFFF) === 0) {
    n >>>= 16;
    b = 16;
  }
  if ((n & 0xFF) === 0) {
    n >>>= 8;
    b += 8;
  }
  if ((n & 0xF) === 0) {
    n >>>= 4;
    b += 4;
  }
  if ((n & 3) === 0) {
    n >>>= 2;
    b += 2;
  }
  if ((n & 1) === 0) {
    b += 1;
  }
  return b;
}

// reduces over a prefix and bitmap using the given accumulating function and initial value
function reduceBits(prefix, f, _acc, bm) {
  let acc = _acc;
  const lb = lowestBitSet(bm);
  let bi = prefix + lb;
  let n = bm >>> lb;
  while (true) {
    if (n === 0) return acc;
    if ((n & 1) === 1) {
      acc = f(acc, bi);
    }
    bi += 1;
    n >>>= 1;
  }
}

// reduces over the set using the given accumulating function and initial value
function reduce(f, z, set) {
  function go(z_, set_) {
    switch (set_.type) {
      case BinType:
        return go(go(z_, set_.left), set_.right);
      case TipType:
        return reduceBits(set_.prefix, f, z_, set_.bitmap);
      default:
        return z_;
    }
  }
  switch (set.type) {
    case BinType:
      return set.mask < 0 ? go(go(z, set.right), set.left) : go(go(z, set.left), set.right);

    default:
      return go(z, set);
  }
}

// returns an array of all values in the set
function toArray(t) {
  return reduce(function toArrayF(arr, k) {
    arr.push(k);
    return arr;
  }, [], t);
}

// returns true if both sets are equal
function equals(set1, set2) {
  switch (set1.type) {
    case BinType:
      return set2.type === BinType && set1.mask === set2.mask && set1.prefix === set2.prefix &&
        equals(set1.left, set2.left) && equals(set1.right, set2.right);
    case TipType:
      return set2.type === TipType && set1.prefix === set2.prefix && set1.bitmap === set2.bitmap;
    default:
      return set2.type === NilType;
  }
}

module.exports = {
  'fantasy-land/empty': empty,
  'fantasy-land/of': of,
  contains,
  difference,
  empty,
  equals,
  fromFoldable,
  insert,
  intersect,
  of,
  reduce,
  remove,
  size,
  toArray,
  union
};
