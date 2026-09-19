# Lecture 19: Generics

Generics are how you write a function or a type that works with **many types while keeping the relationship between them**. They are the difference between `any` (which throws type information away) and a real abstraction (which preserves it). Python has the same feature — `TypeVar`, `Generic[T]`, `list[int]` — and if you have used those, the ideas transfer directly. The syntax differs.

---

## 1. The Problem Generics Solve

You want a function that returns the first element of an array. Without generics you have three bad options:

```ts
// Option 1 — specific to strings
function firstString(items: string[]): string | undefined {
  return items[0];
}
// ...and then again for numbers, for booleans, for users...

// Option 2 — any: works, but destroys the type
function firstAny(items: any[]): any {
  return items[0];
}
const n = firstAny([1, 2, 3]);       // n is any — the number-ness is gone
n.toUpperCase();                      // no error. Crashes at runtime.

// Option 3 — a union of everything you can think of
function firstUnion(items: (string | number)[]): string | number | undefined {
  return items[0];
}
const s = firstUnion(["a"]);          // s is string | number — you must narrow
```

Option 2 is the tempting one and the dangerous one: `any` in, `any` out, and the type information is lost at the boundary.

The generic version keeps it:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);           // n: number | undefined
const s = first(["a", "b"]);          // s: string | undefined
const u = first([{ name: "Ada" }]);   // u: { name: string } | undefined
```

`<T>` introduces a **type parameter** — a placeholder the caller fills in. `T` is bound to `number` in the first call and `string` in the second, and the return type follows. Nothing is thrown away.

> **The naming convention:** `T` for a single type, `T`, `U`, `V` when there are several, and descriptive names (`TKey`, `TValue`, `TResult`) when the meaning matters. One letter is fine for `first<T>`; `fetchJson<TResult>` is kinder to the reader.

---

## 2. Inference Does the Work

You almost never write the type argument explicitly. TypeScript infers it from the arguments:

```ts
function identity<T>(value: T): T {
  return value;
}

const a = identity("hello");          // T inferred as string — no <string> needed
const b = identity<string>("hello");  // explicit, and redundant here
```

Explicit arguments are for when inference cannot know, or gets it wrong:

```ts
// Inference picks { name: string } — which is usually right
const c = identity({ name: "Ada" });

// Explicit when you want the narrower or wider type
const d = identity<{ name: string } | null>({ name: "Ada" });
```

> **Inference picks the argument's type, which is not always what you want.** `identity({ name: "Ada" })` gives `{ name: string }`, not your `User` type. If the caller needs the wider contract, annotate the variable: `const d: User = identity({ name: "Ada" })`.

### Generics on arrow functions

```ts
const first = <T>(items: T[]): T | undefined => items[0];
```

In a `.tsx` file that leading `<T>` is ambiguous with JSX, and the fix is a trailing comma: `<T,>`. This repo is `.ts`, so it is not a problem here — but it is the reason you will see `<T,>` in React codebases.

---

## 3. Constraints — `extends`

An unconstrained `T` is `unknown`-like: you can pass anything, but you can do nothing with it.

```ts
function longest<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b;      // ERROR — T has no 'length'
}
```

`extends` constrains what `T` may be:

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;      // fine — every T has length
}

longest("hello", "hi");                     // string has .length
longest([1, 2, 3], [4]);                    // arrays have .length
longest(10, 20);                            // ERROR — number has no .length
```

Read `T extends { length: number }` as **"T must be assignable to `{ length: number }`"** — not as class inheritance. It is a minimum requirement, and because TypeScript is structurally typed ([17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md) section 5), anything with a `length` qualifies. No `implements`, no declaration, nothing.

Constraining to an interface:

```ts
interface HasId {
  id: string;
}

function indexById<T extends HasId>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
}
```

Note that `T` is preserved in the return type: `indexById(users)` gives `Map<string, User>`, not `Map<string, HasId>`. **That is the thing generics buy you over an interface parameter** — pass `HasId[]`, get `HasId` back; pass `User[]`, get `User` back.

---

## 4. `keyof` and Constrained Keys — The Workhorse Pattern

The most common generic in real code is "get the value of a property whose name is given as a string":

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Ada", age: 30 };

getProperty(user, "name");        // string
getProperty(user, "age");         // number
getProperty(user, "nmae");        // ERROR — not assignable to 'name' | 'age'
```

Three pieces do the work:

| Piece | Means |
|---|---|
| `keyof T` | the union of `T`'s property names — `"name" \| "age"` |
| `K extends keyof T` | K must be *one of those names* |
| `T[K]` | an **indexed access type** — the type of that property |

And because `T[K]` is computed per-key, the return type is exact: `"age"` gives `number`, not `string | number`. A typo like `"nmae"` is a compile error rather than `undefined` at runtime.

`keyof` alone is useful too:

```ts
type UserKeys = keyof User;              // "name" | "age"

