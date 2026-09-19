# Lecture 24: Declaration Files

Every package you install that has types ships them as `.d.ts` files — type declarations with no implementation. This lecture is about reading them, writing them, and the situations where you *must* write one: an untyped dependency, a global that a script injects, a CSS import that Node has never heard of.

You will not write `.d.ts` files often. You will read them constantly, and you will need to write one the first time you use a package that never shipped types.

---

## 1. What a `.d.ts` File Is

A declaration file describes the *shape* of JavaScript that already exists. It contains no executable code, and `tsc` never emits anything from it.

```ts
// math.d.ts
export declare function add(a: number, b: number): number;
export declare const PI: number;

export interface Point {
  x: number;
  y: number;
}
```

Compare with the implementation:

```ts
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}
export const PI = 3.14159;
export interface Point { x: number; y: number }
```

The declaration file is the implementation with every body removed and `declare` added.

**You can generate them.** This repo's `tsconfig.build.json` sets `"declaration": true`, so `npm run build` produces a `.d.ts` next to each `.js` in `dist/`. That is how a library ships types:

```jsonc
{
  "compilerOptions": {
    "declaration": true,        // emit .d.ts
    "declarationMap": true      // map back to the .ts, so "go to definition" works
  }
}
```

Every package with a `types` field in its `package.json` is pointing at one of these:

```jsonc
// node_modules/some-package/package.json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

When you Ctrl-click an import and land in a `.d.ts` full of declarations and no bodies, that is what you are looking at — and it is why "go to definition" sometimes shows you a summary rather than the source. `declarationMap` is what fixes it for your own packages.

> **`skipLibCheck: true`** ([21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) section 8) tells the compiler not to typecheck these files. They are other people's code, you cannot fix them, and checking them is slow. Keep it on.

---

## 2. `declare` — Asserting That Something Exists

`declare` says "this exists at runtime; do not emit anything for it."

```ts
declare const VERSION: string;
declare function greet(name: string): void;
declare class LegacyClient {
  constructor(url: string);
  request(path: string): Promise<unknown>;
}
declare namespace MyLib {
  const version: string;
}
```

Nothing is emitted, so `declare const VERSION: string` produces no `VERSION` at runtime — the value must come from somewhere else: a `<script>` tag, a bundler define, an environment. Get that wrong and you get `ReferenceError: VERSION is not defined` at runtime with no compile error, which is the exact failure mode `declare` invites.

The type-level equivalent is `declare module`:

```ts
declare module "legacy-analytics" {
  export function track(event: string, props?: Record<string, unknown>): void;
  export const version: string;
}
```

Now `import { track } from "legacy-analytics"` type-checks even though the package ships no types at all. This is the mechanism behind `@types/*` packages, and it is how you write your own.

---

## 3. Where TypeScript Finds Types

Resolution order for `import { x } from "pkg"`:

1. **`pkg`'s own types** — the `types` / `typings` field, or a `.d.ts` beside its `main`.
2. **`@types/pkg`** in `node_modules/@types/` — installed with `npm i -D @types/pkg`.
3. **An ambient `declare module "pkg"`** somewhere in your project.
4. **Nothing** → `Could not find a declaration file for module 'pkg'` (TS7016).

That error message is worth reading in full when you hit it, because it names the fix:

```
Could not find a declaration file for module 'pkg'.
'/path/to/node_modules/pkg/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/pkg` if it exists or add a new declaration
  (.d.ts) file containing `declare module 'pkg';`
```

The `@types/*` packages come from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped), a community repository of type definitions for packages that do not ship their own. Check there first — most popular packages are covered, and `npm i -D @types/express` is always better than writing your own.

Which packages get loaded is controlled by `types` in `tsconfig.json`:

```jsonc
"types": ["node"]      // ONLY @types/node — this repo's setting
```

Omitting the field loads everything in `node_modules/@types`, which is convenient and makes compilation slower and less predictable. Being explicit is better in a repo that cares.

### The escape hatch, ranked

When a package has no types, in order of preference:

```ts
// 1. Install the real ones — always try this first
// npm i -D @types/pkg

// 2. Write a real declaration for the parts you use
// types/pkg.d.ts
declare module "pkg" {
  export function parse(input: string): Record<string, unknown>;
}

// 3. Give up and declare it as any — the last resort
// types/pkg.d.ts
declare module "pkg";
```

Option 3 is a one-liner that makes the whole module `any`, which is why it is last. It compiles, it hides every mistake the package could have caught, and it spreads ([16_type_annotations](../16_type_annotations/lecture.md) section 3).

---

## 4. Ambient Non-Code Imports

Node has no idea what a `.css` file is. Neither does TypeScript — so importing one is an error until you tell it otherwise:

```ts
// types/assets.d.ts
declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*.json" {
  const value: unknown;
  export default value;
}
```

With that in place, `import styles from "./Button.css"` type-checks, and `styles.anything` is typed `string` — which is a lie that mirrors the runtime behaviour of CSS modules closely enough to be useful.

This repo does not need these (it is Node, not a bundler), but `resolveJsonModule: true` in the config does the equivalent job for JSON: `import data from "./data.json"` works and gives a perfectly-typed object literal, inferred from the file's contents rather than declared.

---

## 5. Globals and `declare global`

A script that injects a global needs a declaration:

```ts
// types/globals.d.ts
declare const __DEV__: boolean;
declare const API_BASE: string;

interface Window {
  analytics: {
    track(event: string): void;
  };
}
```

To *extend* an existing global from inside a module, wrap it:

```ts
// types/globals.d.ts
export {};                    // makes this file a module

declare global {
  interface Window {
    analytics: { track(event: string): void };
  }

  var __DEV__: boolean;
}
```

Two things are load-bearing:

- **`export {}`** is required. `declare global` only works inside a module, and a `.d.ts` with no imports or exports is a script whose declarations are *already* global. Leaving it out gives you `Augmentations for the global scope can only be directly nested in external modules`.
- **`var`, not `let` or `const`**, for a global variable. `var` declarations merge across files in the global scope; `let` and `const` do not, so redeclaring one collides.

### Module augmentation

The same mechanism extends a *library's* types rather than the global scope:

```ts
// types/express.d.ts
import "express";

declare module "express" {
  interface Request {
    user?: { id: string; name: string };
  }
}
```

Now `req.user` type-checks in every handler. This is the standard way to add a field a middleware attaches — and it is why you should be careful about it: you are changing the type for everyone in the project, including code that has never heard of your middleware. Keep augmentations in one file, and comment what provides the runtime value.

---

## 6. Publishing Types

If you publish a package, `package.json` needs to point at the declarations:

```jsonc
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",     // must come FIRST
      "import": "./dist/index.js"
    }
  }
}
```

The `types` condition must be listed **before** `import` or `require`, because the conditions are evaluated in order and the first match wins. Getting this wrong produces "types resolve but the runtime file does not" bugs that are miserable to debug.

Two more fields worth knowing:

```jsonc
{
  "files": ["dist"],            // only ship the build output
  "typesVersions": {}           // per-TypeScript-version overrides; rarely needed
}
```

### `export =` and `export as namespace`

Older CommonJS packages use a different export style:

```ts
// A CJS module that exports a single function
declare function myLib(input: string): number;
export = myLib;

// A UMD module usable from a <script> tag
export as namespace MyLib;
```

`export =` cannot be combined with `export default` — it is the pre-ESM way, and you will meet it in `@types/*` packages for libraries written before 2015. With `esModuleInterop: true` ([21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) section 4) you import it like a default:

```ts
import myLib from "my-lib";        // works despite `export =`
```

### Triple-slash directives

The oldest mechanism, still occasionally required:

```ts
/// <reference types="node" />
/// <reference path="./custom.d.ts" />
/// <reference lib="dom" />
```

These must be the **first** lines of the file, before any code. Modern configuration handles almost all of this via `types` and `lib` in `tsconfig.json`, so treat them as a smell: if you need one, ask why the config is not doing the job. The one place they survive is generated `.d.ts` files from older tools.

---

## 7. Writing Your Own — A Checklist

When a dependency has no types and you decide to write them:

1. **Put them in `types/`.** One file per package, named after the package.
2. **Declare only what you use.** A `.d.ts` covering 5% of a library is fine and much better than `declare module "pkg"`.
3. **Type the boundaries, not the internals.** Function signatures and return types — that is where mistakes happen.
4. **Prefer `unknown` for values you have not verified.** The signature should force the caller to narrow.
5. **Do not use `any`** unless the value genuinely is opaque, and comment it if so.
6. **Check DefinitelyTyped first.** A package you maintain privately is not on it, but a wildly popular one probably is.
7. **Consider contributing upstream.** The declaration you wrote is useful to everyone else who hits the same gap, and DefinitelyTyped takes PRs.

A realistic example:

```ts
// types/tiny-invariant.d.ts
declare module "tiny-invariant" {
  /**
   * Throws if `condition` is falsy. Narrows the type when it does not throw.
   */
  function invariant(
    condition: unknown,
    message?: string,
  ): asserts condition;

  export default invariant;
}
```

Note `asserts condition` — an **assertion function**. It tells the compiler that if `invariant` returns normally, the condition was true, and that narrows downstream:

```ts
import invariant from "tiny-invariant";

