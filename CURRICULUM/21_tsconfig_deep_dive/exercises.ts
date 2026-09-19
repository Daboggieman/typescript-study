// Exercise 21: tsconfig Deep Dive
// Run this file with: npm run ex CURRICULUM/21_tsconfig_deep_dive/exercises.ts
// Typecheck with:    npm run check
//
// This module is different from the others: most of the exercises are
// EXPERIMENTS you run by editing tsconfig.json, then `npm run check`, then
// putting the flag back. The experiments are listed first; the code below
// them is the part you can run right now.
//
// Run this file to print the experiment list and the current config.


// ---------------------------------------------------------------------------
// EXPERIMENTS — edit tsconfig.json at the repo root, one flag at a time
// ---------------------------------------------------------------------------
//
//  1. npx tsc --showConfig
//     Read the fully-resolved config. Find five values you never set.
//
//  2. npx tsc --explainFiles | head -50
//     Which files are in the project, and why. Note that every module's
//     exercises.ts is included — `include` is a glob over the whole repo.
//
//  3. "noUnusedLocals": true   → npm run check
//     Count the errors. They are all un-attempted stubs. Put it back to false.
//
//  4. "noUncheckedIndexedAccess": true → npm run check
//     `arr[0]` becomes `T | undefined`. Read the first twenty errors and
//     understand why this repo leaves it off and real projects turn it on.
//
//  5. "strict": false → npm run check
//     Note how quiet it gets. Then turn it back on and note that quiet is
//     not the same as correct.
//
//  6. "target": "ES2019" → npm run check
//     Search CURRICULUM/04_arrays_tuples for `toSorted` and see it fail.
//
//  7. "lib": ["ES2023"] → npm run check
//     Remove DOM. `fetch` in 14_fetch_apis stops existing. So does `console`.
//
//  8. Find a relative import in CURRICULUM/11_testing/exercises.test.ts and
//     delete the `.js` extension → npm run check
//     Read the error. Under NodeNext the extension is not optional.
//
//  9. In CURRICULUM/12_modules_and_errors/helpers.ts, change an
//     `import type` to a plain `import` → npm run check
//     verbatimModuleSyntax is why the marker is required.
//
// 10. Add a `// @ts-expect-error` above a line that has NO error, then
//     `npm run check`. The directive itself becomes the error — that is the
//     whole reason to prefer it over `@ts-ignore`.


// ---------------------------------------------------------------------------
// WHAT YOU CAN RUN
// ---------------------------------------------------------------------------

// TODO: Exercise 1
// Print the resolved type-level facts this config produces, so you can see
// the effects of the flags without guessing.
//
// Fill in each of the four type aliases so that the printed values are
// correct. Hover each one to check yourself.
export type ArrayIndex = number[];       // TODO: the type of `[1,2,3][0]` under THIS config
export type AwaitedPromise = Promise<number>;  // TODO: what `await Promise.resolve(1)` gives
export type KeyofThisObject = object;    // TODO: the type of `keyof { a: 1, b: 2 }`


// TODO: Exercise 2
// Prove that `strict` is on: this function must NOT compile until you handle
// the null case. Then compare with what it would look like under
// `strictNullChecks: false`, in a comment.
export function shout(value: string | null): string {
  return "";
}


// TODO: Exercise 3
// Prove that `noUncheckedIndexedAccess` is OFF by writing the type of
// `items[0]` for `string[]`. Then, in a comment, write what it would be if
// the flag were on.
export function firstItem(items: string[]): string {
  return "";
}


// TODO: Exercise 4
// Prove that `verbatimModuleSyntax` is on: this file imports a type from
// another module. Change this line to a plain `import` and run the check.
import type { Shape } from "../18_unions_and_narrowing/exercises.js";

export function shapeKind(shape: Shape): string {
  return "";
}


// TODO: Exercise 5
// Prove that `noImplicitOverride` is on. It is present below — DELETE the
// `override` keyword, run `npm run check`, read the error, put it back.
export class Base {
  describe(): string {
    return "base";
  }
}

export class Child extends Base {
  override describe(): string {
    return "child";
  }
}


// TODO: Exercise 6
// Prove that `noFallthroughCasesInSwitch` is on. Uncomment the second case
// below, which falls through from the first.
export function label(code: number): string {
  switch (code) {
    case 1:
      return "one";
    // case 2:
    //   return "two";
    default:
      return "other";
  }
}


// TODO: Exercise 7
// Prove that `skipLibCheck` is on by finding a `.d.ts` error it is hiding.
// Run `npx tsc --noEmit --skipLibCheck false` and compare the output with
// `npm run check`. Record the difference in a comment.


// TODO: Exercise 8
// Prove the `.js` extension rule. Add a new import of `helpers.js` here
// WITHOUT the extension, run the check, then fix it.
import { multiply } from "../12_modules_and_errors/helpers.js";

export function triple(n: number): number {
  return multiply(n, 3);
}


// Render the experiment list so this file does something when run.
console.log(`
tsconfig experiments — see the comment block at the top of this file,
then edit tsconfig.json at the repo root and run: npm run check
`);
console.log("triple(4) =", triple(4));
