# Lecture 20: Utility Types

TypeScript ships a library of type **transformations** — types that take a type and produce a new one. They are how you avoid declaring the same shape five times in five slightly different forms. Python's `typing` module has a few of these (`Optional`, `Union`, `TypedDict` variants); TypeScript has a whole toolbox, and they compose.

Two of these — `Partial` and `Omit` — you will use every week. The rest you will reach for occasionally and be glad they exist. All of them are built from the mapped and conditional types in [23_advanced_types](../23_advanced_types/lecture.md); this lecture is about *using* them, not building them.

---

## 1. `Partial<T>` and `Required<T>`

`Partial<T>` makes every property optional:

```ts
interface User {
  id: string;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string }
```

The use case is an update payload — where any subset of fields may be supplied:

```ts
function updateUser(id: string, changes: Partial<User>): User {
  // ...
}

updateUser("u1", { name: "Grace" });              // fine — only one field
updateUser("u1", { email: "g@example.com" });     // fine
updateUser("u1", { nmae: "Grace" });              // ERROR — typo caught
```

Without `Partial` you would write a second `UpdateUser` interface by hand, and it would drift out of sync the first time `User` changed. **Derive, do not duplicate.**

`Required<T>` is the inverse — it strips the `?`:

```ts
interface Config {
  host?: string;
  port?: number;
}

type FullConfig = Required<Config>;    // both mandatory
```

Note it does **not** remove `undefined` from a property explicitly typed `string | undefined`; it only removes the optional marker. `{ host?: string }` and `{ host: string | undefined }` look similar and are not the same — the first permits absence, the second requires the key.

---

## 2. `Readonly<T>`

Makes every property read-only:

```ts
type FrozenUser = Readonly<User>;

const u: FrozenUser = { id: "u1", name: "Ada", email: "a@example.com" };
u.name = "Grace";        // ERROR — cannot assign to 'name' because it is a read-only property
```

Like the `readonly` modifier ([17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md) section 4), this is **shallow** and **compile-time only**. Nested objects are still mutable, and nothing is frozen at runtime:

```ts
interface Team {
  name: string;
  members: User[];
}

const t: Readonly<Team> = { name: "Core", members: [] };
t.name = "Other";         // ERROR
t.members.push(user);     // FINE — the array itself is not readonly
t.members = [];           // ERROR — the property is
```

`ReadonlyArray<T>` (or `readonly T[]`) is the array-level version and is the one that actually prevents `push`.

---

## 3. `Pick<T, K>` and `Omit<T, K>`

`Pick` keeps only the named properties:

```ts
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }
```

`Omit` drops them:

```ts
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string }
```

`Omit` is the more common of the two, and its canonical use is exactly this — a record *before* it has an id:

```ts
type NewUser = Omit<User, "id">;

function createUser(input: NewUser): User {
  return { ...input, id: crypto.randomUUID() };
}

createUser({ name: "Ada", email: "a@example.com" });          // fine
createUser({ id: "u1", name: "Ada", email: "a@example.com" }); // ERROR — id is not expected
```

That `NewUser` type is derived from `User`, so when you add a `phone` field to `User`, `NewUser` picks it up automatically. Two hand-written interfaces would not.

```ts
// Omitting several
type PublicUser = Omit<User, "id" | "email">;
```

> **`Pick` and `Omit` both accept a union of keys** — `"id" | "name"` — which is why they compose so well with `keyof` and the `typeof`-over-a-value idiom in section 8.

---

## 4. `Record<K, V>`

`Record` builds an object type with a known key set:

```ts
type Status = "pending" | "active" | "done";

type StatusCounts = Record<Status, number>;
// { pending: number; active: number; done: number }

const counts: StatusCounts = { pending: 1, active: 2, done: 3 };

// MISSING A KEY is a compile error — this is the valuable part
const bad: StatusCounts = { pending: 1, active: 2 };
// ERROR: property 'done' is missing
```

That is the difference from an index signature. `Record<Status, number>` demands **exactly** those three keys — no more, no fewer — so adding a fourth status breaks every place that builds one. A `{ [k: string]: number }` would accept anything.

With `string` or `number` as the key it *is* an index signature:

