/**
 * AVL tree implementation of "Parallel Ordered Sets Using Join"
 * -- https://arxiv.org/abs/1602.02120
 */
module.exports = function Set(compare) {

  const Leaf = { height: 0, size: 0 };

  function Node(l, k, r) {
    return {
      l: l,
      k: k,
      r: r,
      height: 1 + Math.max(l.height, r.height),
      size: 1 + l.size + r.size
    };
  }

  // given L < k < R, this will return the concatenation of L, k and R.
  function join(l, k, r) {
    if (l.height > 1 + r.height) {
      // insert in R
      return joinRight(l, k, r);
    } else if (r.height > 1 + l.height) {
      // insert in L
      return joinLeft(l, k, r);
    } else {
      // no re-balance required
      return Node(l, k, r);
    }
  }

  // follow the left spine of R until a node (rl) is found
  // with a height <= the height of L
  function joinLeft(l, k, r) {
    const rl = r.l, rk = r.k, rr = r.r;
    if (rl.height <= l.height + 1) {
      // a new node is created to replace the previous rl
      const t = Node(l, k, rl);
      if (t.height <= rr.height + 1) {
        // already balanced, return the new node
        return Node(t, rk, rr);
      } else {
        // a double rotation necessary to re-balance
        return rotateRightLeft(t, rk, rr);
      }
    } else {
      const t  = joinLeft(l, k, rl);
      const t_ = Node(t, rk, rr);
      if (t.height <= rr.height + 1) {
        return t_;
      } else {
        return rotateRight(t_);
      }
    }
  }

  // follow the right spine of L until a node (lr) is found
  // with a height <= the height of R
  function joinRight({l: ll, k: lk, r: lr}, k, r) {
    if (lr.height <= r.height + 1) {
      // a new node is created to replace the previous lr
      const t = Node(lr, k, r);
      if (t.height <= ll.height + 1) {
        // already balanced, return the new node
        return Node(ll, lk, t);
      } else {
        // a double rotation necessary to re-balance
        return rotateLeftRight(ll, lk, t);
      }
    } else {
      const t  = joinRight(lr, k, r);
      const t_ = Node(ll, lk, t);
      if (t.height <= ll.height + 1) {
        return t_;
      } else {
        return rotateLeft(t_);
      }
    }
  }

  /**
   *   2            4
   *  / \          / \
   * 1   4   =>   2   5
   *    / \      / \
   *   3   5    1   3
   */
  function rotateLeft(t) {
    return Node(Node(t.l, t.k, t.r.l), t.r.k, t.r.r);
  }

  /**
   *     4          2
   *    / \        / \
   *   2   5  =>  1   4
   *  / \            / \
   * 1   3          3   5
   */
  function rotateRight(t) {
    return Node(t.l.l, t.l.k, Node(t.l.r, t.k, t.r));
  }

  /**
   * 1
   *  \       2
   *   3 =>  / \
   *  /     1   3
   * 2
   *
   * equiv: rotateLeft(Node(l, k, rotateRight(r)))
   */
  function rotateLeftRight(l, k, r) {
    return Node(Node(l, k, r.l.l), r.l.k, Node(r.l.r, r.k, r.r));
  }

  /**
   *   3
   *  /      2
   * 1  =>  / \  (RL Rotation)
   *  \    1   3
   *   2
   *
   * equiv: rotateRight(Node(rotateLeft(l), k, r))
   */
  function rotateRightLeft(l, k, r) {
    return Node(Node(l.l, l.k, l.r.l), l.r.k, Node(l.r.r, k, r));
  }

  // partitions a tree using the given key, returning
  // an object containing the tree to the left and right
  // of the key and a boolean `matched` property indicating
  // whether the key existed in the given tree.
  function split(k, t) {
    if (t === Leaf) {
      return {l: t, r: t, match: false};
    } else {
      const order = compare(k, t.k);
      if (order === 0) {
        return {l: t.l, r: t.r, match: true};
      } else if (order < 0) {
        const {l, r, match} = split(k, t.l);
        return {l, r: join(r, t.k, t.r), match};
      } else {
        const {l, r, match} = split(k, t.r);
        return {l: join(t.l, t.k, l), r, match};
      }
    }
  }

  // returns the right-most key of the given set along
  // with the subtree to the left of the right-most key
  function splitLast(t) {
    if (t.r === Leaf) {
      return {l: t.l, k: t.k};
    } else {
      const s = splitLast(t.r);
      return {l: join(t.l, t.k, s.l), k: s.k};
    }
  }

  // concatenates two sets
  function join2(tl, tr) {
    if (tl === Leaf) {
      return tr;
    } else {
      const s = splitLast(tl);
      return join(s.l, s.k, tr);
    }
  }

  // insert a key into the set
  function insert(k, t) {
    const s = split(k, t);
    return join(s.l, k, s.r);
  }

  // remove a key from the set
  function remove(k, t) {
    const s = split(k, t);
    return join2(s.l, s.r);
  }

  // the union of two sets
  function union(t1, t2) {
    if (t1 === Leaf) {
      // t1 is a Leaf
      return t2;
    } else if (t2 === Leaf) {
      // t2 is a Leaf
      return t1;
    } else {
      const t_ = split(t2.k, t1);
      const tl = union(t_.l, t2.l); // ---- damn single-threaded JS
      const tr = union(t_.r, t2.r); // _/
      return join(tl, t2.k, tr);
    }
  }

  // the intersection of two sets
  function intersect(t1, t2) {
    if (t1 === Leaf) {
      // t1 is a Leaf
      return t1;
    } else if (t2 === Leaf) {
      // t2 is a Leaf
      return t2;
    } else {
      const t_ = split(t2.k, t1);
      const tl = intersect(t_.l, t2.l); // ---- damn single-threaded JS
      const tr = intersect(t_.r, t2.r); // _/
      return t_.match ? join(tl, t2.k, tr) : join2(tl, tr);
    }
  }

  // the difference of two sets (all keys in t1 that aren't members of t2)
  function difference(t1, t2) {
    if (t1 === Leaf || t2 === Leaf) {
      return t1;
    } else {
      const t_ = split(t2.k, t1);
      const tl = difference(t_.l, t2.l); // ---- damn single-threaded JS
      const tr = difference(t_.r, t2.r); // _/
      return join2(tl, tr);
    }
  }

  /**
   * It would be nice to just reuse `split(k, t).match` here
   * but it turns out to be quite a bit slower than the direct
   * traverse and compare as implemented here.
   */
  function contains(k, t) {
    var c;
    while (t.height > 0) {
      c = compare(k, t.k);
      if (c === 0) {
        return true;
      } else if (c < 0) {
        t = t.l;
      } else {
        t = t.r;
      }
    }
    return false;
  }

  // fold over a set
  function reduce(f, z, t) {
    if (t === Leaf) {
      return z;
    } else {
      return reduce(f, f(reduce(f, z, t.l), t.k), t.r);
    }
  }

  // takes a FL foldable instance and converts it to a set
  function fromFoldable(f) {
    return f.reduce(function fromFoldableF(t, k) {
      return insert(k, t);
    }, Leaf);
  }

  // convert a set to an array
  function toArray(t) {
    return reduce(function toArrayF(arr, k) {
      arr.push(k);
      return arr;
    }, [], t);
  }

  function equals(xs, ys) {
    return xs.size === ys.size && reduce(function (b, x) {
        return b && contains(x, ys);
      }, true, xs);
  }

  function empty() {
    return Leaf;
  }

  function of(x) {
    return Node(Leaf, x, Leaf);
  }

  return {
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
    toArray,
    union
  };
};
