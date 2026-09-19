# Lecture 04: Arrays & Tuples

An array is an ordered list of values. If you are coming from Python, an array is a `list` — growable, mixed-type-capable, and it is the workhorse collection of the language. There is no separate `tuple` value type at runtime; **tuples in TypeScript are arrays with a fixed shape**, and that difference is the subject of the last section.

---

## 1. Creating Arrays

```ts
const empty: number[] = [];
const scores = [95, 88, 71];              // TypeScript infers number[]
const names = ["Ada", "Grace"];
const mixed = [1, "two", true];           // inferred (string | number | boolean)[]

const alsoEmpty = new Array<number>();    // the constructor form — rarely needed
const fiveZeros = new Array(5).fill(0);   // [0, 0, 0, 0, 0]

Array.from({ length: 5 }, (_, i) => i);   // [0, 1, 2, 3, 4]
```

`new Array(5)` alone creates five **holes**, not five zeros — a trap worth knowing, and the reason `.fill()` is in the example above.

The two type syntaxes are identical in meaning:

```ts
const a: number[] = [1, 2, 3];            // preferred — shorter
const b: Array<number> = [1, 2, 3];       // same thing, generic form
```

---

## 2. Reading and Writing

```ts
const scores = [95, 88, 71];

scores[0]              // 95
scores[2]              // 71
scores[3]              // undefined — NO error. Python would raise IndexError.
scores[-1]             // undefined — no negative indexing
scores.at(-1)          // 71        — this is how you read from the end
scores.length          // 3         — a property, not len(scores)

scores[1] = 100;       // legal, even though `scores` is const (the ARRAY changed)
```

Out-of-range reads return `undefined` instead of throwing. That single difference from Python causes more silent bugs than any other, because `undefined` propagates quietly:

```ts
const nums = [1, 2, 3];
const total = nums[5] + 1;      // NaN — no crash, just wrong
```

---

## 3. Adding and Removing

```ts
const arr = [1, 2, 3];

arr.push(4);        // [1, 2, 3, 4]        add to END      — like append()
arr.pop();          // [1, 2, 3]  returns 4  remove from END
arr.unshift(0);     // [0, 1, 2, 3]        add to FRONT    — O(n)!
arr.shift();        // [1, 2, 3]  returns 0  remove from FRONT — O(n)!
```

| Python | TypeScript | Cost |
|---|---|---|
| `lst.append(x)` | `arr.push(x)` | O(1) |
| `lst.pop()` | `arr.pop()` | O(1) |
| `lst.insert(0, x)` | `arr.unshift(x)` | **O(n)** |
| `lst.pop(0)` | `arr.shift()` | **O(n)** |

`unshift`/`shift` move every other element, exactly like Python's `insert(0, ...)`. For queue-like workloads use a `Map`-free approach or an index pointer — [DSA/curriculum/05_queues](../../DSA/curriculum/05_queues/lecture.md) shows the proper version.

---

## 4. `slice` vs `splice` — One Letter, Opposite Behaviour

This pair causes more confusion than anything else in the language.

```ts
const arr = ["a", "b", "c", "d", "e"];

arr.slice(1, 3)      // ["b", "c"]        NON-destructive. End index EXCLUDED.
arr.slice(2)         // ["c", "d", "e"]
arr.slice(-2)        // ["d", "e"]        negatives count from the end
arr.slice()          // a shallow COPY of the whole array

arr.splice(1, 2)     // ["b", "c"]        DESTRUCTIVE. Mutates `arr`.
                     // arr is now ["a", "d", "e"]
arr.splice(1, 0, "X")// inserts "X" at index 1, removes nothing
arr.splice(1, 1, "Y")// replaces 1 element at index 1 with "Y"
```

> **`slice` copies. `splice` mutates.** The `p` in splice stands for "permanent" if that helps. `slice(1, 3)` takes two elements; `splice(1, 2)` also takes two — but the second argument means *end index* for one and *count* for the other.

Modern non-mutating alternatives exist for most destructive methods, and they are generally preferable:

```ts
arr.toSpliced(1, 2)        // the non-mutating splice
[...arr].sort()            // a sorted COPY, leaving arr alone
arr.toSorted()             // ...or the built-in
arr.toReversed()           // a reversed copy
arr.with(1, "Z")           // a copy with index 1 replaced
```

---

## 5. Iterating

