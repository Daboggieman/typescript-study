# Lecture 02c: Operators

TypeScript inherits JavaScript's operators wholesale. Most look familiar from Python, a few are genuinely new, and **one of them is a famous trap** that this lecture exists largely to defuse.

---

## 1. Arithmetic

```ts
let n = 10;

n + 3     // 13
n - 3     // 7
n * 3     // 30
n / 3     // 3.3333333333333335   <-- always float division
n % 3     // 1                     the remainder
n ** 3    // 1000                  exponent, same as Python
-n        // -10
```

The difference from Python that matters: **there is no integer division operator.**

```python
# Python
7 // 2      # 3
```

```ts
// TypeScript
Math.floor(7 / 2)     // 3   — rounds toward negative infinity
Math.trunc(7 / 2)     // 3   — rounds toward zero
7 / 2                 // 3.5 — just division
```

For negatives these differ, and picking the wrong one is a real bug:

```ts
Math.floor(-7 / 2)    // -4   — floor goes down
Math.trunc(-7 / 2)    // -3   — truncation goes toward zero
```

### Assignment shortcuts

```ts
let total = 0;
total += 5;      // total = total + 5
total -= 2;
total *= 3;
total /= 2;
total %= 4;
total **= 2;
```

**There is no `++` in Python, and there *is* one in JavaScript:**

```ts
let i = 0;
i++;      // returns 0, then i becomes 1   — post-increment
++i;      // i becomes 1, returns 1        — pre-increment
```

> **Style note:** prefer `i += 1`. The difference between `i++` and `++i` only shows up when the value is *used* in the same expression (`arr[i++]`, `f(i++)`), where it is a genuine readability hazard. The expression forms exist; you rarely need them.

---

## 2. Comparison — and the Big One

```ts
1 == "1"        // true      <-- LOOSE equality. Avoid.
1 === "1"       // false     <-- STRICT equality. Always use this.
0 == ""         // true
0 == false      // true
null == undefined  // true
null === undefined // false
NaN === NaN     // false     <-- not even equal to itself
```

`==` performs **type coercion**: it converts the operands to a common type and then compares. That is where every result above comes from, and it is why the rule is simple:

> **Always use `===` and `!==`. Never `==` or `!=`.**

There is exactly one idiomatic exception, and it is debated:

```ts
if (value == null) { }        // true for BOTH null and undefined — a useful shorthand
if (value === null || value === undefined) { }   // the explicit version, longer but clearer
```

The shorthand works because `==` treats that one pair as equal. Many codebases ban `==` outright and use `value ?? ` checks instead; both are defensible. Never use `==` for anything else.

### Comparing objects

`===` on objects compares **references**, never contents:

```ts
const a = { id: 1 };
const b = { id: 1 };
const c = a;

a === b     // false — two different objects that happen to look alike
a === c     // true  — the same object
```

Same for arrays. `[1,2] === [1,2]` is `false`. To compare contents, compare a serialisation (`JSON.stringify(a) === JSON.stringify(b)` — fast, but order-sensitive) or compare field by field.

### Truthiness

Every value is either truthy or falsy in a boolean context. The falsy list is short and worth memorising:

```ts
// FALSY — only these eight
false, 0, -0, 0n, "", null, undefined, NaN

// EVERYTHING ELSE IS TRUTHY, including:
"0"          // truthy! a non-empty string
"false"      // truthy!
[]           // truthy! an empty array
{}           // truthy! an empty object
-1           // truthy
```

That third group is the difference from Python, where `[]` and `{}` are falsy:

```python
# Python
if []:      # does NOT run
```

```ts
// TypeScript
if ([]) { }        // DOES run — the array is an object, objects are truthy
if (arr.length) { } // what you actually meant
```

> **Rule:** never rely on truthiness for arrays or objects. `if (arr.length > 0)` and `if (Object.keys(obj).length > 0)` say what you mean.

---

## 3. Logical Operators

```ts
a && b      // AND
a || b      // OR
!a          // NOT
```

These **short-circuit** and **return an operand**, not a boolean — exactly like Python's `and`/`or`:

```ts
const name = inputName || "anonymous";    // "anonymous" if inputName is falsy
const port = configuredPort || 3000;      // 3000 if undefined
```

That idiom is everywhere and it has a bug built in: `||` fires on **every** falsy value, including `0` and `""`, which are often perfectly good values.

```ts
const count = 0;
const result = count || 10;      // 10  <-- wrong, if you meant "0 is a valid count"
```

