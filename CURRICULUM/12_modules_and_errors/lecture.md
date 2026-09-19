# Lecture 12: Modules & Errors

Two subjects that share a lecture because they are the two things that go wrong at the *seams* of a program. Modules are how you split code across files and hold the seams together; errors are what escapes when a seam fails.

---

# Part 1 — Modules

## 1. Why Modules Exist

Without modules, every file shares one global scope. Two files that both define `helper` collide, load order decides what works, and nothing can be reused without copy-paste. Modules give each file its **own scope** and an **explicit list of what it shares**.

A file is a module in TypeScript when it has a top-level `import` or `export`. `moduleDetection: "force"` (set in this repo's `tsconfig.json`) makes *every* file a module regardless — the C-era behaviour where a file with no imports silently pollutes the global scope is a bug factory, and forcing module mode removes it.

---

## 2. Exports

```ts
// math.ts

export function add(a: number, b: number): number { return a + b; }
export const PI = 3.14159;
export class Vector { }
export type Point = { x: number; y: number };

// Or declare first, export at the end — equivalent, and easier to scan
function subtract(a: number, b: number): number { return a - b; }
const E = 2.71828;
export { subtract, E };
```

### Default exports

```ts
// logger.ts
export default function log(message: string): void {
  console.log(message);
}
```

```ts
// anywhere
import log from "./logger.js";        // no braces — the name is YOUR choice
import whatever from "./logger.js";   // legal, and terrible
```

**Prefer named exports.** Default exports have three real costs:

1. **The name is whatever the importer decides**, so grep cannot find usages and refactoring tools cannot rename them.
2. **They encourage one-export files that then need an index**, multiplying files for no benefit.
3. **Automatic imports are worse** — the editor has to guess a name for something unnamed.

The one place a default export is conventional is a framework's entry point (a React component file, for instance). Everything in this repo uses named exports.

### Renaming on import or export

```ts
import { add as sum } from "./math.js";
export { add as plus } from "./math.js";
```

Useful for resolving collisions, and a smell when overused.

---

## 3. Imports, and the `.js` Extension Rule

```ts
import { add, PI } from "./math.js";
import { add } from "../utils/math.js";
import { writeFile } from "node:fs/promises";       // built-in modules
import path from "node:path";                        // a built-in DEFAULT export
import { z } from "zod";                             // a package from node_modules
```

**The `.js` extension on a relative import is not a typo.** This repo compiles with `moduleResolution: "NodeNext"`, which follows Node's real ES module rules. Node does not do extension guessing: it loads the file you named, and after compilation the file *is* `math.js`. So `./math.js` is what you write, and TypeScript resolves it back to `math.ts` while you are editing.

Three ways people get this wrong:

```ts
import { add } from "./math";        // error: relative import needs an extension
import { add } from "./math.ts";     // error: import paths may not end in .ts
import { add } from "math";          // not an error — it looks in node_modules and fails at RUNTIME
```

That last one is the dangerous case: it typechecks as a bare package specifier and then fails when the program runs. If your import is not resolving, check the `./` and the `.js` first.

> **Why the awkwardness?** Because this repo is configured to emit JavaScript that Node can actually run. Other setups — bundlers like Vite, or `moduleResolution: "bundler"` — let you omit the extension, because the bundler resolves files itself. Both are legitimate; you need to know which one you are in. `21_tsconfig_deep_dive` covers the trade-off.

---

## 4. `import type` and Type-Only Imports

Types vanish at runtime. That creates a question: when you import a type, is there anything left to import?

```ts
import type { Point } from "./shapes.js";     // erased entirely at runtime
import { createPoint, type Point } from "./shapes.js";   // mixed — inline `type`
```

`verbatimModuleSyntax` is on in this repo, which means **the distinction is enforced**: importing a type without `type` is an error.

```ts
// error under verbatimModuleSyntax — `Point` is a type, not a value
import { Point } from "./shapes.js";
```

This is worth having, because the alternative behaviour is a silent lie:

```ts
import { Point } from "./shapes.js";
// ...compiles. At runtime, Point is undefined, because nothing was ever exported under
// that name — the thing in shapes.ts was a type, and types do not survive compilation.
```

With `verbatimModuleSyntax`, a type-only import must say `type`, so the compiler can delete it cleanly and the runtime has nothing to resolve. The rule is mechanical: **if you only use the symbol in type positions, write `import type`.**

---

## 5. Barrel Files and Re-exports

```ts
// shapes/index.ts — a "barrel"
export { Circle } from "./circle.js";
export { Square } from "./square.js";
export type { Shape } from "./types.js";
export * from "./constants.js";        // everything from a module
```

A barrel lets consumers import from one place:

```ts
import { Circle, Square } from "./shapes/index.js";
```

**Use them sparingly.** A barrel makes every consumer depend on every module behind it, which hurts tree-shaking (dead-code elimination) and can create import cycles. For a small library of related types they are convenient; for a large codebase, importing the specific module directly is usually better.

---

## 6. Dynamic `import()`

A static `import` is resolved before the program runs. A dynamic `import()` is a function call that loads a module **at that moment**, returning a promise. This is JavaScript's answer to Python's `importlib.import_module`.

```ts
const module = await import("./heavy.js");
module.doWork();

// With a known name
const { doWork } = await import("./heavy.js");
```

Why you would:

```ts
// 1. Load a plugin chosen at runtime
async function loadFormat(name: string) {
  const formats: Record<string, () => Promise<unknown>> = {
    json: () => import("./formats/json.js"),
    csv: () => import("./formats/csv.js"),
  };
  const loader = formats[name];
  if (!loader) throw new Error(`unknown format: ${name}`);
  return loader();
}

// 2. Defer an expensive module until it is actually needed
if (needsReport) {
  const { generateReport } = await import("./report.js");
  await generateReport();
}

// 3. Read JSON without the import assertion dance
const data = (await import("./config.json", { with: { type: "json" } })).default;
```

A dynamic import whose path is a **variable** cannot be typechecked or bundled reliably:

```ts
const name = "circle";
await import(`./shapes/${name}.js`);     // works at runtime, but the compiler
                                          // cannot see what this might load
```

Prefer a lookup table of literal imports, as in the first example, so the analyser can see every possibility.

---

## 7. Circular Imports

Two modules that import each other are legal but produce genuinely confusing failures: one of them receives a partially-initialised module, so a symbol is `undefined` at the moment it is used, even though it is defined a few lines later.

```ts
// a.ts
import { b } from "./b.js";
export const a = "a";
console.log(b);          // might be undefined, depending on which loaded first

// b.ts
import { a } from "./a.js";
export const b = "b";
```

Fix it by extracting the shared piece into a third module both can import, or by using a dynamic `import()` at the point of use so the load is deferred. TypeScript will not warn you — detecting cycles is a job for tooling.

---

# Part 2 — Errors

## 8. `Error` in JavaScript

```ts
throw new Error("something went wrong");
```

An `Error` has three useful properties:

```ts
const err = new Error("failed to load");

err.message;      // "failed to load"
err.name;         // "Error"
err.stack;        // the stack trace, as a string

err instanceof Error;    // true
```

**You can throw anything.** JavaScript does not restrict what goes in a `throw`:

```ts
throw "a string";        // legal, terrible
throw 42;                // legal, terrible
throw { code: "E_FAIL" }; // legal, terrible
```

Do not. Throwing a non-`Error` means no stack trace, no `message`, and every caller must be written defensively. **Always throw an `Error` subclass.**

---

## 9. Custom Error Classes

```ts
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "ValidationError";        // without this, name is "Error"
  }
}

export class NotFoundError extends Error {
  constructor(public readonly id: number) {
    super(`no record with id ${id}`);
    this.name = "NotFoundError";
  }
}
```

Two details that are easy to miss:

1. **`this.name = "ValidationError"`.** The `name` property does not update itself. Without the assignment, `err.name` is `"Error"` for every subclass, and your logs lie.
2. **`super(message)` must come first**, before any use of `this` — the same rule as a subclass constructor in [09_classes_oop](../09_classes_oop/lecture.md).

Then you catch by class:

```ts
try {
  validate(input);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`bad field: ${error.field}`);     // `field` is available
  } else if (error instanceof NotFoundError) {
    console.error(`missing: ${error.id}`);
  } else {
    throw error;
  }
}
```

`instanceof` narrows the type, so `error.field` is legal inside that branch. This is the discriminated-union pattern from [18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md), applied to errors — and it is exactly how you replace Python's `except ValidationError as e:`.

### `cause` — preserving the original failure

```ts
try {
  await loadConfig();
} catch (error) {
  throw new Error("failed to start the server", { cause: error });
}
```

The wrapped error's `cause` is the original, so the full trail survives:

```ts
err.cause;          // the original error, or undefined
```

Without `cause`, wrapping an error destroys the reason it happened. Python's `raise ... from e` is the direct equivalent, and the same advice applies: **when you catch and re-throw, always attach the cause.**

---

## 10. `AggregateError`

When several operations run at once and more than one fails, `Promise.any` and `AggregateError` collect them:

```ts
try {
  await Promise.any([fetchA(), fetchB(), fetchC()]);
} catch (error) {
  if (error instanceof AggregateError) {
    console.error(`${error.errors.length} failures`);
    for (const e of error.errors) console.error(" -", e);
  }
}
```

`error.errors` is the array of individual failures. Rare in application code, common in infrastructure and retry logic.

---

## 11. Errors Are Not Results

The mistake to avoid, which is the same in every language:

```ts
// WRONG — swallowing the error
try {
  const data = JSON.parse(raw);
  return data;
} catch (error) {
  console.log("oh well");
  return {};              // the caller cannot tell success from failure
}
```

The function now has two paths and one exit, and the caller has no idea which one it took. The empty object flows onward and fails somewhere unrelated, with no trace of the real cause.

Three legitimate designs, in order of preference:

```ts
// 1. Let it propagate. The caller knows best.
function parseUser(raw: string): User {
  return JSON.parse(raw) as User;
}

// 2. Convert to a value the type system tracks: T | null
function tryParseUser(raw: string): User | null {
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;                    // "absent" is a real outcome, and it is typed
  }
}

// 3. Convert to an explicit result object — the Python/Rust style
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

function parseUserResult(raw: string): Result<User> {
  try {
    return { ok: true, value: JSON.parse(raw) as User };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
```

What all three have in common: **the failure is visible in the return type.** A caller cannot forget it. Compare that with the `catch`-and-return-`{}` version, where the type says `User` and that is a lie.

---

## 12. Throwing Safely: Assertion Functions

A guard clause that throws is so common that TypeScript has syntax for it:

```ts
function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${name} is missing`);
  }
}

