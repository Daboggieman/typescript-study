# Lecture 22: Iterators & Generators

`for...of`, spread, destructuring, `Array.from`, and `[...map.entries()]` all work because of one protocol: **iteration**. Generators are the easiest way to implement it, and they are also the cleanest way to express a lazy sequence, a state machine, or a stream of asynchronous values.

Python has the same two features — `__iter__`/`__next__`, and `yield` — and if you have written a Python generator, this lecture will feel familiar. The protocol differs; the ideas do not.

---

## 1. The Iteration Protocol

A value is **iterable** if it has a method at the well-known symbol `Symbol.iterator`, which returns an **iterator**. An iterator is an object with a `next()` method returning `{ value, done }`.

```ts
const items = ["a", "b"];

const iterator = items[Symbol.iterator]();

iterator.next();     // { value: "a", done: false }
iterator.next();     // { value: "b", done: false }
iterator.next();     // { value: undefined, done: true }
iterator.next();     // { value: undefined, done: true }   — stays done
```

That is the entire mechanism. `for...of` is sugar over it:

```ts
for (const item of items) {
  console.log(item);
}

// ...is exactly
const it = items[Symbol.iterator]();
let result = it.next();
while (!result.done) {
  console.log(result.value);
  result = it.next();
}
```

| Built-in | Iterable over |
|---|---|
| `Array` | elements |
| `String` | **code points** — `"héllo"` gives `h, é, l, l, o` |
| `Map` | `[key, value]` pairs |
| `Set` | values |
| `arguments` | positional args |
| `NodeList`, `FileList` | DOM elements |

**A plain object is not iterable.** `for (const x of { a: 1 })` throws `TypeError: obj is not iterable`. Use `Object.keys`, `Object.values`, or `Object.entries` — each of which *returns an array*, which is iterable. This is the reason those three functions exist ([05_objects_maps_sets](../05_objects_maps_sets/lecture.md)).

### Why the symbol exists

A string-based name like `"iterator"` would collide with the array method `Array.prototype.iterator` if anyone ever added one, and a well-known symbol cannot collide. It is a name that is guaranteed unique across every library.

---

## 2. Custom Iterables

You can make anything iterable by implementing the protocol:

```ts
class Countdown {
  constructor(private start: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const stop = 0;

    return {
      next(): IteratorResult<number> {
        if (current < stop) {
          return { value: undefined, done: true };
        }
        return { value: current--, done: false };
      },
    };
  }
}

const countdown = new Countdown(3);

for (const n of countdown) {
  console.log(n);              // 3, 2, 1
}

console.log([...new Countdown(3)]);       // [3, 2, 1]
const [first] = new Countdown(3);         // 3
```

Once you implement `Symbol.iterator`, **every** language feature that consumes an iterable works: `for...of`, spread, destructuring, `Array.from`, `Promise.all`. That is the payoff of implementing a protocol rather than a specific method.

Note that `[Symbol.iterator]()` returns a fresh, independent iterator each time — which is what makes the class reusable. Calling `[...countdown]` twice must give the same result twice.

> **Iterable vs iterator.** The *iterable* is the collection; the *iterator* is the cursor. A class implementing both returns `this` from `Symbol.iterator` and is exhausted after one pass — that is exactly how generators behave, and why a generator object can only be consumed once.

---

## 3. Generators

A generator function is any function declared with `*`. It returns a generator object, which is both iterable and iterator.

```ts
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

for (const n of range(1, 4)) {
  console.log(n);              // 1, 2, 3
}

console.log([...range(1, 4)]); // [1, 2, 3]
```

`yield` is the piece Python programmers already know: it **pauses** the function, hands out a value, and resumes exactly where it left off on the next `next()` call. Local variables, loop state, everything is preserved.

The difference from `return`: `return` ends the function, `yield` suspends it. A generator can yield any number of times, and then optionally `return` a final value (which appears as `done: true` and is usually ignored).

### Why generators are more than a curiosity

