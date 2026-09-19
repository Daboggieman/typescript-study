# Lecture 21: tsconfig Deep Dive

`tsconfig.json` is the file that decides what "TypeScript" means in your project. Every argument about whether TypeScript is too strict, too loose, too slow, or too confusing is really an argument about six or seven flags in this file. Most people inherit a config, never read it, and then wonder why `arr[0]` is `string` in one project and `string | undefined` in another.

This lecture goes through the file this repo uses, one option at a time, and explains what each one costs and buys. By the end you should be able to write one from scratch and defend every line.

---

## 1. What the File Is

TypeScript has two jobs: **typecheck** and **emit JavaScript**. `tsconfig.json` configures both.

```jsonc
{
  "compilerOptions": { /* how to check and emit */ },
  "include": ["**/*.ts"],        /* which files are in the project */
  "exclude": ["node_modules", "dist"],
  "extends": "./base.json"       /* inherit from another config */
}
```

Run `tsc` with no arguments in a directory containing `tsconfig.json` and it uses it. Run it with `-p path/to/tsconfig.json` to point elsewhere — which is exactly what this repo's `npm run build` does:

```json
"build": "tsc -p tsconfig.build.json"
```

### The three ways to see what it is actually doing

```bash
npx tsc --showConfig          # the fully-resolved config, after all extends and defaults
npx tsc --explainFiles        # every file in the program, and WHY it was included
npx tsc --traceResolution     # every module-resolution attempt, verbose but definitive
```

`--showConfig` is the one to reach for first. Most tsconfig confusion is a default you did not know about, or an `extends` chain doing something you did not expect.

---

## 2. `strict` — The One Flag That Matters Most

```jsonc
"strict": true
```

This is not one flag. It is a **family** of flags, and setting `strict: true` turns all of them on:

| Flag | What it catches |
|---|---|
| `noImplicitAny` | a parameter with no annotation and no inference — the `any` hole |
| `strictNullChecks` | `null` and `undefined` not assignable to everything |
| `strictFunctionTypes` | unsound function parameter comparison |
| `strictBindCallApply` | wrongly-typed `bind`/`call`/`apply` |
| `strictPropertyInitialization` | a class field with no initialiser and no constructor assignment |
| `noImplicitThis` | `this` inferred as `any` |
| `alwaysStrict` | emits `"use strict"` in every file |
| `useUnknownInCatchVariables` | `catch (e)` gives `unknown`, not `any` |

> **`strictNullChecks` is the single most valuable flag in the language.** With it off, `null` and `undefined` are assignable to every type — which means the type system lies to you constantly, and every `x.foo` is a potential runtime crash. With it on, the compiler forces you to handle absence, and the `string | undefined` you have seen throughout this curriculum is what you get.

The reason a project might have it off is legacy: a million-line codebase written before it existed. For new code there is no argument. Turn it on.

### Flags in the family that are *not* on by default

`strict` does **not** include these, and they are all worth knowing:

```jsonc
"noUncheckedIndexedAccess": true,      // arr[0] is T | undefined, not T
"exactOptionalPropertyTypes": true,    // { a?: string } rejects { a: undefined }
"noImplicitOverride": true,            // subclass methods must say `override`
"noPropertyAccessFromIndexSignature": true  // obj.foo fails if foo is only an index sig
"noFallthroughCasesInSwitch": true     // a missing break is an error
```

This repo sets two of them explicitly:

```jsonc
"noImplicitOverride": true,
"noFallthroughCasesInSwitch": true,
```

- **`noImplicitOverride`** matters as soon as you use inheritance ([09_classes_oop](../09_classes_oop/lecture.md)): renaming a base-class method silently orphans every subclass override unless they are marked `override`. With the flag on, the compiler notices.
- **`noFallthroughCasesInSwitch`** catches the forgotten `break`, which is a real bug in every language with C-style `switch`.

### And two this repo deliberately leaves off

```jsonc
"noUnusedLocals": false,
"noUnusedParameters": false,
```

These report an unused variable or parameter. In application code they are excellent — dead code and forgotten parameters are real smells. In **this repo** they are off, for one specific reason: the `exercises.ts` files are full of unimplemented stubs, whose parameters are unused *on purpose*. Turning the flags on would produce hundreds of errors on a fresh clone and teach people to ignore the compiler.

That is a curriculum decision, not a recommendation. In your own projects, turn them on and let your editor grey out the dead ones.

