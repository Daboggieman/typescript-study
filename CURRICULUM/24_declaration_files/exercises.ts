// Exercise 24: Declaration Files
// Run this file with: npm run ex CURRICULUM/24_declaration_files/exercises.ts
// Typecheck with:    npm run check
//
// The declaration files this module exercises live in ./types and ./vendor.
// Read them alongside this file — they are the point of the module.


// ---------------------------------------------------------------------------
// PART 1 — a local .js file with hand-written declarations
// ---------------------------------------------------------------------------

// TODO: Exercise 1
// Read vendor/legacy-logger.js and vendor/legacy-logger.d.ts.
// The .js has no types; the .d.ts is matched to it by FILENAME.
//
// Delete legacy-logger.d.ts, run `npm run check`, and read TS7016 in full.
// Put it back.
import { log, level, VERSION } from "./vendor/legacy-logger.js";

// TODO: Exercise 2
// `VERSION` is declared `const` in the .d.ts, so it keeps its LITERAL type.
// Hover it. Then change the declaration to `export declare let VERSION:
// string;` and hover again — the literal is gone.
export const version: typeof VERSION = VERSION;
// const badVersion: typeof VERSION = "9.9.9";

// TODO: Exercise 3
// `level()` returns a union, not `string`. That makes this switch narrowable.
// Fill it in, then change the declaration in the .d.ts to return `string`
// and watch the switch stop narrowing.
export function severity(levelName: ReturnType<typeof level>): number {
  // TODO: return 1 for "info", 2 for "warn", 3 for "error"
  void levelName;
  return 0;
}

log(`legacy logger loaded, version ${VERSION}`);


// ---------------------------------------------------------------------------
// PART 2 — ambient declarations for a package with no types
// ---------------------------------------------------------------------------

// TODO: Exercise 4
// Read types/untyped-package.d.ts. It declares a module that is NOT installed.
// Uncomment the import below: it TYPECHECKS PERFECTLY and then fails at
// runtime with ERR_MODULE_NOT_FOUND. Run it and see.
//
// That gap is the single most important thing to understand about `declare`:
// you are asserting, and the compiler believes you.
//
// import { parse, version as pkgVersion } from "untyped-package";
// console.log(parse("a=1"), pkgVersion);


// ---------------------------------------------------------------------------
// PART 3 — global augmentation
// ---------------------------------------------------------------------------

// TODO: Exercise 5
// types/globals.d.ts extends `Window` with `appVersion` and `analytics`.
// TypeScript now believes those exist on every window object — including in
// this Node process, where there is no window at all.
//
// The lines below are TYPE queries: they never touch a runtime value.
export type AppVersion = Window["appVersion"];
export type TrackFn = Window["analytics"]["track"];

// Now the runtime version — uncomment and it throws ReferenceError.
// console.log(window.appVersion);

// TODO: Exercise 6
// Add the ProcessEnv augmentation shown in types/globals.d.ts, then
// uncomment this line. Without the augmentation it is a type error;
// with it, it type-checks and is still `string | undefined` at runtime.
//
// export const base = process.env.API_BASE ?? "http://localhost";

// TODO: Exercise 7
// Remove `export {}` from types/globals.d.ts and run `npm run check`.
// Read the error, then put it back and explain in a comment why a .d.ts
// that augments globals must also be a module.


// ---------------------------------------------------------------------------
// PART 4 — assertion functions
// ---------------------------------------------------------------------------

// TODO: Exercise 8
// An assertion function. `asserts condition` tells the compiler that if this
// returns normally, the condition was true — so everything downstream is
// narrowed. This is the statement form of a type predicate.
//
// Note that assertion functions REQUIRE an explicit type annotation;
// inference cannot produce one.
export function invariant(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "invariant failed");
  }
}

export function processValue(value: string | null): string {
  // TODO: call invariant(value !== null, "value is required") here,
  // then return value.toUpperCase() with no `if` and no `!`.
  return "";
}


// ---------------------------------------------------------------------------
// PART 5 — reading real declaration files
// ---------------------------------------------------------------------------

// TODO: Exercise 9
// Open node_modules/@types/node/fs/promises.d.ts (after `npm install`) and
// find the declaration of `writeFile`. Note the overloads — several
// signatures, one name. Overloads are how declaration files express
// "this function accepts several different argument shapes".

// TODO: Exercise 10
// `npm run build` emits dist/**/*.d.ts from this project's own source.
// Run it, then open dist/CURRICULUM/24_declaration_files/exercises.d.ts.
// That is what a library ships — declarations with every body removed.


console.log("severity:", severity(level()));
