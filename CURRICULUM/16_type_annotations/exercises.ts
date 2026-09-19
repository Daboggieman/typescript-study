// Exercise 16: Type Annotations & Inference
// Run this file with: npm run ex CURRICULUM/16_type_annotations/exercises.ts
// Typecheck with:    npm run check
//
// Several exercises ask you to trigger a TYPE ERROR. Those lines are commented
// out so `npm run check` stays clean on a fresh clone. Uncomment them one at a
// time, run `npm run check`, and read the error — then comment them back.


// TODO: Exercise 1
// Declare the same value three ways:
//   a. with an explicit annotation
//   b. with inference from the initialiser
//   c. declared without a value (this one REQUIRES an annotation)
// In a comment, say which of the three needed the annotation and why.


// TODO: Exercise 2
// Declare `let inferred = "hi"` and `const literal = "hi"`.
// Hover each in your editor and note the inferred types differ.
// Then uncomment the two lines below, one at a time, and read each error.
let inferred = "hi";
const literal = "hi";

// inferred = 42;
// literal = "bye";


// TODO: Exercise 3
// Reach through three levels of nonexistent properties on an `any` value.
// It will typecheck. Then do the same with `unknown` and uncomment the line
// to read the error — that difference is the whole point of `unknown`.
const anyValue: any = { anything: "goes" };
console.log(anyValue.a.b.c);

const unknownValue: unknown = { anything: "goes" };
// console.log(unknownValue.a);


// TODO: Exercise 4
// Write `fail(message): never` and an exhaustive switch over Shape that uses
// a `const exhaustive: never` check in the default branch.
// Then add a `triangle` variant to Shape and watch the default branch fail.
export type Shape = { kind: "circle" } | { kind: "square" };

export function area(shape: Shape): number {
  return 0;
}

export function fail(message: string): never {
  throw new Error(message);
}


// TODO: Exercise 5
// Annotate a Direction union and assign a valid value.
// Then uncomment the invalid assignment and read the error.
export type Direction = "north" | "south" | "east" | "west";

let dir: Direction = "north";
// dir = "up";


// TODO: Exercise 6
// Pass `config.method` to `request` below. It FAILS because config.method is
// inferred as `string`, not the literal "GET".
// Then add `as const` to config and watch it pass.
export function request(method: "GET" | "POST"): string {
  return method;
}

const config = { method: "GET" };
// request(config.method);


// TODO: Exercise 7
// Trigger an EXCESS PROPERTY CHECK with a direct object literal.
// Then assign the same value through an intermediate variable and explain
// in a comment why that version is allowed.
export type User = { name: string; age: number };

const direct: User = { name: "Ada", age: 30 };
// const bad: User = { name: "Ada", age: 30, email: "x" };

const withExtra = { name: "Ada", age: 30, email: "x" };
const viaVariable: User = withExtra;
console.log(viaVariable.name, direct.name);


// TODO: Exercise 8
// Prove STRUCTURAL typing: define two type aliases with identical shapes,
// then assign a value of one to a variable of the other. It is legal.
// Explain why in a comment, and contrast it with nominal typing.
export type Point = { x: number; y: number };
export type Coord = { x: number; y: number };


// TODO: Exercise 9
// Cast a string to a number with a double assertion and demonstrate the
// runtime failure. The compiler will not stop you; the runtime will.
const notANumber = "hello" as unknown as number;
// console.log(notANumber.toFixed(2));


// TODO: Exercise 10
// Prefer `satisfies` to `as`. Write the same object twice — once with `as`,
// once with `satisfies` — and hover both to see which one kept the narrow
// literal type.
const viaAs = { port: 8080 } as { port: number };
const viaSatisfies = { port: 8080 } satisfies { port: number };
