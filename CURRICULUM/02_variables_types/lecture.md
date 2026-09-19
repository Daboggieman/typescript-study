# Lecture 02: Variables & Types

A variable is a name attached to a value. In Python you just write `score = 95`. In TypeScript, before you can use a value well, you have to answer two questions about it: **which keyword declares it**, and **what kind of thing is it**.

---

## 1. Three Ways to Declare a Variable

```ts
const name = "Ada";     // cannot be reassigned
let score = 95;         // can be reassigned
var legacy = "old";     // do not use this one
```

| Keyword | Reassignable? | Scope | Use it when |
|---|---|---|---|
| `const` | No | block | **The default.** Anything that never needs to change |
| `let` | Yes | block | A value that genuinely changes: a counter, an accumulator |
| `var` | Yes | function | **Never.** It is the pre-2015 keyword, and its scoping rules leak |

```ts
const pi = 3.14159;
pi = 3;              // error TS2588: Cannot assign to 'pi' because it is a constant.
```

### `const` does not mean "frozen"

This trips up every Python developer, because Python has no equivalent. `const` stops you **rebinding the name**. It does not stop you **changing the thing the name points at**:

```ts
const scores = [95, 88, 71];
scores.push(100);          // perfectly legal — the array changed
scores = [1, 2, 3];        // error — the NAME was reassigned

const Student = { name: "Ada" };
Student.name = "Grace";    // legal — same object, different contents
Student = { name: "Ada" }; // error
```

> **The Python parallel you should *not* draw:** Python has no `const`, so people reach for `let` out of habit. Reach for `const` instead. When a name is `const`, reading the code tells you it never points somewhere new. Use `let` only when you actually reassign.

`Object.freeze(Student)` is the nearest thing to a truly immutable object, and even it is shallow — it stops `Student.name = ...` but not `Student.address.city = ...`.

---

## 2. The Primitive Types

TypeScript's types that map to JavaScript's primitive values:

| Type | Example | Notes |
|---|---|---|
| `string` | `"hello"`, `'hi'`, `` `hey` `` | One type for all text |
| `number` | `42`, `3.14`, `-0.5`, `NaN`, `Infinity` | **One type for both ints and floats** |
| `boolean` | `true`, `false` | |
| `null` | `null` | "deliberately empty" |
| `undefined` | `undefined` | "not set yet" |
| `bigint` | `9007199254740993n` | Arbitrary precision integers |
| `symbol` | `Symbol("id")` | Unique keys; rare in application code |

The one that matters most: **there is no `int` and no `float`.** Python's `int` and `float` are both `number`:

```ts
const count: number = 42;
const price: number = 42.5;
const zero: number = 0;
// All three are `number`. TypeScript cannot tell you an integer from a float.
```

### Where the numbers betray you

Because `number` is a 64-bit float underneath, the classic floating-point problem is *not* abstract in JavaScript — it is a daily fact:

```ts
console.log(0.1 + 0.2);                    // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);            // false
console.log(Number.MAX_SAFE_INTEGER);      // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1);  // 9007199254740992
console.log(Number.MAX_SAFE_INTEGER + 2);  // 9007199254740992  <-- wrong!
```

For money, work in integer cents. For anything past `MAX_SAFE_INTEGER`, use `bigint`. This is expanded in [RESOURCES/common_mistakes.md](../../RESOURCES/common_mistakes.md).

### `null` vs `undefined`

Python has exactly one "nothing" value, `None`. JavaScript has **two**, and the split is a historical accident you still have to reason about:

| | Means | Where it comes from |
|---|---|---|
| `undefined` | "no value was ever set" | Uninitialised variables, missing object properties, missing function arguments, functions with no `return` |
| `null` | "deliberately set to nothing" | You, explicitly. `const user = null;` |

```ts
let a: number;          // undefined — declared, never assigned
const b = {} as { id?: number };
console.log(b.id);      // undefined — the property is absent
function f() {}         // calling f() gives undefined — no return statement

let c: number | null = null;   // null — I am asserting "empty" on purpose
```

**The rule:** use `null` when *you* are clearing a value, and expect `undefined` when the language is telling you something is missing. Most confusion comes from tools handing you one when you meant the other. Lesson [18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md) is largely about handling this pair safely, and the `strict` flag in [21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) exists to stop `null` and `undefined` from sneaking into places you did not allow.

---

## 3. Strings and Template Literals

```ts
const name = "Ada";
const greeting = "Hello, " + name + "!";        // concatenation — the old way
const better = `Hello, ${name}!`;               // template literal — the good way
const maths = `2 + 2 = ${2 + 2}`;               // any expression, not just a variable
const multi = `line one
line two`;                                       // multi-line, no escape needed
```

