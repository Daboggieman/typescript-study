// Exercise 23: Advanced Types
// Run this file with: npm run ex CURRICULUM/23_advanced_types/exercises.ts
// Typecheck with:    npm run check
//
// The stubs in this file are mostly TYPE ALIASES, which cannot have an empty
// body. Each one is therefore written as a placeholder that typechecks — the
// TODO says what it should become. Uncomment the usage examples as you go.

export interface User {
  id: string;
  name: string;
  age: number;
}

const ada: User = { id: "u1", name: "Ada", age: 36 };


// TODO: Exercise 1
// Write MyPartial<T> as a mapped type: every property optional.
// Should be identical to Partial<User>.
export type MyPartial<T> = T;
// const p: MyPartial<User> = { name: "Ada" };


// TODO: Exercise 2
// MyRequired<T> and MyReadonly<T>. The first uses `-?` to remove optionality;
// the second puts `readonly` before the key.
export type MyRequired<T> = T;
export type MyReadonly<T> = T;


// TODO: Exercise 3
// The Mutable<T> the standard library does not ship: strip `readonly` with
// `-readonly`. Prove it works on a Readonly<User>.
export type Mutable<T> = T;

export type FrozenUser = Readonly<User>;
// const thawed: Mutable<FrozenUser> = ada;
// thawed.name = "Grace";


// TODO: Exercise 4
// StatusFlags, twice: once as a mapped type over the union, once as Record.
// They should be the same type.
export type Status = "pending" | "active" | "done";

export type StatusFlagsMapped = Record<Status, boolean>;     // TODO: `{ [K in Status]: boolean }`
export type StatusFlagsRecord = Record<Status, boolean>;


// TODO: Exercise 5
// Key remapping with `as`. Generate `getId`, `getName`, `getAge` from User.
// Note the `string & K` — Capitalize only accepts string keys.
export type Getters<T> = T;
// type UserGetters = Getters<User>;
// const g: UserGetters = { getId: () => "u1", getName: () => "Ada", getAge: () => 36 };


// TODO: Exercise 6
// A conditional type. Test it against `string`, `number`, and the literal
// `"hello"` — note the last one is true, because assignability is not equality.
export type IsString<T> = boolean;      // TODO: `T extends string ? true : false`

export type A = IsString<string>;
export type B = IsString<number>;
export type C = IsString<"hello">;


// TODO: Exercise 7
// `infer` extracts a type from a pattern. ElementType<string[]> is string;
// ElementType<boolean> is never.
export type ElementType<T> = unknown;   // TODO: `T extends (infer U)[] ? U : never`

export type E1 = ElementType<string[]>;
export type E2 = ElementType<number[]>;
export type E3 = ElementType<boolean>;


// TODO: Exercise 8
// Distribution. `ToArray<string | number>` is `string[] | number[]`, NOT
// `(string | number)[]`. The tuple-wrapped version blocks distribution.
export type ToArray<T> = T;
export type ToArrayNonDist<T> = T;

export type D1 = ToArray<string | number>;
export type D2 = ToArrayNonDist<string | number>;


// TODO: Exercise 9
// Template literal types. Two unions of three and two produce six class names.
export type Size = "sm" | "md" | "lg";
export type Align = "left" | "right";

export type ClassName = string;         // TODO: `${Size}-${Align}`


// TODO: Exercise 10
// Typed route parameters, using template literals to constrain a string.
export type Route = string;             // TODO: `/users/${string}` | `/posts/${number}`

export function navigate(route: Route): string {
  return route;
}

// navigate("/users/ada");
// navigate("/posts/42");
// navigate("/users/ada/posts");
// navigate("/posts/abc");


// TODO: Exercise 11
// Parse a route at the TYPE level with infer inside a template literal.
export type ParseUserId<T> = never;     // TODO: `T extends \`/users/${infer Id}\` ? Id : never`

export type P1 = ParseUserId<"/users/ada">;
export type P2 = ParseUserId<"/posts/1">;


// TODO: Exercise 12
// JSONValue is defined for you — it is the honest type for JSON.parse.
// Write `describeJson` that walks it and returns a one-word description.
// The recursion in the type is what makes the `switch` narrowing work.
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export function describeJson(value: JSONValue): string {
  return "";
}


// TODO: Exercise 13
// DeepPartial<T> — recursive. Partial is only one level deep; this one
// descends into nested objects.
export interface Nested {
  name: string;
  inner: { a: number; b: { c: string } };
}

export type DeepPartial<T> = T;


// TODO: Exercise 14
// Branded types. A plain string must NOT be assignable to UserId, and a
// ProductId must not be assignable to UserId either.
export type UserId = string;
export type ProductId = string;

export function getUser(id: UserId): User {
  return ada;
}

declare const brandedUserId: UserId;
declare const brandedProductId: ProductId;

// getUser(brandedUserId);
// getUser(brandedProductId);
// getUser("plain-string");


// TODO: Exercise 15
// `const` type parameters. The first version widens to string[]; the second
// keeps the literal tuple without the caller writing `as const`.
export function makeTupleWide<T extends readonly unknown[]>(items: T): T {
  return items;
}

export function makeTupleNarrow<const T extends readonly unknown[]>(items: T): T {
  return items;
}

const wide = makeTupleWide(["x", "y"]);
const narrow = makeTupleNarrow(["x", "y"]);
console.log(wide, narrow);
