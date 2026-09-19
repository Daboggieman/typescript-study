# Lecture 06: Control Flow

Control flow decides which code runs. The shapes are the same as Python — `if`, `else if`, `switch`, `try` — but the punctuation is not, and JavaScript adds a few branches Python has only recently acquired.

---

## 1. `if` / `else if` / `else`

```ts
const age = 20;

if (age >= 18) {
  console.log("adult");
} else if (age >= 13) {
  console.log("teenager");
} else {
  console.log("child");
}
```

Three syntactic differences from Python, all of which will bite you in the first hour:

| Python | TypeScript |
|---|---|
| `if x > 5:` — colon, indentation | `if (x > 5) {` — parentheses required, braces required |
| `elif` | `else if` (two words) |
| `and`, `or`, `not` | `&&`, `\|\|`, `!` |

**The parentheses are mandatory.** `if age >= 18 {` is a syntax error in JavaScript. So are the braces on multi-line bodies — unlike Python, indentation means nothing to the compiler, so omitting braces is legal but dangerous:

```ts
if (age >= 18)
  console.log("adult");
  console.log("this ALWAYS runs");    // not part of the if! Misleading indentation.
```

> **Always write braces.** They are the only thing marking the block. Relying on indentation is the one place where Python's model is strictly safer.

### Truthiness

The falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else — **including `[]` and `{}`** — is truthy. See [02c_operators](../02c_operators/lecture.md) section 2 for the full table.

---

## 2. `switch`

```ts
const command = "start";

switch (command) {
  case "start":
    console.log("starting");
    break;
  case "stop":
  case "halt":                  // fall-through: both go to the same block
    console.log("stopping");
    break;
  default:
    console.log("unknown command");
}
```

Three things to know:

1. **`break` is not optional.** Without it, execution falls through to the next case. This is the classic bug:

```ts
switch (n) {
  case 1:
    console.log("one");        // no break!
  case 2:
    console.log("two");        // runs for n === 1 too
    break;
}
```

2. **Comparisons are strict (`===`).** `switch (1)` will not match `case "1":`.
3. **`case` values must be constants**, and the compiler checks them against the switched type. A typo in a case for a union type is a compile error rather than a silent no-op — one of the places TypeScript pays for itself.

The `noFallthroughCasesInSwitch` flag in `tsconfig.json` makes an accidental fall-through a compile error while still allowing the deliberate grouping shown above, where the case has no statements. It is already on in this repo.

### `switch (true)` — the range idiom

`switch` only does equality, so ranges need a trick:

```ts
switch (true) {
  case score >= 90: return "A";
  case score >= 80: return "B";
  default:          return "F";
}
```

It reads well enough, but a plain `if`/`else if` chain is clearer for conditions. Use `switch` for discrete values.

---

## 3. The Ternary Operator

```ts
const label = age >= 18 ? "adult" : "minor";
```

Python's equivalent reads backwards (`"adult" if age >= 18 else "minor"`), and it is worth repeating from [02c_operators](../02c_operators/lecture.md) because the reversal causes real mistakes. Nested ternaries compile but are hard to read; prefer a lookup:

```ts
const LABELS = { A: "excellent", B: "good", F: "failed" } as const;
const label = LABELS[grade] ?? "unknown";
```

---

## 4. `try` / `catch` / `finally`

```ts
try {
  const data = JSON.parse(raw);
  console.log(data);
} catch (error) {
  console.error("parse failed:", error);
} finally {
  console.log("runs whether or not it threw");
}
```

The syntax differs from Python in more than punctuation:

| Python | TypeScript |
|---|---|
| `try:` / `except ValueError as e:` | `try { } catch (error) { }` — no colon, braces required |
| `except ValueError:` — typed per exception | **one `catch` for everything.** No type matching. |
| `finally:` | `finally { }` — same meaning |
| `raise` | `throw` |
| exceptions are objects/classes | **you can throw anything** — `throw "a string"`, `throw 42` |
| `try/except/else` | no `else` clause |

### The `unknown` catch variable

In TypeScript the caught value is typed `unknown`, not `Error`:

