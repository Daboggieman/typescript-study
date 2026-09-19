# Lecture 07: Loops

JavaScript has more loop syntax than Python, and one of the options is a trap. This lecture covers all of them, says which to use by default, and explains the one you should almost never touch.

---

## 1. `for...of` — Use This By Default

```ts
const fruits = ["apple", "banana", "cherry"];

for (const fruit of fruits) {
  console.log(fruit);
}
```

This is Python's `for fruit in fruits:` and it is the direct equivalent. It works on arrays, strings, `Map`, `Set`, and anything else implementing the iterator protocol.

To get the index, use `.entries()`:

```ts
for (const [i, fruit] of fruits.entries()) {
  console.log(i, fruit);
}
```

### Strings are iterable

```ts
for (const char of "abc") {
  console.log(char);        // a, b, c
}
```

Code-point aware, so `for...of` handles emoji better than index access does.

---

## 2. `for...in` — The Trap

```ts
const fruits = ["apple", "banana"];

for (const i in fruits) {
  console.log(i);            // "0", "1"     <-- STRINGS, not values
  console.log(typeof i);     // "string"
}
```

`for...in` iterates **keys**, and for an array those keys are numeric strings. It is a Python `for i in range(len(x))` lookalike that gives you the wrong thing *silently* — no error, just strings where you expected elements, and `i + 1` producing `"01"`.

Worse, it walks the **prototype chain**, so a polyfill or library that added a method to `Array.prototype` shows up as a key.

> **`for...in` is for objects.** For arrays, always use `for...of`. When you want an object's keys, `Object.keys(obj)` returns a real array you can iterate with `for...of`, which is clearer than `for...in` anyway.

```ts
const scores = { ada: 95, grace: 88 };

for (const name in scores) {          // works, but ...
  console.log(name, scores[name]);
}

for (const [name, score] of Object.entries(scores)) {   // ... prefer this
  console.log(name, score);
}
```

---

## 3. The C-Style `for` Loop

```ts
for (let i = 0; i < fruits.length; i++) {
  console.log(i, fruits[i]);
}
```

Three parts separated by semicolons: **initialise**; **condition**; **update**. The equivalent Python is `for i in range(len(fruits))`.

You need this form when:

- You are **skipping** elements (`i += 2`) or iterating **backwards** (`i--`).
- You are **mutating** the array as you go, and the index must stay valid.
- You need to compare the element to its **neighbours** (`arr[i]` and `arr[i + 1]` — the basis of most sorting and sliding-window algorithms).

For everything else, `for...of` is shorter and immune to the classic off-by-one. Note the strict `<`, not `<=`:

```ts
for (let i = 0; i <= fruits.length; i++)   // BUG — one step too far, prints undefined
```

### It is not `range`

There is no `range()` in JavaScript. The idioms:

```ts
// 0 to 4
for (let i = 0; i < 5; i++) { }

// as an array
[...Array(5).keys()]                      // [0, 1, 2, 3, 4]
Array.from({ length: 5 }, (_, i) => i)    // [0, 1, 2, 3, 4]

// a reusable helper
function range(start: number, end: number, step = 1): number[] {
  const out: number[] = [];
  for (let i = start; i < end; i += step) out.push(i);
  return out;
}
```

---

## 4. `while` and `do...while`

```ts
let n = 5;

while (n > 0) {
  console.log(n);
  n--;
}
```

Identical to Python's `while`. The only trap is that **there is no `while...else`** — Python's `else` clause on a loop, which runs when the loop finishes without `break`, has no JavaScript equivalent. You track it with a flag:

```ts
let found = false;
for (const x of items) {
  if (x === target) { found = true; break; }
}
if (!found) console.log("not found");
```

### `do...while` — runs at least once

```ts
let input: string;
do {
  input = prompt("Enter something") ?? "";
} while (input === "");
```

The body runs **before** the condition is tested, so it executes at least once. This is the right shape for "ask until valid" and for menus. Python has no direct equivalent — you would write it as `while True:` with a `break`.

---

## 5. `break`, `continue`, and Labels

```ts
for (const n of [1, 2, 3, 4, 5]) {
  if (n === 3) continue;      // skip this iteration
  if (n === 5) break;         // exit the loop entirely
  console.log(n);             // 1, 2, 4
}
```

Same as Python. And as in Python, `break` only exits the **innermost** loop:

