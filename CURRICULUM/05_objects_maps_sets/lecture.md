# Lecture 05: Objects, Maps & Sets

Python gives you one primary key-value structure, the `dict`, plus `set` for uniqueness. JavaScript splits the job across three tools — **plain objects**, **`Map`**, and **`Set`** — and choosing the wrong one is a recurring source of bugs. This lecture covers all three and, more importantly, when to reach for which.

---

## 1. Object Literals — The `dict` You Already Know

```ts
const person = {
  name: "Ada",
  age: 30,
  "favourite colour": "blue",     // quotes needed for non-identifier keys
};

person.name                          // "Ada"
person["name"]                       // "Ada"
person["favourite colour"]           // "blue"     — bracket access is required here
person.age = 31;                     // legal — the OBJECT is not frozen
person.email = "ada@example.com";    // adds a NEW property on the spot
```

Two differences from a Python dict you should internalise immediately:

1. **`obj.key` is the same as `obj["key"]`.** Python makes you write `d["key"]` always; JavaScript gives you dot access for identifier-safe keys. Dot is preferred, but any key with a space, a dash, or a leading digit needs brackets.
2. **Objects are not hash maps.** They were never designed as one. Their keys have real restrictions, and section 7 shows where those restrictions bite.

### Keys are strings (mostly)

```ts
const o = {};
o[1] = "one";
o[true] = "yes";
o[{ id: 1 }] = "object?";

console.log(o);        // { '1': 'one', 'true': 'yes', '[object Object]': 'object?' }
```

Every key is coerced to a **string**. The number `1` becomes `"1"`, and every object collapses to the same `"[object Object]"` key — so putting object keys into a plain object silently destroys your data. That single fact is the reason `Map` exists.

---

## 2. Optional and Missing Properties

```ts
const user = { name: "Ada" };

user.email              // undefined — reading a missing key does NOT throw
user["anything"]        // undefined

user.email ?? "none"    // "none"
```

Python raises `KeyError`; JavaScript hands you `undefined`. In exchange for fewer crashes you get bugs that travel further before anyone notices — a typo in a property name returns `undefined` and keeps going.

```ts
// Any of these makes `email` legitimately optional:
type User = { name: string; email?: string };
```

Once you meet `strict` (`strictNullChecks`), TypeScript will refuse to let you use a possibly-`undefined` value without checking. That is the compensation for JavaScript's permissiveness, and it is the subject of [18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md).

### Checking existence

```ts
const o = { a: 1, b: undefined };

"a" in o                  // true
"b" in o                  // true   — the KEY exists, its value is undefined
"c" in o                  // false
"toString" in o           // true   — includes INHERITED properties from Object.prototype!

Object.hasOwn(o, "a")     // true   — own properties only. Prefer this.
Object.hasOwn(o, "toString")  // false

o.a !== undefined         // true
o.b !== undefined         // false  — cannot distinguish "absent" from "set to undefined"
```

> **Use `Object.hasOwn(obj, key)`** to ask "does this object have this key?" It ignores the prototype chain, which is what you almost always mean. `in` is only correct when inherited properties should count.

---

## 3. Removing Properties

```ts
const o = { a: 1, b: 2, c: 3 };

delete o.b;
console.log(o);           // { a: 1, c: 3 }
```

`delete` works but has costs: it deoptimises the object's internal shape in V8, and it cannot be used on a property declared non-configurable. The cleaner functional alternative:

```ts
const { b, ...rest } = o;      // rest = { a: 1, c: 3 }, and `b` is discarded
```

---

## 4. Iterating an Object

Unlike Python, **an object is not directly iterable** — `for (const x of obj)` is an error. You go through three static helpers, all of which return arrays:

```ts
const scores = { ada: 95, grace: 88, alan: 71 };

Object.keys(scores)      // ["ada", "grace", "alan"]
Object.values(scores)    // [95, 88, 71]
Object.entries(scores)   // [["ada", 95], ["grace", 88], ["alan", 71]]

for (const [name, score] of Object.entries(scores)) {
  console.log(`${name}: ${score}`);
}
```

Because they return arrays, all of lecture 04 applies:

```ts
const top = Object.entries(scores)
  .filter(([, score]) => score >= 90)
  .map(([name]) => name);                      // ["ada"]

const total = Object.values(scores).reduce((a, b) => a + b, 0);

Object.fromEntries([["a", 1], ["b", 2]])       // { a: 1, b: 2 } — the inverse
```

### Key order

For string keys, insertion order is preserved — **with an exception**: keys that look like non-negative integers are listed first, in ascending numeric order.

```ts
const o = { b: 1, 2: 2, a: 3 };
console.log(Object.keys(o));    // ["2", "b", "a"]  <-- the numeric key jumped the queue
```

This has bitten production code. If order is part of your data's meaning, use a `Map`, which guarantees pure insertion order for every key type.

---

## 5. Copying: Shallow vs Deep

```ts
const original = { a: 1, nested: { b: 2 } };

const spread = { ...original };              // shallow copy
const assigned = Object.assign({}, original); // shallow copy, older style
const deep = structuredClone(original);       // deep copy — built into Node 17+

spread.nested.b = 99;
console.log(original.nested.b);    // 99  <-- the original changed!
```

Explicitly merging is the same mechanism, with later keys winning:

```ts
const defaults = { theme: "dark", size: 12 };
const prefs = { size: 16 };
const merged = { ...defaults, ...prefs };     // { theme: "dark", size: 16 }
```

Note that `{ ...a, ...b }` overwrites even when `b`'s value is `undefined` — unlike `??`, there is no per-key "only if set" behaviour.

---

## 6. `Map` — The Real Key-Value Store

A `Map` is what you reach for when a dict must hold real keys, not just strings.