const user: User | null = await findUser(1);
assertDefined(user, "user");
user.name;         // fine — after the call, the compiler knows it is not null
```

`asserts value is T` tells the compiler that when the call returns normally, the condition holds. This is how you turn a runtime check into a compile-time guarantee — and how you avoid sprinkling `!` across the rest of the function. Covered properly in [23_advanced_types](../23_advanced_types/lecture.md).

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder, and the two helper modules next to it:

1. Export a `multiply` function from `helpers.ts` and import it here. Remember the `.js` extension.
2. Add a `type` export and import it with `import type`. Then remove the `type` keyword and read the error that `verbatimModuleSyntax` produces.
3. Add a default export and a named export to the same module, then import both and explain the difference in a comment.
4. Create a `ValidationError` and a `NotFoundError` class, throw each, and catch them by `instanceof` with a `throw error` fallback.
5. Wrap a caught error with `{ cause: error }` and walk the chain by printing `err.cause`.
6. Write `tryParseUser` returning `User | null`, then a `Result<User>` version, and compare how the caller has to handle each.
7. Use a dynamic `import()` to load `helpers.ts` inside an async function.
8. Write an `assertDefined` assertion function and use it to avoid a `!`.

---

## 📚 Resources

- **MDN:** [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- **MDN:** [`import()` dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- **MDN:** [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) and [`cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- **Docs:** [Node.js — Modules: ECMAScript modules](https://nodejs.org/api/esm.html) — the authoritative statement of the extension rule
- **Docs:** [TypeScript — `verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- **Docs:** [TypeScript — Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