```ts
// A function that produces values one at a time, without building an array
function* fibonacci(): Generator<number> {
  let [a, b] = [0, 1];
  while (true) {                 // infinite!
    yield a;
    [a, b] = [b, a + b];
  }
}

function* take<T>(source: Iterable<T>, n: number): Generator<T> {
  let count = 0;
  for (const item of source) {
    if (count++ >= n) return;
    yield item;
  }
}

console.log([...take(fibonacci(), 10)]);
```

`fibonacci()` never terminates, and that is fine — `take` stops pulling after ten values. **The generator only computes what is consumed.** That is **lazy evaluation**, and it is the main reason to reach for a generator over an array method.

Compare with the eager version, which cannot work at all for an infinite sequence and wastes memory for a large one:

```ts
const numbers = Array.from({ length: 1_000_000 }, (_, i) => i);   // builds a million-element array first
```

### Generators as state machines

`yield` resumes in the middle of a function, which means a generator is a state machine you write as ordinary sequential code:

```ts
function* trafficLight(): Generator<"red" | "green" | "yellow"> {
  while (true) {
    yield "red";
    yield "green";
    yield "yellow";
  }
}

const light = trafficLight();
light.next().value;    // "red"
light.next().value;    // "green"
light.next().value;    // "yellow"
light.next().value;    // "red" — wrapped around
```

The same thing without a generator needs an index field and a `switch`, and the logic is spread across the class instead of read top to bottom.

---

## 4. `yield*` — Delegating

`yield*` yields every value from another iterable:

```ts
function* firstAndRest(): Generator<string> {
  yield "first";
  yield* ["a", "b", "c"];      // yields a, b, c
  yield* "xy";                 // yields x, y
  yield "last";
}

console.log([...firstAndRest()]);
// ["first", "a", "b", "c", "x", "y", "last"]
```

It flattens nested iterables, and it composes pipelines:

```ts
function* numbers(): Generator<number> {
  yield* [1, 2, 3];
  yield* [4, 5, 6];
}
```

Without `yield*` you would write a `for...of` and re-yield each item manually — which is fine, but `yield*` also forwards `return` and `throw` into the delegated generator, which the manual loop does not.

---

## 5. Passing Values Back In

`yield` is an **expression** with a value: whatever is passed to the next `next(value)` call. This is the part people skip, and it is where generators stop being "lazy map" and start being coroutines.

```ts
function* accumulator(): Generator<number, void, number> {
  let total = 0;
  while (true) {
    const amount = yield total;      // yields total, receives amount
    total += amount;
  }
}

const acc = accumulator();
acc.next();          // { value: 0, done: false }
acc.next(10);        // { value: 10, done: false }
acc.next(5);         // { value: 15, done: false }
acc.next(100);       // { value: 115, done: false }
```

Note the first `next()` must be called with no argument — there is no `yield` waiting to receive it yet, so anything passed is discarded. That trip-up is identical in Python (`next(gen)` vs `gen.send(value)`).

The three type parameters on `Generator<T, TReturn, TNext>` are: what it yields, what it returns, what it accepts. Writing `Generator<number, void, number>` is not decoration — it is what makes `acc.next(10)` type-check.

This is the machinery underneath `redux-saga`, `co`, and most of the async/await implementations before async/await existed as syntax.

---

## 6. Async Generators

Add `async` and you get a stream of values that arrive over time:

```ts
async function* lines(file: string): AsyncGenerator<string> {
  const content = await fs.readFile(file, "utf8");
  for (const line of content.split("\n")) {
    yield line;
  }
}

for await (const line of lines("./data.txt")) {
  console.log(line);
}
```

Note `for await...of`, not `for...of`. An async iterable cannot be consumed synchronously — each value might not exist yet.

The real use case is a stream where you do not want the whole thing in memory:

```ts
async function* fetchPages(url: string): AsyncGenerator<Item[]> {
  let next: string | null = url;
  while (next !== null) {
    const response = await fetch(next);
    const body = (await response.json()) as { items: Item[]; next: string | null };
    yield body.items;
    next = body.next;
  }
}

for await (const page of fetchPages("/api/items")) {
  for (const item of page) {
    console.log(item.id);
  }
}
```