```ts
type Counts = Record<string, number>;      // equivalent to { [k: string]: number }
```

`Record<string, V>` is preferred over the index-signature spelling — shorter and more obviously a type.

---

## 5. `Exclude`, `Extract`, `NonNullable`

These work on **unions**, not objects — a distinction worth holding on to, because they are the pair people mix up with `Pick`/`Omit`.

```ts
type T = "a" | "b" | "c";

type WithoutA = Exclude<T, "a">;          // "b" | "c"   — remove members
type OnlyA = Extract<T, "a">;             // "a"         — keep members

type Mixed = string | number | null | undefined;
type NoNull = NonNullable<Mixed>;         // string | number
type StringsOnly = Extract<Mixed, string>; // string
```

The idiom that makes `Exclude` shine — deriving a union from another union:

```ts
type EventKind = "click" | "focus" | "blur";

// Everything except "click"
type NonClickEvent = Exclude<EventKind, "click">;
```

`NonNullable` appears constantly in real code:

```ts
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>;    // User
```

And it is the type-level form of the runtime check you would otherwise write:

```ts
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>;    // User

function orThrow(user: MaybeUser): DefiniteUser {
  if (user == null) throw new Error("no user");
  return user;                 // narrowed — no assertion needed
}
```

The loose `== null` is deliberate: it catches both `null` and `undefined` in one check, and it is the one place where loose equality is the idiomatic choice ([02c_operators](../02c_operators/lecture.md)).

---

## 6. `ReturnType`, `Parameters`, `Awaited`

These read a *function's* type and pull pieces out of it.

```ts
function createUser(name: string, age: number): User {
  return { id: "u1", name, email: "" };
}

type UserFromFunction = ReturnType<typeof createUser>;         // User
type Args = Parameters<typeof createUser>;                     // [name: string, age: number]
type FirstArg = Parameters<typeof createUser>[0];              // string
```

Note `typeof createUser` — you need the `typeof` because `createUser` alone is a *value*, and `ReturnType` takes a *type*.

`Awaited<T>` unwraps a promise:

```ts
async function fetchUser(): Promise<User> {
  return { id: "u1", name: "Ada", email: "" };
}

type Fetched = Awaited<ReturnType<typeof fetchUser>>;          // User
```

Why bother, rather than just writing `User`? **Because it cannot drift.** If `fetchUser` changes to return `AdminUser`, `Fetched` follows and every consumer is re-checked. Writing `User` by hand would compile and be wrong.

The cost is readability — `Awaited<ReturnType<typeof fetchUser>>` is dense, and a reviewer has to unpack it. For a *public* API, an explicitly named type is usually kinder. For internal glue, deriving is worth it.

---

## 7. Combining Them

Where these become genuinely powerful is composition:

```ts
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// An update payload: no id, no createdAt, everything else optional
type UserUpdate = Partial<Omit<User, "id" | "createdAt">>;
// { name?: string; email?: string }

// A public view: no email
type PublicUser = Omit<User, "email">;

// A map keyed by id
type UserIndex = Record<string, User>;

// Just the mutable fields
type EditableFields = Pick<User, "name" | "email">;

// The read-only version of the whole thing
type ImmutableUser = Readonly<User>;
```

And with `keyof`, the derived-key style:

```ts
type UserKey = keyof User;                        // "id" | "name" | "email" | "createdAt"

function sortBy<T, K extends keyof T>(items: T[], key: K): T[] {
  return [...items].sort((a, b) => (String(a[key]) < String(b[key]) ? -1 : 1));
}
```

The `String(...)` wrapper is not decoration. `<` cannot be applied to two values of an unconstrained generic type — the compiler has no reason to believe `T[K]` is comparable — so converting to a string first is both how you satisfy the compiler and, for a generic sort, usually what you meant anyway.

That is the pattern from [19_generics](../19_generics/lecture.md) section 4, and it is everywhere in real code.

---

## 8. `typeof` and `as const` — Deriving Types From Values

The one construct you must know. Instead of writing a type and a matching object:

```ts
// Written twice — they will drift
type Status = "pending" | "active" | "done";
const STATUSES = ["pending", "active", "done"];

// Written once
const STATUSES = ["pending", "active", "done"] as const;
type Status = (typeof STATUSES)[number];         // "pending" | "active" | "done"
```

