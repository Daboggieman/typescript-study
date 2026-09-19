# Lecture 11: Testing

A test is a piece of code that checks another piece of code and tells you when it breaks. Python ships `unittest` and everyone installs `pytest`. JavaScript's ecosystem settled on **Vitest** (or its predecessor Jest), and this repo has Vitest installed already.

This lecture is about what tests are *for*, not just the syntax. The syntax is small.

---

## 1. Why Bother

Three reasons, and only the third one is the usual sales pitch:

1. **They check your work now.** You run the function, it prints the right thing, you move on. A test does that, but repeatably.
2. **They check your work later.** You change something unrelated in module 9. Tests you wrote in module 3 tell you whether you broke it. This is the real value.
3. **They are executable documentation.** `expect(cart.total()).toBe(150)` is a clearer statement of what `total()` does than any comment, and it cannot go stale — if it goes stale, it fails.

What tests do **not** do is prove the absence of bugs. They demonstrate the presence of correctness on the cases you thought of. A passing suite means "the things I checked still work", nothing more. That is still enormously valuable.

---

## 2. Vitest in Sixty Seconds

A test file is a normal file whose name ends in `.test.ts`. It imports the code under test and uses `describe`, `it`, and `expect`:

```ts
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

```ts
// math.test.ts
import { describe, it, expect } from "vitest";
import { add } from "./math.js";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negatives", () => {
    expect(add(-2, -3)).toBe(-5);
  });
});
```

```bash
npm test               # run everything once
npm run test:watch     # re-run on every save — use this while working
```

> **The `.js` in `import { add } from "./math.js"` is not a typo.** This repo uses Node's real ES module rules (`moduleResolution: NodeNext`), and relative imports must name the file that will exist *after* compilation. You write `./math.js`; TypeScript resolves it to `math.ts` and Vitest follows along. This is one of the most-asked TypeScript questions, and [21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) explains why.

### `it` vs `test`

They are the same function. `test("...")` is the modern name; `it("...")` reads better inside a `describe`, as in "describe add → it adds two positive numbers". Vitest exports both.

---

## 3. The Matchers You Will Actually Use

```ts
expect(value).toBe(expected);              // strict equality (Object.is) — for primitives
expect(value).toEqual(expected);           // deep equality — for objects and arrays
expect(value).not.toBe(expected);          // negation, on any matcher
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

expect(n).toBeGreaterThan(5);
expect(n).toBeGreaterThanOrEqual(5);
expect(n).toBeLessThan(5);
expect(n).toBeCloseTo(0.3, 5);             // floats! 0.1 + 0.2 needs this, not toBe

expect(str).toContain("ell");              // arrays and strings
expect(arr).toHaveLength(3);
expect(obj).toHaveProperty("name", "Ada");
expect(fn).toThrow();
expect(fn).toThrow("specific message");
expect(fn).toThrowError(MyError);
expect(promise).resolves.toBe(42);         // async
expect(promise).rejects.toThrow("nope");
```

### `toBe` vs `toEqual` — the mistake everyone makes once

```ts
expect({ a: 1 }).toBe({ a: 1 });         // FAILS — two different objects
expect({ a: 1 }).toEqual({ a: 1 });      // passes — deep comparison
expect([1, 2]).toEqual([1, 2]);          // passes
```

`toBe` compares references for objects, exactly like `===`. Use `toBe` for primitives and `toEqual` for anything structured.

### Floating point

```ts
expect(0.1 + 0.2).toBe(0.3);              // FAILS — 0.30000000000000004
expect(0.1 + 0.2).toBeCloseTo(0.3, 10);   // passes
```

This is the `number` type from [02_variables_types](../02_variables_types/lecture.md) catching up with you inside a test. Any assertion on a computed float needs `toBeCloseTo`.

---

## 4. What Makes a Test Worth Writing

The hard part is not the API. It is choosing cases.

### Test the boundaries and the edge cases

For `fizzbuzz(n)`, the interesting inputs are not 5 and 7:

```ts
describe("fizzbuzz", () => {
  it("returns the number for a plain input", () => {
    expect(fizzbuzz(1)).toBe("1");
  });

  it("returns Fizz for multiples of 3", () => {
    expect(fizzbuzz(3)).toBe("Fizz");
  });

  it("returns FizzBuzz for multiples of 15", () => {
    expect(fizzbuzz(15)).toBe("FizzBuzz");
  });

  it("returns Fizz for 0 — the boundary", () => {      // 0 is divisible by everything
    expect(fizzbuzz(0)).toBe("FizzBuzz");
  });

  it("handles negatives", () => {
    expect(fizzbuzz(-3)).toBe("Fizz");
  });
});
```

The edges are where bugs live: **zero, one, negative numbers, the empty string, the empty array, the maximum value, and the duplicate**.

### One behaviour per test

```ts
// Bad — when this fails you learn nothing about which part broke
it("handles the cart", () => {
  expect(cart.add("apple", 1.5)).toBeUndefined();
  expect(cart.total()).toBe(1.5);
  expect(cart.add("apple", 1.5)).toBeUndefined();
  expect(cart.total()).toBe(3.0);
  expect(cart.count()).toBe(2);
});

