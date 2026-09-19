# Lecture 23: Advanced Types

Everything up to here has been about *using* TypeScript. This lecture is about **computing with types** — writing types that take types as input and produce new types as output. It is the same shift Python programmers make when they stop writing decorators-by-hand and start writing `__init_subclass__`, or when a function starts returning a function.

You will not need most of this daily. You will need it when you write a library, when you build a typed wrapper around an untyped API, or when you read the source of a package and find `T[K] extends infer U ? ... : never`. Being able to read it is the real goal; writing it is a bonus.

---

## 1. Mapped Types

A mapped type builds a new object type by iterating over the keys of an existing one:

```ts
type User = {
  id: string;
  name: string;
  age: number;
};

type OptionalUser = {
  [K in keyof User]?: User[K];
};
// { id?: string; name?: string; age?: number }
```

Read `[K in keyof User]` as a `for` loop over the key union. `K` takes each key in turn; `User[K]` is the indexed access from [19_generics](../19_generics/lecture.md) section 4.

This is not a new feature to memorise — **it is how the standard library is written.** `Partial`, `Required`, `Readonly`, and `Pick` are all one-line mapped types:

```ts
type Partial<T> = { [K in keyof T]?: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

The `-?` in `Required` is the modifier-removal syntax. `+?` and `-?` add and remove optionality; `readonly` and `-readonly` do the same for read-only:

```ts
// The Mutable<T> that the standard library does not ship
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type MutableUser = Mutable<Readonly<User>>;    // back to normal
```

### Mapping over a union of keys

The input does not have to be `keyof T`:

```ts
type Status = "pending" | "active" | "done";

type StatusFlags = { [K in Status]: boolean };
// { pending: boolean; active: boolean; done: boolean }
```

That is exactly `Record<Status, boolean>` — and now you know what `Record` is made of.

### Key remapping with `as`

The `as` clause inside a mapped type transforms the key:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// { getId: () => string; getName: () => string; getAge: () => number }
```

That is two advanced features at once (`Capitalize` and template literal types, section 4) and the result is real: a typed set of accessor names generated from a data type. Frameworks generate API clients, form field names, and event handler maps exactly this way.

You can also use `as` to **filter** keys, by mapping unwanted ones to `never`:

```ts
type Omit2<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};
```

`never` as a key is dropped, so this is what `Omit` does under the hood.

---

## 2. Conditional Types

A conditional type is an `if` statement at the type level:

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;     // true
type B = IsString<number>;     // false
type C = IsString<"hello">;    // true — a literal is a string
```

The syntax is `T extends U ? X : Y`, and it means **"is T assignable to U?"** — not equality. That distinction matters a lot:

```ts
type IsNumber<T> = T extends number ? true : false;

type D = IsNumber<42>;         // true — 42 is assignable to number
type E = IsNumber<number>;     // true
type F = IsNumber<never>;      // never — see section 3
```

### Distributive conditionals — the rule that surprises everyone

When the left side is a **bare type parameter** and you pass a **union**, the conditional distributes over the union members:

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type G = ToArray<string | number>;    // string[] | number[]     — NOT (string | number)[]
```

It ran the check once per member and unioned the results. Wrap the parameter to stop it:

```ts
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;

type H = ToArrayNonDist<string | number>;   // (string | number)[]
```

The tuple wrapper `[T]` blocks distribution, because now the left side is a tuple type rather than a bare parameter.

The standard library's `Exclude` relies on this:

```ts
type Exclude<T, U> = T extends U ? never : T;

type I = Exclude<"a" | "b" | "c", "a">;
// "b" | "c" — the check ran three times: "a"→never, "b"→"b", "c"→"c"
```

And `never` distributes to `never`:

```ts
type J = ToArray<never>;      // never, not never[]
```

That is usually what you want, and occasionally the source of a very confusing empty type.

---

## 3. `infer` — Extracting Types

`infer` introduces a type variable *inside* a conditional type, to be filled in by matching:

```ts
type ElementType<T> = T extends (infer U)[] ? U : never;

type A = ElementType<string[]>;        // string
type B = ElementType<number[]>;        // number
type C = ElementType<boolean>;         // never — not an array
```

Read it as: *if `T` is an array of something, call that something `U` and return it.*