Backticks are the direct replacement for Python's f-strings, and they are strictly more powerful — `${...}` accepts any expression, which is a trap as much as a feature:

```ts
console.log(`${[1, 2, 3]}`);       // "1,2,3"      — array joins itself
console.log(`${null}`);            // "null"
console.log(`${undefined}`);       // "undefined"
console.log(`${1 / 0}`);           // "Infinity"
```

> **Best practice:** interpolate variables and simple expressions. The moment you are writing `${a ? b : c}` twice in one string, build the value first and interpolate that.

### Useful string facts

```ts
"Hello".length              // 5      — a PROPERTY, not a method. No ()!
"Hello".toUpperCase()       // "HELLO"
"  pad  ".trim()            // "pad"
"a,b,c".split(",")          // ["a", "b", "c"]
"Hello".includes("ell")     // true
"Hello".indexOf("l")        // 2      — -1 when not found
"Hello"[1]                  // "e"    — indexable like a Python str
```

`length` without parentheses is the one that catches everyone coming from Python's `len(s)`. `"Hello".length()` is an error: *not callable*.

---

## 4. Type Conversion

JavaScript converts between types with functions, and unlike `str()` and `int()` in Python, the results can be surprising:

```ts
Number("42")         // 42
Number("42abc")      // NaN     <-- no exception, just NaN
Number("")           // 0       <-- the empty string is zero
Number(true)         // 1
Number(null)         // 0
Number(undefined)    // NaN
Number("  7  ")      // 7

String(42)           // "42"
Boolean(0)           // false
Boolean("")          // false
Boolean("false")     // true    <-- non-empty string! A classic bug
```

### Prefer the explicit parsers

`parseInt` and `parseFloat` stop at the first invalid character instead of giving up entirely, which is usually what you want for user input:

```ts
parseInt("42px", 10)         // 42     — the 10 is the base. ALWAYS pass it.
parseFloat("3.14abc")        // 3.14
parseInt("abc", 10)          // NaN
Number("42px")               // NaN    — all-or-nothing, unlike parseInt
```

> **Always pass the base to `parseInt`.** `parseInt("08")` used to be interpreted as octal in old engines. The two-argument form is not optional style, it is correctness.

Because neither function raises, you must check for `NaN` yourself — and `NaN` has a property that breaks the obvious check:

```ts
const n = Number("abc");
if (n === NaN) { }            // NEVER true. NaN is not equal to anything, including itself.
if (Number.isNaN(n)) { }      // Correct.
```

---

## 5. `typeof` — Checking a Type at Runtime

```ts
typeof "hello"       // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof Symbol()      // "symbol"
typeof 42n           // "bigint"
typeof {}            // "object"     <-- objects, arrays AND null, all one word
typeof []            // "object"     <-- not "array". Use Array.isArray().
typeof function () {}// "function"
typeof null          // "object"     <-- a 30-year-old bug, never fixed
```

The last line is not a typo and it is not a TypeScript problem — it is in the language specification forever, because too much code depends on it. The fix:

```ts
const value: unknown = null;
if (value === null) {
  console.log("it is null");
} else if (Array.isArray(value)) {
  console.log("it is an array");
} else if (typeof value === "object") {
  console.log("it is a non-null, non-array object");
}
```

> **The takeaway:** `typeof` is a runtime JavaScript operator, not a TypeScript one. It sees the *value*, and only knows eight crude buckets. The `typeof` *type* operator, which is a different thing wearing the same name, appears in [17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md).

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Declare a `const` named `score` holding `95`, print it, then try to reassign it. Read the error number (TS2588).
2. Declare a `gpa` of `3.8` and print it alongside `typeof gpa`. Confirm TypeScript calls it a `number`, and reason about why it cannot tell you it is a float.
3. Declare an `isWeekend` boolean. Print it, and print `typeof isWeekend`.
4. Take the string `"49.99"`, convert it to a number, double it, and print the result. Then try the same with `"49.99 dollars"` using `Number()` and again with `parseFloat()`. Explain the difference in a comment.
5. Write a `const` object with one property, mutate that property, then try to rebind the whole object. Note which line errors and which does not.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- **MDN:** [JavaScript Data Types and Data Structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- **MDN:** [JavaScript Equality and Sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- **YouTube:** [Net Ninja — TypeScript Tutorial Playlist](https://www.youtube.com/playlist?list=PL4cUxeGkcC9gUgr39Q_yD6v-bSyMwKPUI)
- **Article:** [You Don't Know JS Yet — Types & Grammar](https://github.com/getify/You-Dont-Know-JS) — for when you want the full truth about coercion