// Good — a failure names the behaviour that broke
it("increases the total when an item is added", () => {
  cart.add("apple", 1.5);
  expect(cart.total()).toBe(1.5);
});

it("accumulates quantity when the same item is added twice", () => {
  cart.add("apple", 1.5);
  cart.add("apple", 1.5);
  expect(cart.count()).toBe(2);
});
```

### Test behaviour, not implementation

Assert on what the function guarantees, not on how it achieves it. A test that checks a private helper's exact call sequence breaks when you refactor, even though nothing observable changed — and then people start deleting tests.

---

## 5. Setup, Teardown, and Independence

Tests must not depend on each other's leftovers. Vitest runs them in order within a file, but nothing stops a shared object from leaking state:

```ts
import { beforeEach, afterEach, describe, it, expect } from "vitest";

describe("Cart", () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();          // a FRESH cart before every test
  });

  it("starts empty", () => {
    expect(cart.total()).toBe(0);
  });

  it("adds an item", () => {
    cart.add("apple", 1.5);     // does not inherit state from the test above
    expect(cart.total()).toBe(1.5);
  });
});
```

| Hook | Runs |
|---|---|
| `beforeAll` / `afterAll` | once per file — expensive setup, like opening a DB |
| `beforeEach` / `afterEach` | before/after **every** test — the safe default |

> **The rule: build a fresh state in `beforeEach`.** A test that only passes when run after another test is worse than no test, because it hides the dependency until the day the order changes and everything fails at once.

### Why independence matters here specifically

`Cart` is a class, so `new Cart()` in `beforeEach` gives real isolation. But if `Cart` held a `static` array, every test would share it and the isolation would be an illusion. That is the JavaScript version of the shared-mutable-state problem, and it is worth deliberately testing for.

---

## 6. Testing Async Code

```ts
it("resolves with the value", async () => {
  const result = await fetchUser(1);
  expect(result.name).toBe("Ada");
});

it("rejects when the user is missing", async () => {
  await expect(fetchUser(999)).rejects.toThrow("not found");
});

// A common mistake: forgetting to await, so the assertion never runs
it("incorrect — always passes", () => {
  expect(fetchUser(1)).resolves.toBeDefined();      // no await, no failure reported
});
```

Return or `await` the promise. A test whose assertion is never awaited passes unconditionally — a green test that checks nothing is the worst possible outcome, because it is trusted.

Async is covered in [25_async_and_promises](../25_async_and_promises/lecture.md); for now, the rule is simply **`async` the `it` callback and `await` everything inside it**.

---

## 7. Running Tests on Purpose to Break Them

Worth doing once so you trust the tooling:

```ts
it("should fail", () => {
  expect(1).toBe(2);
});
```

Run it. Read the diff Vitest prints — it shows the expected and received values side by side, which is the whole reason to use a framework instead of `if (x !== y) console.log("bad")`. Then delete it.

---

## 8. Coming from Python's `unittest`

| Python | Vitest |
|---|---|
| `unittest.TestCase` subclass | `describe` block |
| `def test_foo(self):` | `it("foo", () => {})` |
| `self.assertEqual(a, b)` | `expect(a).toBe(b)` |
| `self.assertAlmostEqual` | `expect(a).toBeCloseTo(b)` |
| `self.assertRaises(ValueError)` | `expect(fn).toThrow(ValueError)` |
| `setUp` / `tearDown` | `beforeEach` / `afterEach` |
| `python -m unittest` / `pytest` | `npm test` |
| discovery by `test_*.py` | discovery by `*.test.ts` |

The biggest difference is cultural: Python's `assertEqual` is a *method on the test case*, so you must remember the right one. Vitest's matchers hang off a single `expect(value)`, and `expect(x).toEqual(y)` reads as a sentence. That reads better, and the failure output is much richer.

---

## 🧠 Try It Yourself

Open `exercises.ts` and `exercises.test.ts` in this folder. The exercises file holds the functions; the test file holds the assertions.

1. Implement `add`, `subtract`, `multiply`, `divide`, and make the existing tests pass.
2. Add a test for dividing by zero. Decide what the function *should* do — `Infinity`, or throw? Write the test to match, and make the function follow.
3. Implement `fizzbuzz` and add tests for 0, 1, 3, 5, 15, and a negative.
4. Implement `isPalindrome` and test an empty string, a single character, and a string with spaces and capitals.
5. Implement `sumAll` and test the empty array — which is the boundary case.
6. Write a class whose total accumulates, add a `beforeEach` creating a fresh instance, and prove one test cannot leak state into another.
7. Write an `async` function and test both its resolved value and its rejection.
8. Add a deliberately failing test, run `npm test`, read the output, then fix it.

---

## 📚 Resources

- **Docs:** [Vitest — Getting Started](https://vitest.dev/guide/)
- **Docs:** [Vitest — `expect` and all matchers](https://vitest.dev/api/expect.html)
- **Docs:** [Vitest — Setup and teardown](https://vitest.dev/api/#setup-and-teardown)
- **Article:** [Testing behaviour, not implementation](https://kentcdodds.com/blog/testing-implementation-details) — Kent C. Dodds on why brittle tests get deleted
- **Python reference:** [`unittest` — for the comparison table above](https://docs.python.org/3/library/unittest.html)