```jsonc
"noUncheckedIndexedAccess": false
```

The same reasoning. With it `true`, `arr[0]` becomes `T | undefined`, and every beginner exercise would need `arr[0]!` or a check — teaching the non-null assertion ([16_type_annotations](../16_type_annotations/lecture.md) section 4) as a reflex, which is exactly the wrong habit.

It is a genuinely good flag for real projects. It is covered properly in section 7 below, as a switch to turn on deliberately once you know what it does.

---

## 3. `target` and `lib` — What Is Available

```jsonc
"target": "ES2023",
"lib": ["ES2023", "DOM"]
```

These two are often confused. They answer different questions:

- **`target`** — what JavaScript syntax does `tsc` *emit*? `ES5` downlevels classes to functions; `ES2022` leaves them alone.
- **`lib`** — which *built-in APIs* does the type system know about? `toSorted`, `structuredClone`, `Promise.any`.

A mismatch between them is the source of the classic error `Property 'toSorted' does not exist on type 'number[]'`. That is not a TypeScript version problem — it is `lib` set below ES2023.

### The `target` values you will actually choose between

| `target` | Emits | When |
|---|---|---|
| `ES5` | `var`, function closures, no `class` | ancient browsers only |
| `ES2015`/`ES6` | real `class`, `let`/`const`, arrows | legacy bundler setups |
| `ES2020` | optional chaining, nullish coalescing | broadly safe |
| `ES2022` | class fields, top-level `await`, `.at()` | modern Node |
| `ES2023` | `toSorted`, `toReversed`, `.findLast()` | what this repo uses |
| `ESNext` | whatever is newest | you are on your own for support |

### `lib` in practice

```jsonc
"lib": ["ES2023"]                // no DOM — for a pure Node library
"lib": ["ES2023", "DOM"]         // adds document, window, fetch types
"lib": ["ES2023", "DOM.Iterable"] // adds Symbol.iterator on DOM collections
```

**Node has no `document`.** If your `lib` includes `DOM`, then `document.querySelector(...)` type-checks in a Node project and crashes at runtime. This repo includes `DOM` for a defensible reason: global `fetch` ([14_fetch_apis](../14_fetch_apis/lecture.md)) is typed by the DOM lib in TypeScript 5, and the curriculum uses it heavily.

For a real server project you would install `@types/node` and *not* include `DOM`, so the compiler catches a stray `window` reference. `@types/node` is in this repo too, for `node:fs/promises`, `node:path`, `process`, and `import.meta.dirname`.

> **On third-party types:** `skipLibCheck` is covered in section 8, and the short version is that it should be on. The long version is that type definitions in `node_modules` are other people's code, and you cannot fix them.

---

## 4. `module` and `moduleResolution` — How Imports Work

```jsonc
"module": "NodeNext",
"moduleResolution": "NodeNext",
"moduleDetection": "force"
```

This is the set of options that causes the most confusion, because it depends on something outside your code: **whether the package is ESM or CommonJS.**

```jsonc
// package.json
"type": "module"
```

That single line makes every `.js` file in the project an ES module. Combined with `module: "NodeNext"`, the consequences for your code are:

**Relative imports must have an explicit extension.**

```ts
import { add } from "./math.js";          // correct — note the .js
import { add } from "./math";             // WRONG under NodeNext
```

Yes, `.js` — even though the file on disk is `math.ts`. TypeScript does not rewrite import paths, so what you write is what Node receives at runtime, and Node needs a real filename. This is the rule behind every `import ... from "./exercises.js"` in this repo's test files.

**`verbatimModuleSyntax` keeps type imports honest:**

```jsonc
"verbatimModuleSyntax": true
```

With this on, an import that is only used as a type must be marked as such:

```ts
import type { User } from "./types.js";        // erased entirely
import { createUser } from "./users.js";       // a real runtime import
```

Without the marker, TypeScript would have to guess whether an import is a type or a value, and whether to erase it. Guessing breaks in edge cases and makes files behave differently depending on how they are transpiled. `verbatimModuleSyntax` removes the guess: what you write is what happens.

This is why `helpers.ts` and `exercises.test.ts` in this repo use `import type` for types and plain `import` for values.

### `moduleDetection: "force"`

Without it, a `.ts` file with no `import` or `export` is treated as a *script*, whose top-level declarations go into the global scope. Two exercise files declaring `const user` would then collide, and the error would point at neither file usefully. `force` makes every file a module, so each has its own scope.

