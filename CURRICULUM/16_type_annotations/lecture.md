# Lecture 16: Type Annotations & Inference

You have been writing types since lecture 01 — `let count: number`, `function add(a: number, b: number): number`. This lecture is about the *system* behind them: where annotations go, when you do not need one, and the four special types that have no Python equivalent at all.

---

## 1. Where Annotations Go

```ts
// Variables
let count: number = 5;
const name: string = "Ada";

// Function parameters and return type
function add(a: number, b: number): number {
  return a + b;
}

// Arrow functions
const mul = (a: number, b: number): number => a * b;

// Object properties
const user: { name: string; age: number } = { name: "Ada", age: 30 };

// Arrays — two spellings, identical meaning
const nums: number[] = [1, 2, 3];
const nums2: Array<number> = [1, 2, 3];

// Tuples
const pair: [string, number] = ["Ada", 30];

// Class fields
class Dog {
  name: string = "";
}

// Union
let id: string | number = 1;

// Literal type
let direction: "north" | "south" = "north";
```

The syntax is always `name: Type`. Colons, not angle brackets after the name, and no type on the left of an assignment.

---

## 2. Inference — You Usually Do Not Need One

```ts
let count = 5;                  // inferred: number
const name = "Ada";             // inferred: "Ada" (the literal type! see section 5)
const nums = [1, 2, 3];         // inferred: number[]
const user = { name: "Ada", age: 30 };   // inferred: { name: string; age: number }

function add(a: number, b: number) {
  return a + b;                 // return type inferred: number
}
```

TypeScript infers a type from the initialiser whenever one is present, and it is good at it. The professional habit is the opposite of what most beginners expect: **annotate less, not more.**

Where an annotation is still worth writing:

| Annotate | Why |
|---|---|
| Function parameters | There is nothing to infer from — no initialiser |
| Exported function return types | The contract becomes explicit and errors stay inside the function |
| A variable declared without a value | `let x: number;` — otherwise it is implicitly `any` |
| Anything you want to *check* | `const n: number = "5"` fails on purpose |
| Complex generics | Inference can pick a worse type than you meant |

And where it is noise:

```ts
// Redundant — the initialiser already says this
const count: number = 5;
const name: string = "Ada";

// Worse than redundant — it HIDES a mistake
const users: { name: string }[] = [];
users.push({ name: "Ada", age: 30 });     // error, caught
// vs.
const users2 = [];                         // inferred: any[]
users2.push({ name: "Ada", age: 30 });     // no error — the type was lost
```

> **The empty array and empty object are the two cases where inference needs help**, because there is genuinely nothing to infer from. `const out: string[] = []` is worth the annotation.

---

## 3. The Four Special Types

### `any` — the off switch

```ts
const value: any = getStuff();
value.anything.at.all();       // no checking whatsoever
value()                        // calls it
value.nonsense.deep.property;  // fine
```

`any` disables type checking for that value and **everything derived from it**. A single `any` spreads: `const x: any = ...; const y = x.foo.bar;` — `y` is also `any`.

It is a hole in the type system, and the flag `noImplicitAny` (included in `strict`) makes sure you never create one *by accident*. An explicit `any` is sometimes pragmatic — during a migration, or at a genuinely untyped boundary — but it should be a decision, not a default, and it should be narrow.

```ts
// What people write when they are stuck
const data: any = await response.json();

// What they should write — see 10_files_json section 6
const data: unknown = await response.json();
```

### `unknown` — the safe top type

`unknown` accepts any value, exactly like `any` — but you can do **nothing** with it until you have proved what it is:

```ts
const value: unknown = await response.json();

value.name;                                    // error — object is of type 'unknown'
value.toUpperCase();                           // error
value();                                       // error
value.length;                                  // error

if (typeof value === "string") {
  value.toUpperCase();                         // fine — narrowed
}
```

Anything goes *in*; nothing comes *out* without a check. That is exactly the behaviour you want for data crossing a boundary — JSON from a file, an HTTP body, `process.env` — and it is why `unknown` is the type to reach for.

