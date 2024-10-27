import test from 'oletus';

globalThis.it = test;

import jsv from 'jsverify';

export default (Set, Arb) => {

  const SetArb = (jsv.array (Arb)).smap (
    Set.fromFoldable,
    Set.toArray,
    set => 'Set { ' + ((Set.toArray (set)).map (Arb.show)).join (', ') + ' }'
  );

  // Set.union
  jsv.property ('A ∪ B = B ∪ A', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.union (xs, ys),
    Set.union (ys, xs)
  ));

  jsv.property ('A ∪ A = A', SetArb, xs => Set.equals (
    Set.union (xs, xs),
    xs
  ));

  jsv.property ('A ∪ ∅ = A', SetArb, xs => Set.equals (
    Set.union (xs, Set.empty ()),
    xs
  ));

  jsv.property ('A ∪ (B ∪ C) = (A ∪ B) ∪ C', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.union (xs, Set.union (ys, zs)),
    Set.union (Set.union (xs, ys), zs)
  ));

  // Set.difference
  jsv.property ('A - A = ∅', SetArb, xs => Set.equals (
    Set.difference (xs, xs),
    Set.empty ()
  ));

  jsv.property ('A - ∅ = A', SetArb, xs => Set.equals (
    Set.difference (xs, Set.empty ()),
    xs
  ));

  jsv.property ('∅ - A = ∅', SetArb, xs => Set.equals (
    Set.difference (Set.empty (), xs),
    Set.empty ()
  ));

  jsv.property ('A - (B - A) = A', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.difference (xs, Set.difference (ys, xs)),
    xs
  ));

  // Set.intersect
  jsv.property ('A ∩ B = B ∩ A', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.intersect (xs, ys),
    Set.intersect (ys, xs)
  ));

  jsv.property ('A ∩ A = A', SetArb, xs => Set.equals (
    Set.intersect (xs, xs),
    xs
  ));

  jsv.property ('A ∩ ∅ = ∅', SetArb, xs => Set.equals (
    Set.intersect (xs, Set.empty ()),
    Set.empty ()
  ));

  jsv.property ('A ∩ (B ∩ C) = (A ∩ B) ∩ C', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.intersect (xs, Set.intersect (ys, zs)),
    Set.intersect (Set.intersect (xs, ys), zs)
  ));

  // Various other properties (there may be some redundant tests here)
  jsv.property ('A ∩ (B - C) = B ∩ (A - C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.intersect (xs, Set.difference (ys, zs)),
    Set.intersect (ys, Set.difference (xs, zs))
  ));

  jsv.property ('(A - B) - C = A - (B ∪ C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.difference (Set.difference (xs, ys), zs),
    Set.difference (xs, Set.union (ys, zs))
  ));

  jsv.property ('(A ∩ B) - C = A ∩ (B - C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.difference (Set.intersect (xs, ys), zs),
    Set.intersect (xs, Set.difference (ys, zs))
  ));

  jsv.property ('A ∪ (A - B) = A', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.union (xs, Set.difference (xs, ys)),
    xs
  ));

  jsv.property ('A ∪ (B - A) = A ∪ B', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.union (xs, Set.difference (ys, xs)),
    Set.union (xs, ys)
  ));

  jsv.property ('A - (A - B) = A ∩ B', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.difference (xs, Set.difference (xs, ys)),
    Set.intersect (xs, ys)
  ));

  jsv.property ('(A ∪ B) - A = B - A', SetArb, SetArb, (xs, ys) => Set.equals (
    Set.difference (Set.union (xs, ys), xs),
    Set.difference (ys, xs)
  ));

  jsv.property ('(A - B) ∪ (A - C) = A - (B ∩ C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.union (Set.difference (xs, ys), Set.difference (xs, zs)),
    Set.difference (xs, Set.intersect (ys, zs))
  ));

  jsv.property ('(A - B) ∪ (C - B) = (A ∪ C) - B', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.union (Set.difference (xs, ys), Set.difference (zs, ys)),
    Set.difference (Set.union (xs, zs), ys)
  ));

  jsv.property ('(A - B) ∪ (A ∩ C) = A - (B - C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.union (Set.difference (xs, ys), Set.intersect (xs, zs)),
    Set.difference (xs, Set.difference (ys, zs))
  ));

  jsv.property ('(A ∩ B) ∪ (A ∩ C) = A ∩ (B ∪ C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.union (Set.intersect (xs, ys), Set.intersect (xs, zs)),
    Set.intersect (xs, Set.union (ys, zs))
  ));

  jsv.property ('(A ∪ B) - (A - C) = (B - A) ∪ (A ∩ C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.difference (Set.union (xs, ys), Set.difference (xs, zs)),
    Set.union (Set.difference (ys, xs), Set.intersect (xs, zs))
  ));

  jsv.property ('(A ∪ B) - (C - A) = A ∪ (B - C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.difference (Set.union (xs, ys), Set.difference (zs, xs)),
    Set.union (xs, Set.difference (ys, zs))
  ));

  jsv.property ('(A ∪ B) - (A ∩ C) = (A - C) ∪ (B - A)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.difference (Set.union (xs, ys), Set.intersect (xs, zs)),
    Set.union (Set.difference (xs, zs), Set.difference (ys, xs))
  ));

  jsv.property ('(A ∪ B) ∩ (A ∪ C) = A ∪ (B ∩ C)', SetArb, SetArb, SetArb, (xs, ys, zs) => Set.equals (
    Set.intersect (Set.union (xs, ys), Set.union (xs, zs)),
    Set.union (xs, Set.intersect (ys, zs))
  ));

  jsv.property ('contains after insert', Arb, SetArb, (x, xs) =>
    Set.contains (x, Set.insert (x, xs))
  );

  jsv.property ('contains after removal', Arb, SetArb, (x, xs) =>
    !(Set.contains (x, Set.remove (x, xs)))
  );

  jsv.property ('size', Arb, SetArb, (x, xs) =>
    (Set.size (Set.remove (x, xs)) + 1) === Set.size (Set.insert (x, xs))
  );

  jsv.property ('size after of', Arb, x =>
    Set.size (Set.of (x)) === 1
  );

  jsv.property ('fromFoldable after toArray', SetArb, xs => Set.equals (
    Set.fromFoldable (Set.toArray (xs)),
    xs
  ));
};