```ts
const fruits = ["apple", "banana", "cherry"];

// The classic index loop — use it when you need the index
for (let i = 0; i < fruits.length; i++) {
  console.log(i, fruits[i]);
}

// for...of — the Python `for x in lst` equivalent. Use this by default.
for (const fruit of fruits) {
  console.log(fruit);
}

// With the index
for (const [i, fruit] of fruits.entries()) {
  console.log(i, fruit);
}

// forEach — a method that takes a callback
fruits.forEach((fruit, i) => console.log(i, fruit));
```

> **`for...in` is not `for...of`.** `for (const i in fruits)` iterates the **keys**, which for an array are the strings `"0"`, `"1"`, `"2"`. It is for objects, not arrays. Using it on an array gives you strings where you wanted values — a bug that typechecks, because `i` is just a `string`.

One more thing Python never makes you think about: `forEach` cannot be stopped. There is no `break`. If you need early exit, use `for...of` (where `break` works) or `some`/`find`.

---

## 6. Searching and Testing

```ts
const nums = [10, 20, 30, 20];

nums.includes(20)                        // true
nums.indexOf(20)                         // 1     — first index, or -1
nums.lastIndexOf(20)                     // 3
nums.find(n => n > 15)                   // 20    — first MATCHING VALUE, or undefined
nums.findIndex(n => n > 15)              // 1     — its index, or -1
nums.filter(n => n > 15)                 // [20, 30, 20]

nums.some(n => n > 25)                   // true  — does ANY match? (Python: any())
nums.every(n => n > 5)                   // true  — do ALL match?  (Python: all())

nums.findLast(n => n > 15)               // 20
nums.findLastIndex(n => n > 15)          // 3
```

`find` returns `undefined` when nothing matches — so the return type is `T | undefined`, and under `strict` TypeScript will make you handle that before using it. That is the type system doing exactly its job.

---

## 7. Transforming: `map`, `filter`, `reduce`

```ts
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2)                     // [2, 4, 6, 8, 10]
nums.filter(n => n % 2 === 0)            // [2, 4]
nums.reduce((sum, n) => sum + n, 0)      // 15     — the 0 is the initial value
nums.flatMap(n => [n, n])                // [1, 1, 2, 2, ...]
nums.flat()                              // flattens one level
```

The Python comparison:

| Python | TypeScript |
|---|---|
| `[n * 2 for n in nums]` | `nums.map(n => n * 2)` |
| `[n for n in nums if n % 2 == 0]` | `nums.filter(n => n % 2 === 0)` |
| `sum(nums)` | `nums.reduce((a, b) => a + b, 0)` |
| `[x for sub in m for x in sub]` | `m.flat()` |

`reduce` is the one that needs care. **Always pass the initial value** (`0`, `""`, `[]`), or an empty array throws:

```ts
[].reduce((a, b) => a + b);       // TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0);    // 0
```

Chaining is idiomatic and reads well:

```ts
const total = orders
  .filter(o => o.paid)
  .map(o => o.amount)
  .reduce((sum, amount) => sum + amount, 0);
```

Note the cost: each step allocates a new array. For hot loops, a single `for` loop is faster — [DSA/curriculum/01_lists](../../DSA/curriculum/01_lists/lecture.md) covers when that matters.

---

## 8. `sort` — the Trap

```ts
const nums = [10, 1, 5, 25];

nums.sort();          // [1, 10, 25, 5]     <-- WRONG!
```

JavaScript's default sort converts every element to a **string** and compares the strings. `"10" < "5"` because `"1" < "5"`. This is the single most notorious array bug in the language, and Python's `sorted()` never does it.

Always pass a comparator:

```ts
nums.sort((a, b) => a - b);                  // [1, 5, 10, 25]   ascending
nums.sort((a, b) => b - a);                  // [25, 10, 5, 1]   descending

const words = ["banana", "Apple", "cherry"];
words.sort((a, b) => a.localeCompare(b));    // case-aware, human order

const users = [{ age: 30 }, { age: 20 }];
users.sort((a, b) => a.age - b.age);         // sort by a field
```

The comparator returns **a number**, not a boolean:

| Return | Meaning |
|---|---|
| negative | `a` comes first |
| positive | `b` comes first |
| `0` | keep the relative order |

`sort` **mutates in place** — another difference from Python's `sorted()`, which returns a new list. Use `toSorted()` (or `[...arr].sort(...)`) to leave the original alone.

---

## 9. Spread, Destructuring, and Rest