> **`any` is permission to do anything. `unknown` is permission to do nothing.** Everywhere you were about to write `any` at a boundary, write `unknown` and then narrow. This is the single highest-value habit in this lecture.

### `never` — the empty type

`never` is the type that has **no values**. A function that never returns has return type `never`:

```ts
function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

The compiler also uses it for impossible states, which makes it the tool for exhaustive checking:

```ts
type Shape = { kind: "circle" } | { kind: "square" };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return 3.14;
    case "square": return 1;
    default:
      // If a new variant is added to Shape and not handled here...
      const exhaustive: never = shape;     // ...THIS line becomes an error
      throw new Error(`unhandled shape: ${JSON.stringify(exhaustive)}`);
  }
}
```

Add `| { kind: "triangle" }` to `Shape` and the `default` branch fails to compile, pointing at exactly the place that needs updating. That is [23_advanced_types](../23_advanced_types/lecture.md) territory, and it is one of the genuinely great things about this type system.

### `void` — returns nothing useful

```ts
function log(message: string): void {
  console.log(message);
  // no return statement
}
```

`void` means "this function's result should not be used". A `void` function may still `return;` early — it just cannot return a value.

| Type | Accepts | You may use it as |
|---|---|---|
| `any` | everything | anything |
| `unknown` | everything | nothing (until narrowed) |
| `never` | nothing | (only as a function's return) |
| `void` | n/a | nothing |

---

## 4. Type Assertions — and Their Danger

```ts
const value: unknown = "hello";
const str = value as string;        // "I know better than you"
str.toUpperCase();

const el = document.getElementById("app") as HTMLDivElement;
```

`as` performs **no check and no conversion**. It does not verify, does not validate, and has no runtime effect at all — it is erased. It only changes what the compiler believes.

```ts
const n = "hello" as unknown as number;   // legal. n is a string at runtime.
n.toFixed(2);                              // compiles. Throws at runtime.
```

Every double assertion (`as unknown as T`) is a sign that the types genuinely do not fit and the code is lying. Sometimes that is necessary — when you know more than the compiler — but it deserves a comment explaining why.

### The two legitimate uses

```ts
// 1. Narrowing a DOM type, where you genuinely know better
const input = document.querySelector("#name") as HTMLInputElement;
input.value;

// 2. After a runtime check the compiler cannot see
if (isUser(raw)) {
  return raw;                  // narrowing already did this — no assertion needed
}
```

> **Prefer `satisfies` to `as`.** `satisfies` checks a value against a type *and* keeps the narrower inferred type, while `as` overwrites the type without checking. The difference matters a great deal:

```ts
const config = { port: 8080 } as { port: number };      // widened — config.port is number, not 8080
const config2 = { port: 8080 } satisfies { port: number };  // checked — config2.port is still 8080
```

`satisfies` is covered in [20_utility_types](../20_utility_types/lecture.md).

### The non-null assertion `!`

```ts
const el = document.querySelector("#app")!;    // "trust me, it is not null"
```

A postfix `!` removes `null` and `undefined` from a type without checking. It is a **runtime crash waiting to happen**: if the value is null, you get a `TypeError` at that line rather than a compile error. Use it sparingly, and prefer a real check:

```ts
const el = document.querySelector("#app");
if (!el) throw new Error("#app is missing");
el.textContent = "found";      // narrowed properly, no `!`
```

The `assertDefined` helper from [12_modules_and_errors](../12_modules_and_errors/lecture.md) section 12 is the tidiest version of that pattern.

---

## 5. Literal Types and Widening

`const` and `let` infer *different* types from the same initialiser:

```ts
let a = "hello";     // inferred: string        — it could be reassigned to anything
const b = "hello";   // inferred: "hello"       — the literal type. It can never change.
```

`b` has the literal type `"hello"`, which is a type with exactly one value. That sounds useless until you use it for unions:

```ts
type Direction = "north" | "south" | "east" | "west";