The standard library's `ReturnType` and `Parameters` are exactly this:

```ts
type ReturnType<T> = T extends (...args: never[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;

function createUser(name: string, age: number): User { /* ... */ }

type R = ReturnType<typeof createUser>;        // User
type P = Parameters<typeof createUser>;        // [name: string, age: number]
```

`infer` composes into genuinely useful utilities:

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>;       // string
type B = UnwrapPromise<number>;                // number

type Awaited2<T> = T extends Promise<infer U> ? Awaited2<U> : T;   // recursive
```

Note the recursion in `Awaited2`. **Conditional types can recurse**, which makes them Turing-complete in practice — and means a badly-written one will hit the compiler's recursion limit ([TS2589: Type instantiation is excessively deep](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)).

The most useful `infer` in day-to-day code unpacks a function's argument:

```ts
type FirstArg<T> = T extends (first: infer F, ...rest: never[]) => unknown ? F : never;

type F = FirstArg<typeof createUser>;          // string
```

### Extracting from a union of shapes

```ts
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string };

type ExtractByType<T, K> = T extends { type: K } ? T : never;

type ClickEvent = ExtractByType<Event, "click">;    // the click member only
```

Taken with `Event["type"]` (an indexed access) you get `"click" | "keypress"`, and `ExtractByType<Event, Event["type"]>` returns the whole union — a round trip that proves the mechanism.

---

## 4. Template Literal Types

Types can be built from string patterns:

```ts
type Greeting = `hello ${string}`;

const a: Greeting = "hello world";      // fine
const b: Greeting = "goodbye world";    // ERROR
```

The `${...}` slots accept `string`, `number`, `boolean`, `bigint`, `null`, `undefined`, or a **union** — and a union distributes:

```ts
type Size = "sm" | "md" | "lg";
type Align = "left" | "right";

type ClassName = `${Size}-${Align}`;
// "sm-left" | "sm-right" | "md-left" | "md-right" | "lg-left" | "lg-right"
```

Twelve classes, from two unions of three and two. This is how you type a design system's class names, an event-name convention, or a CSS-in-JS API without enumerating anything by hand.

The four intrinsic string helpers are worth knowing:

```ts
type A = Uppercase<"hello">;        // "HELLO"
type B = Lowercase<"HELLO">;        // "hello"
type C = Capitalize<"hello">;       // "Hello"
type D = Uncapitalize<"Hello">;     // "hello"
```

Combined with mapped types, they produce whole APIs:

```ts
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type UserSetters = Setters<User>;
// { setId: (value: string) => void; setName: ...; setAge: (value: number) => void }
```

The `string & K` inside `Capitalize` is necessary because `K` could in principle be a `symbol` or `number` key, and `Capitalize` only accepts strings. Intersecting with `string` narrows it.

### A real use: typed route parameters

```ts
type Route = `/users/${string}` | `/posts/${number}`;

function navigate(route: Route): void { /* ... */ }

navigate("/users/ada");        // fine
navigate("/posts/42");         // fine
navigate("/users/ada/posts");  // ERROR
navigate("/posts/abc");        // ERROR — must be a number
```

### Extracting from a template

Template literal types pair with `infer` to parse strings at the type level:

```ts
type ParseRoute<T> = T extends `/users/${infer Id}` ? Id : never;

type Id = ParseRoute<"/users/ada">;     // "ada"
type None = ParseRoute<"/posts/1">;     // never
```

At this point you are writing a parser that runs entirely in the type checker. It is impressive, and it is also where you should ask whether the complexity is earning its keep. The test is simple: **does the error message a user gets from a mistake here make sense?** If not, the type is too clever.

---

## 5. Recursive Types

Types can refer to themselves:

```ts
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

That is the honest type for anything `JSON.parse` can return, and it is why `JSON.parse` returning `any` ([10_files_json](../10_files_json/lecture.md)) is such a loss — the real type is expressible and nobody uses it because writing a `JSONValue`-to-`User` converter by hand is tedious.

Recursive utility types:

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

Both are one line and both are genuinely useful. Neither is in the standard library, which is why `type-fest` exists.

The recursion cost is real: `DeepPartial` on a deeply nested type makes every error message enormous and slows the compiler. Use it where the depth is bounded.

---

## 6. Branded Types

