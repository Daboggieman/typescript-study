// Exercise 19: Generics
// Run this file with: npm run ex CURRICULUM/19_generics/exercises.ts
// Typecheck with:    npm run check
//
// Exercises that ask you to trigger a TYPE ERROR keep those lines commented
// out, so `npm run check` stays clean on a fresh clone. Uncomment one at a
// time, run `npm run check`, read the error, then comment it back.


// TODO: Exercise 1
// Write `first<T>(items: T[]): T | undefined`.
// Then call it with a number array, a string array, and an object array,
// and hover each result to confirm the type follows the argument.
export function first<T>(items: T[]): T | undefined {
  return undefined;
}

const firstNumber = first([1, 2, 3]);
const firstString = first(["a", "b"]);
const firstObject = first([{ name: "Ada" }]);
console.log(firstNumber, firstString, firstObject);


// TODO: Exercise 2
// `identity<T>` — call it once with inference and once with an explicit
// type argument. Note that the object call infers `{ name: string }`, not
// any named interface you might have declared.
export function identity<T>(value: T): T {
  return value;
}

const inferred = identity("hello");
const explicit = identity<string>("hello");


// TODO: Exercise 3
// YOUR TASK: change the body to `return a.length >= b.length ? a : b;`
// and read the error — an unconstrained `T` has no `length`. Then fix it by
// adding `extends { length: number }` to the type parameter.
// Finally uncomment `longest(10, 20)` and confirm that is rejected too.
export function longest<T>(a: T, b: T): T {
  return a;
}

// longest(10, 20);
// longest("hello", "hi");


// TODO: Exercise 4
// The classic. The SIGNATURE is the exercise — the body is one line.
// Then uncomment the typo'd key and read what the compiler tells you.
export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Ada", age: 30 };
const userName = getProperty(user, "name");     // string
const userAge = getProperty(user, "age");       // number

// getProperty(user, "nmae");


// TODO: Exercise 5
// Implement a generic Stack<T>. Prove that pushing the wrong type fails
// by uncommenting the bad push below.
export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    // TODO
  }

  pop(): T | undefined {
    return undefined;
  }

  get size(): number {
    return 0;
  }
}

const numbers = new Stack<number>();
numbers.push(1);
// numbers.push("two");


// TODO: Exercise 6
// `keyof` on its own. Write a `UserKeys` alias equal to `keyof User`,
// then annotate a variable with it.
export interface User {
  name: string;
  age: number;
}

export type UserKeys = string;    // TODO: replace `string` with `keyof User`

const aKey: UserKeys = "name";


// TODO: Exercise 7
// Two type parameters constrained against each other.
// `pluck(items, "name")` should be string[]; `pluck(items, "age")` number[].
export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return [];
}

const people = [
  { name: "Ada", age: 36 },
  { name: "Grace", age: 45 },
];

console.log(pluck(people, "name"), pluck(people, "age"));


// TODO: Exercise 8
// A generic class with a constraint. `T extends Identifiable` means every
// item is guaranteed to have an `id`, so `item.id` type-checks.
export interface Identifiable {
  id: string;
}

export class Repository<T extends Identifiable> {
  private items = new Map<string, T>();

  add(item: T): void {
    // TODO
  }

  get(id: string): T | undefined {
    return undefined;
  }

  all(): T[] {
    return [];
  }

  find(predicate: (item: T) => boolean): T[] {
    return [];
  }
}

export interface Person extends Identifiable {
  name: string;
}

const people2 = new Repository<Person>();
people2.add({ id: "p1", name: "Ada" });

console.log(
  people2.find((p) => p.name.startsWith("A")),   // p is Person — .name is checked
);

// people2.add({ name: "no id" });


// TODO: Exercise 9
// A generic `Pair<A, B>` with two independent type parameters, and a
// `swap` function that flips them.
export type Pair<A, B> = [A, B];

export function swap<A, B>(pair: Pair<A, B>): Pair<B, A> {
  return [pair[1], pair[0]];
}

const nameAndAge: Pair<string, number> = ["Ada", 30];
const swapped = swap(nameAndAge);     // Pair<number, string>
console.log(swapped);


// TODO: Exercise 10
// A default type parameter — `T = unknown` — so `ApiResponse` alone is
// legal and `ApiResponse<User>` is more specific.
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

const loose: ApiResponse = { data: "anything", status: 200 };
const tight: ApiResponse<User> = { data: { name: "Ada", age: 30 }, status: 200 };


// TODO: Exercise 11
// The anti-pattern. `T` appears once and is unconstrained, so it buys
// nothing. Rewrite this with `unknown` and explain why that is better.
export function logValue<T>(value: T): void {
  console.log(value);
}

export function logValueBetter(value: unknown): void {
  console.log(value);
}


// TODO: Exercise 12
// `groupBy` — combine everything: two type parameters, a constraint, and a
// `Map` return. Group `items` by the value at `key`.
export function groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]> {
  return new Map();
}