let dir: Direction = "north";
dir = "up";                    // error — not one of the four
```

Objects widen too, unless you stop them:

```ts
const config = {
  method: "GET",               // inferred: string, NOT "GET"
};

// A function that only accepts "GET" or "POST" will reject it
function request(method: "GET" | "POST") {}
request(config.method);        // error: string is not assignable to "GET" | "POST"

// `as const` keeps the literal type
const config2 = { method: "GET" } as const;
request(config2.method);       // fine — the type is "GET"
```

`as const` makes every property `readonly` and every literal as narrow as possible. It is the standard way to define a table of constants:

```ts
const ROUTES = {
  home: "/",
  about: "/about",
} as const;

type Route = (typeof ROUTES)[keyof typeof ROUTES];   // "/" | "/about"
```

That `typeof`-over-an-object idiom is how you derive a union from a value instead of writing it twice. [20_utility_types](../20_utility_types/lecture.md) covers it properly.

---

## 6. Excess Property Checks

A subtle rule that helps more than it hurts:

```ts
type User = { name: string; age: number };

const a: User = { name: "Ada", age: 30, email: "x" };   // ERROR — email is unknown
```

Object literals assigned directly to a typed variable are checked **exactly** — no unknown properties. But the moment the value comes from a variable, the check relaxes:

```ts
const withExtra = { name: "Ada", age: 30, email: "x" };
const b: User = withExtra;      // no error! Structural typing permits the extra.
```

That inconsistency surprises people. The reason: a direct literal is almost always a mistake (a typo like `nmae` gets caught), while a value from elsewhere is usually an intentional superset. The check is there to catch typos, not to enforce exactness.

---

## 7. Types Are Erased

Everything in this lecture disappears when the code runs:

```ts
// TypeScript you write
function add(a: number, b: number): number { return a + b; }
const x: number = add(1, 2);
```

```js
// JavaScript that runs
function add(a, b) { return a + b; }
const x = add(1, 2);
```

Consequences worth holding on to, because they explain most of the "but it typechecked!" moments:

- **There is no runtime type checking.** A function annotated `(n: number)` will happily receive a string from JavaScript, from JSON, or from `any`.
- **You cannot branch on a type.** `if (typeof value === "number")` uses the *runtime* `typeof` operator, not the type system.
- **Two types with the same shape are the same type.** TypeScript is **structurally typed** — it compares shapes, not names. This is the opposite of Python's (and Java's) nominal typing, and it is the subject of [17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md).

```ts
type Point = { x: number; y: number };
type Coord = { x: number; y: number };

const p: Point = { x: 1, y: 2 };
const c: Coord = p;         // legal! Same shape, so the same type.
```

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Declare variables three ways: explicitly annotated, inferred from a literal, and declared without a value. Note which one requires an annotation.
2. Show the difference between `let x = "hi"` and `const x = "hi"` by hovering, then try to assign a different string to each.
3. Assign a value to `any`, then reach through three levels of nonexistent properties. Then do the same with `unknown` and read every error.
4. Write `fail(message): never` and an exhaustive switch with a `const exhaustive: never` default.
5. Annotate a `Direction` union and try to assign an invalid string.
6. Write `{ method: "GET" }` as a plain object and pass it to a function expecting `"GET" | "POST"`. Then add `as const` and explain the difference.
7. Trigger an excess property check with a direct literal, then assign the same value through a variable and explain why it is allowed.
8. Prove structural typing: define two type aliases with identical shapes and assign one to the other.
9. Cast a string to a number with `as unknown as number` and demonstrate the runtime failure.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- **Docs:** [TypeScript Handbook — Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- **Docs:** [TypeScript Handbook — `unknown` and `never`](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-unknown-type)
- **Docs:** [TypeScript — `noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny)
- **Article:** [The `any` problem](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — why `unknown` is the better default
- **Book:** [Programming TypeScript](https://www.oreilly.com/library/view/programming-typescript/9781492037644/) — Boris Cherny; chapter 3 is the best treatment of inference anywhere