Read `(typeof STATUSES)[number]` as: *the type you get by indexing `STATUSES` with any number* — i.e. the union of its element types. It is the idiomatic way to derive a union from an array.

The object version:

```ts
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
} as const;

type RouteName = keyof typeof ROUTES;                    // "home" | "about" | "contact"
type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];   // "/" | "/about" | "/contact"
```

`keyof typeof ROUTES` gives the **keys**; `(typeof ROUTES)[keyof typeof ROUTES]` gives the **values**. Both come up constantly.

Without `as const` this all collapses to `string`, because the values widen ([16_type_annotations](../16_type_annotations/lecture.md) section 5). `as const` is not optional here — it is what makes the literal types survive.

You should also know `as const satisfies`:

```ts
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
} as const satisfies Record<string, `/${string}`>;
```

That asserts the values all start with `/` **and** keeps the narrow literal types. It is the modern way to write a constant table: validated and precise.

---

## 9. `satisfies`

The operator that finally got this right in TypeScript 4.9 ([16_type_annotations](../16_type_annotations/lecture.md) section 4 introduced it; here is the practical case).

```ts
// Annotation: checked, but WIDENED
const config1: Record<string, string> = { host: "localhost", port: "8080" };
config1.host;                   // string
config1.typo;                   // string — no error! The index signature accepts anything

// `as`: not checked at all
const config2 = { host: "localhost" } as Record<string, string>;

// `satisfies`: checked AND narrow
const config3 = { host: "localhost", port: "8080" } satisfies Record<string, string>;
config3.host;                   // string, but config3.typo is an ERROR
```

The three-way comparison is worth internalising:

| Form | Checked? | Resulting type |
|---|---|---|
| `const x: T = value` | yes | `T` — widened, keys lost |
| `const x = value as T` | **no** | `T` — widened, unchecked |
| `const x = value satisfies T` | **yes** | inferred from `value` — narrow, keys kept |

A concrete case where it matters:

```ts
type Routes = Record<string, { path: string; title: string }>;

const routes = {
  home: { path: "/", title: "Home" },
  about: { path: "/about", title: "About" },
} satisfies Routes;

routes.home.path;         // fine
routes.hoem;              // ERROR — the keys are known
// routes.anything.path;  // ERROR — no index signature leaked through
```

With an annotation you would lose `routes.home`; with `as` you would lose the check. `satisfies` gives you both, and it is the right default for a constants table.

---

## 10. What Is Not in the Standard Library

A few omissions worth knowing, because you will look for them:

- **No `DeepPartial`.** `Partial` is one level deep. Deep versions exist in libraries like `type-fest`.
- **No `Merge<A, B>`.** Intersections with `&` are the built-in answer.
- **No `Mutable<T>`.** You write `{ -readonly [K in keyof T]: T[K] }` yourself ([23_advanced_types](../23_advanced_types/lecture.md)).
- **No `ValueOf<T>`.** The idiom `T[keyof T]` covers it.

When you find yourself wanting `DeepPartial`, that is usually a signal that the state shape is more nested than it needs to be.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Make `Partial<User>` and assign an object with one field.
2. Make `Required<Config>` and try constructing it with a field missing.
3. Make `Readonly<User>` and try to assign; then prove nested arrays are still mutable.
4. Write `NewUser = Omit<User, "id">` and a `createUser` that takes it.
5. Write `UserPreview = Pick<User, "id" | "name">`.
6. Build `Record<Status, number>` and leave a key out to see the error.
7. Use `Exclude` and `Extract` on a three-member union.
8. Use `NonNullable` on `User | null | undefined`.
9. Derive a union from an array with `as const` and `(typeof X)[number]`.
10. Write the same config object with an annotation, `as`, and `satisfies`, and compare what you can access on each.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) — the complete list, with every built-in
- **Docs:** [TypeScript Handbook — `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- **Docs:** [TypeScript Handbook — `as const`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- **Library:** [type-fest](https://github.com/sindresorhus/type-fest) — the community's collection of the utility types TypeScript left out
- **Article:** [The `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) — the release notes that introduced it