```ts
const a = [1, 2];
const b = [3, 4];

const combined = [...a, ...b];          // [1, 2, 3, 4]
const copy = [...a];                    // a shallow COPY, not a reference
const withExtra = [0, ...a, 9];         // [0, 1, 2, 9]

const [first, second] = a;              // first = 1, second = 2
const [head, ...tail] = [1, 2, 3];      // head = 1, tail = [2, 3]
const [, skipFirst] = [1, 2];           // skipFirst = 2

function sum(...values: number[]): number {   // rest parameter, like *args
  return values.reduce((total, v) => total + v, 0);
}
```

### The shallow copy trap

`[...a]` copies **one level**. Nested objects are still shared:

```ts
const original = [{ id: 1 }, { id: 2 }];
const shallow = [...original];

shallow[0].id = 99;
console.log(original[0].id);     // 99  <-- the original changed!
shallow.push({ id: 3 });         // but this does NOT affect the original
```

To copy deeply: `structuredClone(original)` (built into Node and browsers), or `JSON.parse(JSON.stringify(x))` as a lossy fallback that drops `Date`, `Map`, `Set`, and `undefined`.

---

## 10. Multidimensional Arrays

There is no native 2D array. You nest arrays — and the classic bug is that `fill` shares the inner array:

```ts
// BROKEN — every row is the SAME array
const grid = new Array(3).fill(new Array(3).fill(0));
grid[0][0] = 1;
console.log(grid);      // [[1,0,0], [1,0,0], [1,0,0]]  <-- all three changed!

// CORRECT — build a fresh inner array each time
const good = Array.from({ length: 3 }, () => new Array(3).fill(0));
good[0][0] = 1;
console.log(good);      // [[1,0,0], [0,0,0], [0,0,0]]
```

This is JavaScript's version of Python's mutable-default-argument trap: one array, several references.

---

## 11. Tuples — Arrays With a Fixed Shape

A **tuple** is TypeScript-only. At runtime it is an ordinary array; the type records the length and the type of each position.

```ts
type Point = [number, number];

const p: Point = [3, 4];
const bad: Point = [3, 4, 5];      // error — length is fixed
const worse: Point = ["x", 4];     // error — position 0 must be a number

const [x, y] = p;                  // destructuring gives you exact types
```

Why bother? Because a function returning "a value and an error" is much clearer as a tuple than as a two-field object:

```ts
function divide(a: number, b: number): [number | null, string | null] {
  if (b === 0) return [null, "cannot divide by zero"];
  return [a / b, null];
}

const [result, error] = divide(10, 2);
```

**A caveat that surprises everyone:** tuple labels are documentation, not enforcement.

```ts
type Pair = [first: string, second: number];
const p: Pair = ["a", 1];      // fine
p.push(999);                   // ALSO fine! push is not checked against the length
console.log(p);                // ["a", 1, 999]
```

`push` bypasses the tuple's arity because it is inherited from `Array`. For a tuple that truly cannot be changed, use `readonly`:

```ts
type Pair = readonly [string, number];
const p: Pair = ["a", 1];
p.push(999);      // error — push does not exist on a readonly tuple
```

### `as const` — the everyday way to make a tuple

```ts
const point = [3, 4] as const;          // readonly [3, 4] — a tuple of LITERAL types
const config = { host: "localhost" } as const;   // every property becomes readonly + literal
```

`as const` is how you turn a plain literal into the narrowest possible type. You will use it constantly once you reach [20_utility_types](../20_utility_types/lecture.md).

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Create an array of five numbers three ways: literal, `new Array().fill()`, and `Array.from`.
2. Demonstrate that `arr[99]` is `undefined` and does not throw.
3. Add to the front and the back, remove from each, and print after every step.
4. Show the `slice` / `splice` difference: call each on a copy and print the original after both.
5. Sort `[10, 1, 5, 25]` with no comparator, then with `(a, b) => a - b`. Explain the first result.
6. Use `filter` + `map` + `reduce` on one array to total the even numbers, doubled.
7. Copy an array of objects with spread, mutate a nested object, and show the original changed. Then repeat with `structuredClone`.
8. Declare a `[string, number]` tuple for a (name, age) pair, then prove `push` is still allowed. Make it `readonly` and show the error.

---

## 📚 Resources

- **MDN:** [Array (full method reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- **Docs:** [TypeScript Handbook — Object Types (tuples and arrays)](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)
- **Docs:** [TypeScript Handbook — `as const`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference)
- **Article:** [JavaScript's sort is not what you think](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description) — the MDN description of the default comparator, worth reading in full