function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}
```

That `as` is the honest admission that `Object.keys` genuinely returns `string[]` — it cannot know the object has no other properties ([20_utility_types](../20_utility_types/lecture.md) has more on this).

---

## 5. Generic Types, Interfaces, and Classes

Generics apply to more than functions.

```ts
// A generic interface
interface Box<T> {
  value: T;
}

const b: Box<number> = { value: 42 };

// A generic type alias
type Pair<A, B> = [A, B];
const p: Pair<string, number> = ["Ada", 30];

// A generic class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  get size(): number {
    return this.items.length;
  }
}

const numbers = new Stack<number>();
numbers.push(1);
numbers.push("two");        // ERROR — this stack holds numbers
```

Note `new Stack<number>()` — for classes the type argument goes on the constructor call, and it is usually **not** inferable, because there is nothing to infer from at construction time. Generic classes need the explicit argument far more often than generic functions do.

`Map<K, V>` and `Set<T>` from [05_objects_maps_sets](../05_objects_maps_sets/lecture.md) are the generic classes you have already been using:

```ts
const ages = new Map<string, number>();
ages.set("Ada", 36);
ages.set("Ada", "thirty-six");     // ERROR
```

### Default type parameters

```ts
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

type A = ApiResponse;                    // T is unknown
type B = ApiResponse<User>;              // T is User
```

Useful when there is a sensible default, and it makes the common case shorter. `Promise<T>` has no default for good reason — `Promise<unknown>` is rarely useful.

---

## 6. Constraints That Reference Each Other

A generic can be constrained by another type parameter:

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const users = [
  { name: "Ada", age: 36 },
  { name: "Grace", age: 45 },
];

pluck(users, "name");        // string[]
pluck(users, "age");         // number[]
pluck(users, "email");       // ERROR
```

This is the shape of most real-world generic utilities: one parameter for "the thing", another for "which part of the thing", with the second constrained by the first. `Pick`, `Omit`, and `Record` ([20_utility_types](../20_utility_types/lecture.md)) are all built this way.

---

## 7. When Generics Are the Wrong Tool

Generics add a layer of indirection, and a type parameter that appears only once is dead weight:

```ts
// Pointless — T appears once and constrains nothing
function log<T>(value: T): void {
  console.log(value);
}

// Simpler and clearer
function log(value: unknown): void {
  console.log(value);
}
```

> **The rule of thumb: a type parameter must appear at least twice, or be constrained.** If it appears once and is unconstrained, you wanted `unknown`.

Other signs you have over-generalised:

```ts
// The constraint is so narrow it is really just one type
function process<T extends string>(value: T): T { return value; }
// ...is just
function process(value: string): string { return value; }

// The body needs six casts — the types do not actually fit
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b } as T & U;      // this cast is a warning sign
}
```

Generics should make the code *easier* to read at the call site. If a caller has to write `foo<Map<string, User[]>, number>(...)`, something has gone wrong — either inference is being blocked, or the abstraction is too clever.

**Start concrete.** Write `firstString`, see the duplication, then generalise. Starting generic produces abstractions that do not match how the code is actually used.

---

## 8. A Worked Example

A typed in-memory repository — the generic version of something you would otherwise write per-entity:

```ts
interface Identifiable {
  id: string;
}

class Repository<T extends Identifiable> {
  private items = new Map<string, T>();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  all(): T[] {
    return [...this.items.values()];
  }

  find(predicate: (item: T) => boolean): T[] {
    return this.all().filter(predicate);
  }
}

interface User extends Identifiable {
  name: string;
}

const users = new Repository<User>();
users.add({ id: "u1", name: "Ada" });
users.add({ id: "u2", name: "Grace" });

console.log(users.find((u) => u.name.startsWith("A")));   // u is User, so .name is checked
```

Every use of `u` inside the predicate is fully typed. That is the whole point: one implementation, no `any`, and the compiler still knows what is in the collection.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write `first<T>(items: T[]): T | undefined` and confirm the return type changes per call.
2. Write `identity<T>` and compare inferred versus explicit type arguments.
3. Write the broken `longest<T>` from section 3, read the error, then fix it with `extends { length: number }`.
4. Write `getProperty<T, K extends keyof T>` and prove a typo'd key fails.
5. Make a `Stack<T>` class and prove pushing the wrong type fails.
6. Implement a `Repository<T extends Identifiable>` and use `find` with a typed predicate.
7. Add a second type parameter to `Pair<A, B>` and use it.
8. Write a generic `groupBy<T, K extends keyof T>(items: T[], key: K)`.
9. Take a generic that appears only once and show that `unknown` is the better signature.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — the primary reference
- **Docs:** [TypeScript Handbook — `keyof` Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
- **Docs:** [TypeScript Handbook — Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- **Docs:** [TypeScript Handbook — Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- **Python parallel:** [`typing.TypeVar`](https://docs.python.org/3/library/typing.html#typing.TypeVar) — the same idea, deliberately similar syntax
