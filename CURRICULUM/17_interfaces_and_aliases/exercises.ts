// Exercise 17: Interfaces & Type Aliases
// Run this file with: npm run ex CURRICULUM/17_interfaces_and_aliases/exercises.ts
// Typecheck with:    npm run check
//
// Exercises that ask you to trigger a TYPE ERROR keep those lines commented
// out, so `npm run check` stays clean on a fresh clone. Uncomment one at a
// time, run `npm run check`, read the error, then comment it back.


// TODO: Exercise 1
// Describe the same shape twice — once as an `interface`, once as a `type`.
// Assign a value to each and confirm the two are interchangeable.
export interface UserInterface {
  name: string;
  age: number;
}

export type UserType = {
  name: string;
  age: number;
};


// TODO: Exercise 2
// Write a `Status` union. In a comment, explain why an interface cannot
// express this shape. Then use `Status` as a parameter type somewhere.
export type Status = "pending" | "active" | "done";


// TODO: Exercise 3
// These two interfaces share a name and MERGE into one with both properties.
// Prove it by constructing a `Merged` with both fields.
// Then do the same with `type` and read the error (uncomment to see).
export interface Merged {
  first: string;
}

export interface Merged {
  second: number;
}

// export type Duplicated = { a: string };
// export type Duplicated = { b: number };


// TODO: Exercise 4
// Add a `readonly` property and an optional one to `Account`.
// Then try each of these and read the errors:
//   - assign to the readonly property
//   - read the optional one and use it without a null check
export interface Account {
  readonly id: number;
  owner: string;
}


// TODO: Exercise 5
// STRUCTURAL TYPING. `Point` and `Coordinate` have identical shapes but
// different names. Assign a `Point` to a `Coordinate` with no cast — it is
// legal. Write a comment explaining why, and how this differs from Python.
export interface Point {
  x: number;
  y: number;
}

export interface Coordinate {
  x: number;
  y: number;
}


// TODO: Exercise 6
// `Logger` is an interface. `ConsoleLogger` never mentions it and has no
// `implements`. Pass a ConsoleLogger instance to `run` and explain why it works.
export interface Logger {
  log(message: string): void;
}

export class ConsoleLogger {
  log(message: string): void {
    console.log(message);
  }
}

export function run(logger: Logger): void {
  logger.log("hello");
}


// TODO: Exercise 7
// Excess property check: assigning an object LITERAL directly to a `Named`
// rejects the extra property. Uncomment to see.
// Then pass the same value through a variable and explain the difference.
export interface Named {
  name: string;
}

const person = { name: "Ada", age: 30 };
const viaVariable: Named = person;

// const viaLiteral: Named = { name: "Ada", age: 30 };


// TODO: Exercise 8
// Write a `type Handler` function type, then a function that accepts one and
// calls it. Do the same as an interface with a call signature and compare.
export type Handler = (event: string) => void;


// TODO: Exercise 9
// Compose three small types into one with `&`. Then write a function that
// takes the composed type and returns a formatted string.
export type Timestamped = { createdAt: Date };
export type Identified = { id: number };
export type NamedThing = { name: string };

export type Entity = Timestamped & Identified & NamedThing;


// TODO: Exercise 10
// Write a class that `implements` an interface. Delete a required member and
// read the error; add an extra member and note that it is allowed.
export interface Serializable {
  toJSON(): string;
}


// TODO: Exercise 11
// A dictionary type two ways: an index signature and `Record`.
// Then explain in a comment why `scores["nobody"]` being typed `number` is a lie.
export interface ScoresByIndex {
  [name: string]: number;
}

export type ScoresByRecord = Record<string, number>;


// TODO: Exercise 12
// BRANDED TYPES. A plain `string` cannot tell a user id from a product id.
// Construct one of each and prove to yourself that the two are not assignable.
export type UserId = string & { readonly __brand: "UserId" };
export type ProductId = string & { readonly __brand: "ProductId" };