```ts
try {
  risky();
} catch (error) {
  // error is `unknown` — you cannot read .message yet
  if (error instanceof Error) {
    console.error(error.message);       // now it is safe
  } else {
    console.error("Non-Error thrown:", error);
  }
}
```

This is correct and deliberate: JavaScript lets any value be thrown, so assuming an `Error` is a lie the compiler refuses to tell. **Always narrow with `instanceof Error` before touching `.message`.** The full treatment — custom error classes, `cause`, `AggregateError` — is in [12_modules_and_errors](../12_modules_and_errors/lecture.md).

### `finally` and early return

`finally` runs even when the `try` block returns, and it can override the return value:

```ts
function f() {
  try {
    return "try";
  } finally {
    return "finally";       // this wins. Legal, but a terrible idea.
  }
}
f();     // "finally"
```

Use `finally` for cleanup only — closing files, releasing locks. Never for control flow.

---

## 5. Guard Clauses — Worth Adopting

Deeply nested `if`s are the same problem in every language. The fix is the **early return**:

```ts
// Nested — the real work is buried
function processOrder(order: Order | null) {
  if (order) {
    if (order.items.length > 0) {
      if (order.paid) {
        return ship(order);
      } else {
        throw new Error("unpaid");
      }
    } else {
      throw new Error("empty");
    }
  } else {
    throw new Error("no order");
  }
}

// Guard clauses — the real work is at the top level
function processOrder(order: Order | null) {
  if (!order) throw new Error("no order");
  if (order.items.length === 0) throw new Error("empty");
  if (!order.paid) throw new Error("unpaid");

  return ship(order);
}
```

The second version has no nesting at all, and the happy path is the last line rather than the deepest one. **TypeScript rewards this style heavily**, because after `if (!order) throw ...`, the compiler knows `order` is non-null for the rest of the function. Guard clauses are how you make the type system work for you instead of fighting it — this is the core idea of [18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md).

---

## 6. `??` and `?.` in Conditions

Both appear constantly in branching, so a reminder of which is which:

```ts
// ?? supplies a fallback when the left is null or undefined
const port = config.port ?? 3000;

// ?. guards the ACCESS, yielding undefined instead of throwing
const city = user?.address?.city;

// Together
if (user?.address?.country === "UK") { }

// || falls back on ANY falsy value — including 0 and ""
const size = config.size || 12;     // bug when size is legitimately 0
const size2 = config.size ?? 12;    // correct
```

You cannot mix `??` with `||` or `&&` without parentheses: `a ?? b || c` is a syntax error, because the intent is ambiguous. `(a ?? b) || c` and `a ?? (b || c)` are both legal. That restriction is a feature — it forces you to say what you meant.

---

## 7. The `satisfies` Aside

Not control flow, but it belongs near the `as const` patterns above and comes up when branching on config:

```ts
const ROUTES = {
  home: "/",
  about: "/about",
} satisfies Record<string, string>;

ROUTES.hom;      // error — caught! `satisfies` keeps the literal keys
```

`as const` and `satisfies` are covered properly in [20_utility_types](../20_utility_types/lecture.md).

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write an `if`/`else if`/`else` chain grading a score into A/B/C/F. Then translate a Python `elif` chain into it and note every punctuation change.
2. Show that omitting braces around a two-statement body changes which line is conditional. Print both ways.
3. Write a `switch` on a command string, then deliberately remove a `break` and observe the fall-through.
4. Use the `switch (true)` range idiom, and then rewrite it as guard clauses.
5. Wrap a `JSON.parse` of invalid text in `try`/`catch`, narrow with `instanceof Error`, and print `.message` safely. Then `throw` a plain string and catch it, to prove non-Errors are possible.
6. Rewrite a three-level-nested `if` into flat guard clauses.
7. Demonstrate `||` vs `??` inside a condition using `0` as the value.

---

## 📚 Resources

- **MDN:** [Control flow and error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- **MDN:** [`switch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)
- **MDN:** [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- **Docs:** [TypeScript — `useUnknownInCatchVariables`](https://www.typescriptlang.org/tsconfig#useUnknownInCatchVariables) — why `catch` gives you `unknown`
- **Article:** [Replace Nested Conditional with Guard Clauses](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html) — the refactoring catalogue entry; short and worth reading
