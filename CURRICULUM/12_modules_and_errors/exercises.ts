// Exercise 12: Modules & Errors
// Run this file with: npm run ex CURRICULUM/12_modules_and_errors/exercises.ts
//
// There are two helper modules next to this one: helpers.ts and errors.ts.


// TODO: Exercise 1
// Import `multiply` from helpers.ts and call it.
// Remember: the path needs the .js extension, even though the file is helpers.ts.
import { multiply } from "./helpers.js";

console.log(multiply(3, 4));


// TODO: Exercise 2
// helpers.ts also exports a TYPE. Import it with `import type` and use it to
// annotate a variable. Then remove the `type` keyword and run `npm run check`
// to read the error verbatimModuleSyntax produces.


// TODO: Exercise 3
// helpers.ts has a default export too. Import it and call it.
// In a comment, explain why the name you choose here is entirely your own.


// TODO: Exercise 4
// Import ValidationError and NotFoundError from errors.ts.
// Throw a ValidationError and catch it by instanceof, printing the `field` property.
// Add an `else { throw error }` fallback and explain why that matters.


// TODO: Exercise 5
// Catch an error, wrap it with `{ cause: error }`, and print both the new
// error's message and its `.cause`. Explain what would be lost without `cause`.


// TODO: Exercise 6
// Write `tryParseUser` returning `User | null`, then a `Result<User>` version.
// Compare how a caller has to handle each one.
export type User = { name: string; age: number };

export function tryParseUser(raw: string): User | null {
  return null;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export function parseUserResult(raw: string): Result<User> {
  return { ok: false, error: new Error("TODO") };
}


// TODO: Exercise 7
// Use a DYNAMIC import() to load helpers.ts inside this async function.
// Print the result. Note there is no static import of it in this file.
export async function loadAndMultiply(a: number, b: number): Promise<number> {
  return 0;
}


// TODO: Exercise 8
// Write an assertion function `assertDefined` that throws when the value is
// null or undefined. Use it so you do NOT need a `!` afterwards.
export function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
}