### `esModuleInterop` and `allowSyntheticDefaultImports`

```jsonc
"esModuleInterop": true
```

Needed to `import express from "express"` from a CommonJS package — it makes the default-import shape work for both module systems. It is on by default under `NodeNext`, and it is the reason the same import line can work against ESM and CJS packages.

---

## 5. `include`, `exclude`, `files`

```jsonc
"include": ["**/*.ts"],
"exclude": ["node_modules", "dist"]
```

- **`include`** — glob patterns. Everything matching is in the project.
- **`exclude`** — removes from `include`. `node_modules` is excluded by default; `dist` needs saying, or the compiler will typecheck its own output.
- **`files`** — an explicit list, no globbing. Rarely what you want.

Two traps:

**`exclude` only filters `include`.** A file imported by an included file is pulled in regardless. `--explainFiles` shows exactly this.

**The build config emits.** This repo runs `tsc --noEmit` for checking, so nothing is written. But `tsconfig.build.json` sets `"noEmit": false` and `"outDir": "dist"` — and if `dist` were not excluded, the second build would typecheck the first build's output. Hence the exclude.

---

## 6. `extends` — Sharing a Config

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "strict": true,
    "noEmit": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

```jsonc
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true
  }
}
```

`extends` merges `compilerOptions` shallowly — child keys win, parent keys fill the gaps. `include` and `exclude` are replaced wholesale, not merged, which surprises people.

The pattern above is worth adopting: **one config for checking, one for building.** The checking config has `noEmit: true` and is what your editor and `npm run check` use. The build config turns emission back on and adds declarations.

Relative paths inside an extended config resolve relative to **the file that declares them**, not the file that extends it. That is a source of genuinely baffling bugs, and the reason most shared configs use `"baseUrl"` nothing at all.

### Project references

For a monorepo, `references` lets `tsc` build packages incrementally and know their dependency order:

```jsonc
{
  "references": [{ "path": "../shared" }, { "path": "../api" }]
}
```

Each referenced project needs `"composite": true`, which forces declaration output. This is beyond what a curriculum repo needs, but it is the answer to "how do I typecheck a monorepo without rebuilding everything" — along with `incremental` and `tsBuildInfoFile`:

```jsonc
"incremental": true,
"tsBuildInfoFile": ".tsbuildinfo"
```

`incremental` caches the previous run's type information so the second `tsc` is far faster. The `.tsbuildinfo` file is a cache — it belongs in `.gitignore`, which is where this repo puts it.

---

## 7. The Flags Worth Turning On Later

These are the ones this repo leaves off for pedagogical reasons and you should consider in real code.

### `noUncheckedIndexedAccess`

```ts
const items = ["a", "b"];
const first = items[0];      // off: string     on: string | undefined
```

Off, TypeScript believes every index exists — which is false, and is how `undefined is not a function` crashes happen. On, every index access must be checked:

```ts
const first = items[0];
if (first !== undefined) {
  first.toUpperCase();
}

// Or, when you know
const guaranteed = items[0]!;
```

The cost is real: a loop over an array with `for (let i = 0; ...)` now needs a check in the body, because the compiler cannot prove `i` is in range. The benefit is that the compiler stops lying about arrays, which is where a large share of production bugs live.

**Recommendation: turn it on for a new project, and expect an afternoon of fixes.**

### `exactOptionalPropertyTypes`

```ts
interface Config {
  host?: string;
}

// off: both allowed
const a: Config = { host: undefined };
const b: Config = {};

// on: only the second is allowed
```

Off, `host?: string` means `string | undefined` *and* may be absent. On, it means *may be absent* only, and explicitly setting `undefined` is an error. It is more correct and more annoying, particularly with libraries that pass `{ value: maybeUndefined }` around.

### `noPropertyAccessFromIndexSignature`

Forces `obj["key"]` rather than `obj.key` when `key` only exists via an index signature — a visual reminder that the compiler has not verified it exists. Pairs well with `noUncheckedIndexedAccess`.

### `allowJs` and `checkJs`

Used during a JavaScript-to-TypeScript migration. `allowJs` lets `.js` files into the project; `checkJs` typechecks them, with `// @ts-check` per file as a lighter alternative. This is the gradual-migration story, and it is a good one: rename files one at a time, adding types as you go.

### `declaration` and `declarationMap`

```jsonc
"declaration": true,
"declarationMap": true
```