Pagination, log files, database cursors, websocket messages — anything where "all of it at once" is not an option. This is the pattern that makes [14_fetch_apis](../14_fetch_apis/lecture.md) scale past one page.

Note the `as` cast on the JSON body — `response.json()` returns `any` (or `unknown` if you annotate it), so the shape has to be asserted or validated. See [10_files_json](../10_files_json/lecture.md) section 6.

---

## 7. Generators vs Array Methods

Both are fine, and they are for different shapes of problem.

**Use array methods** (`map`, `filter`, `reduce`) for a bounded collection that already exists:

```ts
const doubled = [1, 2, 3].map((n) => n * 2);
```

They are shorter, more familiar, and easier to debug. A chain of three array methods is clearer than an equivalent generator.

**Use a generator when:**

```ts
// 1. The sequence is unbounded
function* ids(): Generator<number> {
  let n = 0;
  while (true) yield n++;
}

// 2. Building the array would be expensive or impossible
function* readLines(path: string): Generator<string> { /* ... */ }

// 3. You want to stop early without computing the rest
function* search<T>(items: Iterable<T>, predicate: (t: T) => boolean): Generator<T> {
  for (const item of items) {
    if (predicate(item)) yield item;
  }
}
// ...and the caller breaks out after the first match, so the rest is never computed

// 4. It is genuinely a state machine
function* parser(input: string): Generator<Token> { /* ... */ }
```

There is one performance trap worth naming. Because array methods chain, they allocate:

```ts
const result = big
  .map((x) => x * 2)          // allocates a full array
  .filter((x) => x > 10)      // allocates another
  .slice(0, 5);               // allocates a third, then discards most of the work
```

For a million-element array, that is three passes and three allocations to produce five values. Generators fuse the passes and short-circuit. **For anything under a few thousand elements this does not matter** — write the array method, and reach for the generator when you have measured a problem or when the sequence is genuinely unbounded.

---

## 8. Common Mistakes

**Consuming a generator twice.** A generator object is its own iterator, so it is exhausted after one pass:

```ts
const gen = range(1, 4);
console.log([...gen]);     // [1, 2, 3]
console.log([...gen]);     // []  — already done
```

If you need it twice, call the generator *function* twice, or build an iterable object with `[Symbol.iterator]`.

**`return` inside a `for...of` over a generator is not a bug** — it stops the loop and calls the generator's `return()`, which runs any `finally` block. That is how early exit cleans up.

**`yield` inside a callback.** `yield` only works directly in the generator body:

```ts
function* bad(): Generator<number> {
  [1, 2, 3].forEach((n) => {
    // yield n;              // ERROR — not a generator function
  });
}
```

Use `for...of` instead of `forEach` inside a generator. This is the same class of problem as `await` inside `forEach` ([25_async_and_promises](../25_async_and_promises/lecture.md)).

**Reaching for generators to be clever.** A generator that yields three values and is immediately spread into an array is a slower array literal. Generators earn their place through laziness or state; without one of those, they are just harder to debug.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Walk an array manually with `arr[Symbol.iterator]()` and `next()`, printing each result.
2. Make a `Countdown` class iterable and spread it into an array.
3. Write `range(start, end)` as a generator and run it through `for...of`.
4. Write an infinite `naturalNumbers()` and a `take(source, n)` that stops it.
5. Write `fibonacci()` as an infinite generator and take the first ten with `take`.
6. Use `yield*` to flatten two arrays into one sequence.
7. Write the `accumulator` and drive it with `next(value)`.
8. Write a `trafficLight` generator and call `next()` five times.
9. Write an `async function*` over an array with a delay, and consume it with `for await...of`.
10. Prove that a generator can only be consumed once.

---

## 📚 Resources

- **Reference:** [MDN — Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
- **Reference:** [MDN — `function*`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function%2A)
- **Reference:** [MDN — `for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- **Docs:** [TypeScript — `Generator` type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-6.html#stricter-generators)
- **Docs:** [TypeScript — `AsyncGenerator`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html)
- **Book:** [Exploring JS — Generators](https://exploringjs.com/es6/ch_generators.html) — Axel Rauschmayer, the most thorough treatment available