`string` cannot distinguish a user id from a product id — structurally they are identical ([17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md) section 5). A **brand** fixes that by adding a phantom property that exists only in the type:

```ts
type UserId = string & { readonly __brand: "UserId" };
type ProductId = string & { readonly __brand: "ProductId" };

declare const userId: UserId;
declare const productId: ProductId;

function getUser(id: UserId): User { /* ... */ }

getUser(userId);        // fine
getUser(productId);     // ERROR — ProductId is not assignable to UserId
getUser("plain");       // ERROR — a plain string is not a UserId
```

The property is `readonly` and never actually set — it is erased at runtime and exists purely to make the two types structurally distinct. `declare const` says "assume this exists" without emitting anything, which is how you get a value of a branded type for illustration.

In real code the brand is created by a validating constructor:

```ts
function toUserId(value: string): UserId {
  if (!/^u_[a-z0-9]+$/.test(value)) throw new Error(`invalid user id: ${value}`);
  return value as UserId;          // the one place an assertion is justified
}
```

Now the assertion appears exactly once, at the boundary, instead of everywhere a plain `string` was trusted. This pattern is how you make `parse, don't validate` enforceable by the compiler.

---

## 7. `const` Type Parameters

A small, recent feature that removes a `as const` from every call site:

```ts
// Before: the caller must write `as const`
function makeTuple<T extends readonly unknown[]>(items: T): T {
  return items;
}
const a = makeTuple(["x", "y"] as const);        // readonly ["x", "y"]

// With const type parameter: inferred narrowly, no assertion needed
function makeTuple2<const T extends readonly unknown[]>(items: T): T {
  return items;
}
const b = makeTuple2(["x", "y"]);                // readonly ["x", "y"]
```

`<const T>` tells inference not to widen literals. Libraries use it for route tables, config objects, and anything else where the exact keys and values matter downstream ([20_utility_types](../20_utility_types/lecture.md) section 8).

---

## 8. When to Stop

This is the lecture where restraint matters most. A few rules that hold up in real codebases:

**Types must be readable at the definition site.** If a reviewer needs to expand a type in their editor to review a PR, it is too complex.

**Error messages must be understandable.** A type so clever that a mistake produces `Type 'X' does not satisfy the constraint 'never'` has made the code *harder* to use, not easier.

**Prefer a simple type and a runtime check.** `unknown` plus a hand-written `isUser` predicate ([18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md) section 9) is often better than a type that validates the shape at compile time — because the data comes from the network, where compile-time checks do nothing.

**Write it when you have the second use case, not the first.** Abstracting one call site produces a type shaped around one call site. The generic version is easier to get right once you can see two concrete versions.

**More than about fifteen lines of type-level code is a library.** Put it in a file with tests, and use `// @ts-expect-error` ([21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) section 8) to assert the cases that should *not* compile. That technique — testing the type system itself — is rare and valuable.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write `MyPartial<T>` as a mapped type and confirm it matches `Partial<T>`.
2. Write `MyRequired<T>` and `MyReadonly<T>`, and `Mutable<T>` with `-readonly`.
3. Write `StatusFlags` with a mapped type, then again with `Record`, and compare.
4. Write `Getters<T>` using key remapping and `Capitalize`.
5. Write `IsString<T>` and test it against `string`, `number`, and `"hello"`.
6. Write `ElementType<T>` with `infer` and test it on arrays and non-arrays.
7. Show the distributive conditional: `ToArray<string | number>` versus the tuple-wrapped version.
8. Write `Setters<T>` with template literal keys.
9. Define `JSONValue` recursively and write a function that walks it.
10. Write `DeepPartial<T>` and use it on a nested type.
11. Create a `UserId` brand and prove a plain string and a `ProductId` are both rejected.
12. Write `makeTuple<const T>` and confirm the literal type survives without `as const`.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- **Docs:** [TypeScript Handbook — Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) — including `infer` and distribution
- **Docs:** [TypeScript Handbook — Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- **Docs:** [TypeScript 4.9 — `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- **Docs:** [TypeScript 5.0 — `const` Type Parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters)
- **Book:** [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges) — a graded set of type-level puzzles; the best way to actually learn this material
- **Library:** [type-fest](https://github.com/sindresorhus/type-fest) — read its source; every type in it is built from the four features in this lecture