```ts
const m = new Map<string, number>();

m.set("ada", 95);
m.set("grace", 88);

m.get("ada")             // 95
m.get("nobody")          // undefined
m.has("ada")             // true
m.delete("ada")          // true
m.size                   // 1        — a PROPERTY, not a method
m.clear()
```

### `Map` vs plain object — the whole comparison

| Feature | Plain object | `Map` |
|---|---|---|
| Key types | strings and symbols only | **anything**: numbers, objects, functions |
| Order | insertion, but numeric keys sort first | **pure insertion order, always** |
| Size | `Object.keys(o).length` | `m.size` — O(1) |
| Read a missing key | `undefined`, and inherited keys can fool `in` | `undefined`, and `has` is reliable |
| Prototype keys as a hazard | `__proto__`, `constructor` collide | none |
| Frequent add/delete | slow — hidden-class churn | designed for it |
| Iterable | needs `Object.entries` | **directly** `for (const [k, v] of m)` |
| JSON serialisable | **yes** | **no** — `JSON.stringify(new Map())` is `{}` |
| Literal syntax | `{ a: 1 }` | `new Map([["a", 1]])` |

That last row decides a lot of real code: if the data needs to go over the wire as JSON, you want a plain object and you live with string keys.

```ts
const m = new Map([
  ["ada", 95],
  ["grace", 88],
]);

for (const [name, score] of m) {
  console.log(name, score);
}
[...m.keys()]        // ["ada", "grace"]
[...m.values()]      // [95, 88]
[...m.entries()]     // [["ada", 95], ["grace", 88]]

const obj = Object.fromEntries(m);       // Map  -> object (if JSON is needed)
const back = new Map(Object.entries(obj));
```

### Object keys, the thing an object cannot do

```ts
type Point = { x: number; y: number };
const visited = new Map<Point, string>();

const p1 = { x: 1, y: 2 };
const p2 = { x: 1, y: 2 };

visited.set(p1, "first").set(p2, "second");

visited.size           // 2 — TWO entries, because the keys are different objects
visited.get({ x: 1, y: 2 })    // undefined — a fresh object is never a key

// Look up by value instead: serialise the key
visited.set(JSON.stringify(p1), "first");
visited.get(JSON.stringify({ x: 1, y: 2 }))   // "first"
```

> **The rule:** `Map` compares keys by reference for objects. Two objects with identical contents are two different keys. When you need lookup *by value*, key the map on a canonical string.

---

## 7. `Set` — Uniqueness

```ts
const s = new Set([1, 2, 2, 3, 3, 3]);

s.size           // 3        — duplicates were discarded at construction
s.has(2)         // true     — O(1), not O(n) like Array.includes
s.add(4)         // chainable
s.delete(2)
[...s]           // [1, 3, 4]

new Set("hello")             // Set(4) { 'h', 'e', 'l', 'o' }
```

The idiom you will use constantly:

```ts
const unique = [...new Set([1, 2, 2, 3])];            // [1, 2, 3] — dedupe an array

// Intersection and difference, done by hand
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

const intersection = new Set([...a].filter(x => b.has(x)));   // {2, 3}
const difference = new Set([...a].filter(x => !b.has(x)));    // {1}
const union = new Set([...a, ...b]);                          // {1, 2, 3, 4}
```

**Sets compare objects by reference too**, exactly like `Map` keys:

```ts
new Set([{ id: 1 }, { id: 1 }]).size      // 2 — not 1!
```

---

## 8. Choosing a Structure

| You need… | Use |
|---|---|
| A record with known string keys, JSON-bound | **plain object** |
| A lookup table with non-string keys, or heavy add/delete | **`Map`** |
| Order exactly as inserted, for any key type | **`Map`** |
| Deduplication, or fast membership tests | **`Set`** |
| Order, duplicates, index access, or a small fixed list | **array** |

A pattern you will see endlessly — counting with a `Map`:

```ts
function countWords(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().split(/\s+/)) {
    if (word === "") continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}
```

`(counts.get(word) ?? 0) + 1` is the whole idiom: read the current count, default to zero when absent, add one, write it back. The Python version, `counts[word] = counts.get(word, 0) + 1`, is the same idea with the default expressed differently.

### Typing a dictionary

```ts
type Scores = Record<string, number>;      // an object with string keys

const scores: Scores = { ada: 95 };        // fine
const bad: Scores = { ada: "95" };         // error: string is not number

// A Record does NOT promise the key exists:
const value: number = scores["nobody"];    // typechecks, but is undefined at runtime!
```

That last line is a genuine lie the compiler tells you. `Record<string, T>` claims every string key maps to a `T`, which is false for keys that are absent. It is the reason `noUncheckedIndexedAccess` exists — see [21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md).

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Build an object literal with three keys, read one with dot notation and one with brackets.
2. Prove that setting a numeric key coerces it to a string, and that an object key collapses to `"[object Object]"`.
3. Read a missing property — confirm `undefined` rather than an error — then compare `"a" in o` against `Object.hasOwn(o, "a")`.
4. Iterate an object three ways, then filter and map `Object.entries` to names scoring 90+.
5. Demonstrate the numeric-key ordering exception with `{ b: 1, 2: 2, a: 3 }`.
6. Copy an object with spread, mutate a nested value, and show the original changed. Repeat with `structuredClone`.
7. Build a `Map<string, number>`, then a `Map` keyed on an object, and prove two equal-content objects are two different keys.
8. Dedupe an array with `Set`, compute the intersection of two sets, and show `Array.includes` vs `Set.has`.

---

## 📚 Resources

- **MDN:** [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
- **MDN:** [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- **MDN:** [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- **MDN:** [Property order in objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#description) — the official statement of the numeric-key exception
- **Docs:** [TypeScript — `Record` and index signatures](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures)