```ts
for (const row of grid) {
  for (const cell of row) {
    if (cell === target) {
      break;                  // breaks the INNER loop only
    }
  }
}
```

Python solves this with a function and `return`, or a flag. JavaScript has **labelled break**, which Python lacks:

```ts
outer:
for (const row of grid) {
  for (const cell of row) {
    if (cell === target) {
      break outer;            // exits BOTH loops
    }
  }
}
```

Labels work with `continue` too (`continue outer`). They are genuinely useful for nested searches, and they are also easy to overuse — an extracted function with an early `return` is usually clearer. Use them when the loops are inherently nested and short.

---

## 6. Loop Methods vs Loops

Many "loops" are better expressed as array methods. The trade-off is whether you need to `break`.

```ts
// These cannot break early — they always visit every element
nums.forEach(n => console.log(n));
const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);
const total = nums.reduce((a, b) => a + b, 0);
```

| Need | Use |
|---|---|
| Transform every element | `map` |
| Keep some elements | `filter` |
| Reduce to one value | `reduce` |
| Side effect for every element | `forEach` |
| **Stop early** | `for...of`, or `some` / `find` / `findIndex` |
| Build a new array with a condition | `for...of` + `push` |

`forEach` is the one that catches people: **there is no `break` and no `continue`** inside it. `return` inside a `forEach` callback behaves like `continue` (it skips the rest of *that callback*), not like `break` — a subtle difference that produces loops that run one extra time when you meant to stop.

```ts
// Silently does not stop
nums.forEach(n => {
  if (n > 3) return;        // skips the rest of THIS iteration only
  console.log(n);           // still runs for later elements
});

// To stop early, say so
for (const n of nums) {
  if (n > 3) break;
  console.log(n);
}
```

---

## 7. Iterating Async Work — a Preview

One loop difference worth flagging now, because it is a genuine trap and [25_async_and_promises](../25_async_and_promises/lecture.md) expands on it:

```ts
// WRONG — await inside forEach does not wait
items.forEach(async (item) => {
  await save(item);          // all of these run concurrently, and forEach returns immediately
});
console.log("done");         // prints BEFORE the saves finish

// RIGHT — for...of awaits each one in order
for (const item of items) {
  await save(item);
}
console.log("done");

// RIGHT — concurrent on purpose
await Promise.all(items.map(item => save(item)));
```

`forEach` does not understand promises. The callback returns a rejected promise nobody handles, and errors vanish. This is one of the most common real-world async bugs and it has no Python analogue, because Python's `for` is the only loop you would reach for.

---

## 8. Performance Notes

Worth knowing, not worth obsessing over:

- **`array.push` in a loop is O(1)** amortised. Growing an array is fine.
- **`array.unshift` or `splice(0, 0, x)` in a loop is O(n²)** — every insert moves the whole array. For a queue, use two indices or a `Map`-based structure ([DSA/curriculum/05_queues](../../DSA/curriculum/05_queues/lecture.md)).
- **`array.includes` inside a loop is O(n²)** overall. Build a `Set` once and use `.has` instead ([DSA/curriculum/06_hash_tables](../../DSA/curriculum/06_hash_tables/lecture.md)).
- **`for (const x of arr)` is slightly slower than a C-style index loop** on very hot paths, because of iterator overhead. This matters in the tens of millions of iterations, not the thousands.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Loop over an array four ways: `for...of`, `for...of` with `.entries()`, the C-style `for`, and `forEach`. Print the same output from each.
2. Show the `for...in` trap: print each value with `for...in` on an array and explain in a comment why you get strings.
3. Build a `range(start, end, step)` helper and use it to print the even numbers from 2 to 20.
4. Write a `do...while` loop that keeps doubling a number until it exceeds 1000, printing each step and the final count of iterations.
5. Use `break` and `continue` in one loop to print the odd numbers below 10, stopping entirely once you pass 7.
6. Search a 2D grid for a value with two nested loops and `break outer`. Then rewrite it as a function with an early `return`.
7. Demonstrate that `return` inside `forEach` skips one iteration rather than stopping the loop.

---

## 📚 Resources

- **MDN:** [Loops and iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- **MDN:** [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- **MDN:** [`for...in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in) — read the "Array iteration and for...in" warning box
- **Article:** [forEach vs for loops](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#description) — why `forEach` cannot be stopped or awaited