Emits `.d.ts` files — the types other projects consume — and maps back to the original `.ts` so "go to definition" lands on source rather than a declaration file. Required if you are publishing a library ([24_declaration_files](../24_declaration_files/lecture.md)).

---

## 8. Two Escape Hatches, and Why One Is Better

```ts
// @ts-ignore
value.anything.at.all();

// @ts-expect-error
value.anything.at.all();
```

They look identical. They are not.

- **`@ts-ignore`** suppresses the next line's error, if there is one.
- **`@ts-expect-error`** suppresses it, **and errors if there is no error to suppress.**

So when the underlying problem is fixed, `@ts-ignore` silently stays behind, suppressing a real error the next time one appears on that line. `@ts-expect-error` starts failing and tells you to delete it.

**Always prefer `@ts-expect-error`.** This repo uses it in the test files to assert that a bad call is *supposed* to be rejected — which is a genuine use, and the only one where it should survive long-term. Everywhere else it is a TODO with a shorter name.

If you must suppress, add a comment saying why:

```ts
// @ts-expect-error — the library's types are wrong; see issue #1234
```

### `skipLibCheck`

```jsonc
"skipLibCheck": true
```

Skips typechecking of `.d.ts` files. On, `tsc` is meaningfully faster and you stop seeing errors from dependencies you cannot fix. Off, you catch the rare case where two packages' types genuinely conflict.

**On, always**, unless you are debugging exactly that conflict. It is in this repo's config, and it is in nearly every project you will meet.

---

## 9. The Annotated Config

This repo's `tsconfig.json`, with the reasoning attached:

```jsonc
{
  "compilerOptions": {
    // ---- language level ----
    "target": "ES2023",              // toSorted, .findLast, .at
    "lib": ["ES2023", "DOM"],        // DOM is here for global fetch
    "types": ["node"],               // @types/node for fs, path, process

    // ---- modules ----
    "module": "NodeNext",            // matches "type": "module" in package.json
    "moduleResolution": "NodeNext",  // relative imports need .js extensions
    "moduleDetection": "force",      // every file is a module, no global scope
    "verbatimModuleSyntax": true,    // type-only imports must say `import type`
    "isolatedModules": true,         // each file transpilable alone
    "esModuleInterop": true,         // default imports from CJS packages
    "resolveJsonModule": true,       // import data from a .json file

    // ---- checking ----
    "strict": true,                  // the whole family
    "noImplicitOverride": true,      // subclass overrides must be marked
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": false,         // off: exercise stubs have unused locals
    "noUnusedParameters": false,     // off: same reason
    "noUncheckedIndexedAccess": false, // off: see section 7 — turn on in real projects
    "skipLibCheck": true,            // don't typecheck other people's .d.ts

    // ---- output ----
    "noEmit": true                   // `tsc` only checks; tsx runs the code
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Every line is a decision. That is the standard to hold your own config to — if you cannot say what a flag does, either read up on it or delete it.

---

## 🧠 Try It Yourself

This module's `exercises.ts` is a set of **experiments**: each one asks you to change a flag in `tsconfig.json`, run `npm run check`, and observe. Work through them in order, and put the flag back after each one.

1. Run `npx tsc --showConfig` and find the values you did not set.
2. Run `npx tsc --explainFiles` and find out why `exercises.ts` from another module is in the project.
3. Set `noUnusedLocals: true` and count the errors. Put it back.
4. Set `noUncheckedIndexedAccess: true` and read the first twenty errors.
5. Set `strict: false` — then re-enable it and see how much disappears.
6. Change `target` to `ES2019` and find which methods stop existing.
7. Remove `DOM` from `lib` and find what breaks (`fetch`, and `console`).
8. Change a relative import to drop the `.js` extension and read the error.
9. Remove `import type` from a type-only import and observe under `verbatimModuleSyntax`.
10. Add a `// @ts-expect-error` above a line with no error, and watch it fail.

---

## 📚 Resources

- **Docs:** [TSConfig Reference](https://www.typescriptlang.org/tsconfig) — every option, with defaults
- **Docs:** [TypeScript Handbook — What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- **Docs:** [TypeScript — `strict` family](https://www.typescriptlang.org/tsconfig#strict)
- **Docs:** [TypeScript — Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) — the definitive answer on extensions and `NodeNext`
- **Docs:** [TypeScript 5.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html) — `verbatimModuleSyntax` and `moduleResolution: bundler`
- **Article:** [Total TypeScript — tsconfig cheat sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet) — the flags that matter, in one page