function process(value: string | null): string {
  invariant(value !== null, "value is required");
  return value.toUpperCase();        // narrowed — no `!` or `if` needed
}
```

That is the same idea as a type predicate ([18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md) section 9), in statement form. Assertion functions must be declared with an explicit type annotation — inference cannot produce them — which is one reason you will see them mostly in declaration files and library code.

---

## 🧠 Try It Yourself

This module has a real `types/` folder with declaration files. Open them, then:

1. Read `types/untyped-package.d.ts` and import from the module it declares. Confirm you get autocomplete and type errors.
2. Delete the file and read the resulting TS7016 error in full.
3. Add a `declare module "made-up"` of your own and import from it.
4. Read `types/assets.d.ts` and import a `.txt` asset.
5. Extend `Window` in `types/globals.d.ts`, then try removing `export {}` and read the error.
6. Add a module augmentation to `types/globals.d.ts` that adds a property to the `ProcessEnv` interface.
7. Write an assertion function declaration and use it to narrow a `string | null`.
8. Run `npm run build` and go read the generated `dist/**/*.d.ts` — that is what a library ships.
9. Open a `.d.ts` file from `node_modules` (try `node_modules/@types/node/fs/promises.d.ts`) and find three declarations you recognise.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- **Docs:** [TypeScript Handbook — Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- **Docs:** [TypeScript Handbook — `declare global` and augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation)
- **Docs:** [TypeScript — `declaration` and `declarationMap`](https://www.typescriptlang.org/tsconfig#declaration)
- **Repository:** [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) — where `@types/*` comes from; read the contributing guide if you want to send one
- **Article:** [Are The Types Wrong?](https://arethetypeswrong.github.io/) — checks a published package's types resolve correctly. Run your own package through it before publishing