### The nullish coalescing operator `??`

`??` is the fix, and it only falls back on `null` and `undefined`:

```ts
const count = 0;
count || 10      // 10   — treats 0 as missing
count ?? 10      // 0    — correct: 0 was supplied

const empty = "";
empty || "default"    // "default"
empty ?? "default"    // ""        — correct
```

| Expression | Falls back when the left side is |
|---|---|
| `a \|\| b` | any falsy value (`0`, `""`, `NaN`, `null`, `undefined`, `false`) |
| `a ?? b` | only `null` or `undefined` |

> **When in doubt, `??`.** It does what you meant by "use this, or else that". Reach for `||` only when you genuinely want falsy-as-missing.

You cannot mix them without parentheses — `a ?? b || c` is a syntax error, precisely because the intent is unclear.

### Optional chaining `?.`

Access a property that might not exist without crashing:

```ts
const user = getUser();               // could be null

user.name                  // TypeError: Cannot read properties of null
user?.name                 // undefined — no error

user?.address?.city        // safe all the way down
user?.greet()              // only calls greet if user exists
arr?.[0]                   // safe index access
```

Combined with `??`, this is the standard way to read nested optional data:

```ts
const city = user?.address?.city ?? "unknown";
```

Note the difference between `?.` and `??`: `?.` guards **access**, `??` supplies a **fallback**. They are constantly used together and are not interchangeable.

---

## 4. The Ternary Operator

Python's conditional expression reads `x if cond else y`. JavaScript puts the condition first:

```ts
const label = age >= 18 ? "adult" : "minor";
```

Which is Python's:

```python
label = "adult" if age >= 18 else "minor"
```

Same meaning, reversed order — a small thing that catches people out for weeks. Nesting is legal but hard to read:

```ts
// Works, but reconsider
const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";
```

Prefer a lookup table or an `if`/`else` chain once you pass two branches.

---

## 5. Bitwise Operators

Rare in application code, common in DSA problems and permission flags. They operate on 32-bit integers.

```ts
5 & 3      // 1     AND
5 | 3      // 7     OR
5 ^ 3      // 6     XOR
~5         // -6    NOT (two's complement)
5 << 1     // 10    left shift  = multiply by 2
5 >> 1     // 2     arithmetic right shift (sign-preserving)
5 >>> 1    // 2     unsigned right shift
```

`>>>` has no Python equivalent — Python's `>>` on a negative number behaves differently. The practical idiom you will actually meet:

```ts
// Is a number even? (n & 1 is 1 for odd, 0 for even)
const isEven = (n: number) => (n & 1) === 0;

// Halve a positive integer fast
const half = n >> 1;
```

> **Caution:** bitwise operators force their operands to 32-bit integers. `2147483648 | 0` is `-2147483648`. Do not use them on large numbers.

---

## 6. `in`, `instanceof`, and `delete`

```ts
const point = { x: 1, y: 2 };

"x" in point                    // true   — is this KEY present
"toString" in point             // true   — includes inherited properties!
Object.hasOwn(point, "x")       // true   — own properties only. Prefer this.

class Animal {}
const a = new Animal();
a instanceof Animal             // true   — class check

delete point.y;                 // removes a property. Returns true/false.
delete arr[0];                  // DOES NOT remove from an array — it leaves a hole!
```

`delete arr[0]` is a Python `del` lookalike that does not do what you want: the array keeps its length and gains an `undefined` slot. For arrays use `splice` or `filter`.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Predict the result of `1 == "1"`, `1 === "1"`, `0 == ""`, `null == undefined`, `NaN === NaN`, then check.
2. Show the difference between `||` and `??` using `0` and `""` as the left operand.
3. Use optional chaining to safely read a two-level nested property off an object that is `null`.
4. Write a function using `?.` and `??` together that returns a user's city or `"unknown"`.
5. Convert Python's `x if cond else y` and `7 // 2` into TypeScript, and check both for a negative number.
6. Demonstrate the `[]` truthiness difference: show that `if ([])` runs while `if (arr.length)` does not, for an empty array.

---

## 📚 Resources

- **MDN:** [Expressions and operators (full reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators)
- **MDN:** [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- **MDN:** [Nullish coalescing operator `??`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- **MDN:** [Optional chaining `?.`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- **Article:** [JavaScript Equality Table](https://dorey.github.io/JavaScript-Equality-Table/) — every `==` result, in one grid. Worth thirty seconds.
