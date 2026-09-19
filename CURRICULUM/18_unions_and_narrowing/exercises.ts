// Exercise 18: Unions & Narrowing
// Run this file with: npm run ex CURRICULUM/18_unions_and_narrowing/exercises.ts
// Typecheck with:    npm run check
//
// Exercises that ask you to trigger a TYPE ERROR keep those lines commented
// out, so `npm run check` stays clean on a fresh clone. Uncomment one at a
// time, run `npm run check`, read the error, then comment it back.


// TODO: Exercise 1
// Write `format(value: string | number): string` using `typeof` narrowing.
// Then uncomment the line below and read the error — this is the compiler
// refusing to let you use a member that only one branch has.
export function format(value: string | number): string {
  return String(value);
}

// function broken(value: string | number): number { return value.length; }


// TODO: Exercise 2
// `typeof null === "object"` — the 1995 bug you have to remember.
// Narrow a `string | null` with a naive `typeof` check, then fix it.
// Uncomment the broken version first and see whether it type-checks.
export function describeNull(value: string | null): string {
  return value ?? "was null";
}

// function naive(value: string | null): string {
//   if (typeof value === "object") return "null";
//   return value.toUpperCase();
// }


// TODO: Exercise 3
// Narrow `Cat | Dog` with `instanceof`, calling each class's own method.
export class Cat {
  meow(): string {
    return "meow";
  }
}

export class Dog {
  bark(): string {
    return "woof";
  }
}

export function speak(animal: Cat | Dog): string {
  return "";
}


// TODO: Exercise 4
// Build a discriminated union of THREE shapes, each with a `kind` literal.
// Write `area(shape)` as a switch with NO default branch — the compiler
// should accept that it always returns.
export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };

export function area(shape: Shape): number {
  return 0;
}


// TODO: Exercise 5
// Add `| { kind: "triangle"; base: number; height: number }` to Shape above,
// run `npm run check`, and read where it fails.
// Then add the missing case and confirm it is clean again.


// TODO: Exercise 6
// Add an `assertNever` default branch to `area` and prove it catches a new
// variant. This is the exhaustiveness guard from the lecture.
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}


// TODO: Exercise 7
// Narrow with `in`: an `Admin` has `permissions`, a `Guest` has `expiresAt`.
// Uncomment the two broken lines and read the errors.
export type Admin = { name: string; permissions: string[] };
export type Guest = { name: string; expiresAt: Date };

export function describeUser(user: Admin | Guest): string {
  return "";
}

// const badAdmin: Admin = { name: "x", expiresAt: new Date() };
// const badGuest: Guest = { name: "x", permissions: [] };


// TODO: Exercise 8
// Write `isUser(value: unknown): value is User` — a real type predicate.
// Note the return TYPE: `boolean` would give no narrowing at all.
// Test it against a valid object, a missing field, and `null`.
export type User = { name: string; age: number };

export function isUser(value: unknown): value is User {
  return false;
}

export function process(value: unknown): string {
  return "";
}


// TODO: Exercise 9
// Narrowing does not survive reassignment. `narrowable` is never reassigned,
// so its narrowing holds; `reassigned` is, so it is discarded.
// Uncomment the last line and read the error.
export function narrowingAndReassignment(value: string | null): number {
  const narrowable = value;
  if (narrowable === null) return 0;
  const length = narrowable.length;

  let reassigned: string | null = value;
  if (reassigned === null) return 0;
  reassigned = null;
  // const broken = reassigned.length;

  return length;
}


// TODO: Exercise 10
// `??` versus `||`. Run this file and compare the two printed values.
// In a comment, say which one you want for a numeric default and why.
export function nullishVsOr(count: number | null): [number, number] {
  return [count ?? 10, count || 10];
}

console.log("?? vs ||  on 0:", nullishVsOr(0));
console.log("?? vs ||  on null:", nullishVsOr(null));


// TODO: Exercise 11
// Optional chaining and nullish coalescing over a nested optional shape.
// Then rewrite the same expression with explicit `if` checks and compare.
export type Address = { city: string; postcode?: string };
export type Person = { name: string; address?: Address };

export function cityOf(person: Person): string {
  return "";
}


// TODO: Exercise 12
// Narrow an `unknown` to a string using four different checks:
// typeof, Array.isArray, instanceof Date, and an object check that excludes null.
export function stringifyUnknown(input: unknown): string {
  return String(input);
}
