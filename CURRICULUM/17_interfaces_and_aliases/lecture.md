# Lecture 17: Interfaces & Type Aliases

TypeScript gives you two ways to name a shape: `interface` and `type`. They overlap heavily, the community argues about them constantly, and the practical answer is short. This lecture also covers the thing that makes them both work — **structural typing** — which is where TypeScript differs most from Python.

---

## 1. Two Ways to Name a Shape

```ts
// An interface
interface User {
  name: string;
  age: number;
}

// A type alias
type User = {
  name: string;
  age: number;
};
```

For this, they are interchangeable. `const u: User = ...` works identically with either.

---

## 2. What Each One Can Do

| Capability | `interface` | `type` |
|---|---|---|
| Object shapes | yes | yes |
| Optional / readonly properties | yes | yes |
| Method signatures | yes | yes |
| **Extending** | `extends` | `&` (intersection) |
| **Declaration merging** | **yes** | **no** |
| **Union types** | **no** | **yes** |
| **Tuple types** | no | yes |
| **Primitive aliases** | no | yes |
| **Mapped / conditional types** | no | yes |
| Implements a class | yes | yes |
| Error message quality | better | worse |

The two rows that actually decide it:

### Unions require `type`

```ts
type Status = "pending" | "active" | "done";     // an interface CANNOT express this
type ID = string | number;
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
```

An interface describes an object. A union is not an object shape, so it needs `type`.

### Declaration merging requires `interface`

Two interfaces with the same name merge into one:

```ts
interface Window {
  myGlobal: string;
}

interface Window {
  anotherGlobal: number;
}

// Window now has BOTH properties
```

This is how libraries extend globals — adding to `Express.Request`, or augmenting `Window`. It is powerful at the edges and dangerous in application code: two files accidentally declaring the same interface name merge silently instead of colliding.

A `type` with a duplicate name is a compile error, which is what you want for your own code.

### Extending

```ts
// interface extends — clearer, and it catches conflicts early
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// type intersection — same result, different mechanism
type Animal = { name: string };
type Dog = Animal & { breed: string };
```

The difference shows up in conflicts. `interface` reports an error when you extend with an incompatible property; `&` silently produces `never` for that property:

```ts
interface A { x: string }
interface B extends A { x: number }          // error: incompatible types

type C = { x: string } & { x: number };      // no error — x is `string & number`, which is never
```

That silent `never` is a genuinely nasty debugging experience.

---

## 3. Which to Use

The community consensus, which this repo follows:

> **Use `interface` for object shapes that describe a "thing". Use `type` for everything else — unions, tuples, primitives, mapped types, function types.**

A corollary many people adopt because it is mechanical: **start with `interface`, switch to `type` the moment you need something an interface cannot express.** You never have to make a judgement call.

Reasons interface edges ahead for objects:

1. **Better error messages.** When a property is missing, TypeScript prints the interface's name. With a type alias you often get the whole expanded shape inlined into the error.
2. **Faster compilation** on very large codebases, because interfaces are cached by name.
3. **Declaration merging** is available when you need it.

Reasons `type` is required:

```ts
type Status = "a" | "b";                     // union
type Pair = [string, number];                // tuple
type ID = string | number;                   // alias for a primitive
type Handler = (e: Event) => void;           // function type
type Keys = keyof User;                      // derived type
type Mapped<T> = { [K in keyof T]: T[K][] }; // mapped type
```

For a plain function type, `type` is the convention:

```ts
type Handler = (event: string) => void;      // idiomatic
interface Handler {                          // legal but nobody writes this
  (event: string): void;
}
```

---

## 4. Properties: Optional, Readonly, and Indexed

```ts
interface User {
  readonly id: number;             // assignable once, then locked
  name: string;
  email?: string;                  // may be absent — type is string | undefined
  readonly tags: string[];         // the ARRAY is readonly, not its contents!
  nickname?: string | null;        // three states: string, null, or absent
}
```

`readonly` is shallow and compile-time only:

```ts
const u: User = { id: 1, name: "Ada", tags: [] };

u.id = 2;              // error — readonly
u.name = "Grace";      // fine
u.tags = [];           // error — cannot reassign
u.tags.push("x");      // FINE — readonly does not freeze the array's contents

// For a truly immutable array
interface User2 {
  readonly tags: readonly string[];
}
```

**`readonly` prevents accidents, not mutation.** It is erased at runtime, like everything else.

### Index signatures — a dictionary type

```ts
interface Scores {
  [name: string]: number;          // any string key maps to a number
}

const s: Scores = { ada: 95, grace: 88 };
s["anyone"];                       // typed number — but could be undefined at runtime
```

The lie in that last comment is the one from [05_objects_maps_sets](../05_objects_maps_sets/lecture.md) section 8. `Record<string, number>` is the tidier spelling of the same thing:

```ts
type Scores = Record<string, number>;
```

You can mix a fixed set of keys with an index signature, but the fixed keys must conform:

```ts
interface Config {
  host: string;
  [key: string]: string;           // host must be a string too, or this errors
}
```

---

## 5. Structural Typing — The Big Idea

This is the most important concept in the lecture, and the one that differs most from Python.

**TypeScript compares shapes, not names.** Two types with the same structure are interchangeable, whatever they are called.

```ts
interface Point {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

const p: Point = { x: 1, y: 2 };
const c: Coordinate = p;        // legal — same shape, so the same type
```

Nothing about the *name* `Point` is enforced. This is often called **duck typing** — "if it walks like a duck and quacks like a duck" — but checked at compile time rather than at runtime.

The practical payoff is enormous:

```ts
interface Logger {
  log(message: string): void;
}

// This class never mentions Logger, and needs no `implements`
class ConsoleLogger {
  log(message: string): void {
    console.log(message);
  }
}

function run(logger: Logger): void {
  logger.log("hello");
}

run(new ConsoleLogger());       // works — the shape is all that matters
```

That is why `implements` is optional much of the time, and why you can pass an object literal where an interface is expected without declaring anything.

### Where extra properties are fine

```ts
interface Named {
  name: string;
}

const person = { name: "Ada", age: 30, city: "London" };
const n: Named = person;        // legal — it HAS a name, plus more
```

Subsets are not assignable, supersets are:

```ts
interface NamedAndAged {
  name: string;
  age: number;
}

const justNamed: Named = { name: "Ada" };
const both: NamedAndAged = justNamed;    // ERROR — age is missing
```

### The one wrinkle: excess property checks

Object **literals** assigned directly are checked exactly, while values passed through a variable are not ([16_type_annotations](../16_type_annotations/lecture.md) section 6):

```ts
const a: Named = { name: "Ada", age: 30 };      // ERROR — 'age' does not exist in type 'Named'

const viaVariable: Named = person;               // fine — same value, different path
```

This exists to catch typos in literals — `{ nmae: "Ada" }` is reported rather than silently accepted. It is inconsistent, and knowing why saves a lot of confusion.

### Structural typing has a cost

```ts
interface User {
  id: string;
}

interface Product {
  id: string;
}

const product: Product = { id: "P1" };
const user: User = product;     // legal. It is a Product. But it has the shape of a User.
```

The types are compatible because the shapes are, even though a product ID and a user ID are conceptually different. The fix is a **branded type**:

```ts
type UserId = string & { readonly __brand: "UserId" };
type ProductId = string & { readonly __brand: "ProductId" };
```

Now they are structurally distinct even though both are strings. That is [23_advanced_types](../23_advanced_types/lecture.md) territory, and worth knowing exists.

---

## 6. Extending, Implementing, and Composing

```ts
interface Animal {
  name: string;
  speak(): string;
}

// extends — a subclass-like relationship
interface Dog extends Animal {
  breed: string;
}

// A class implements an interface: the interface is a CONTRACT
class Labrador implements Dog {
  constructor(
    public name: string,
    public breed: string,
  ) {}

  speak(): string {
    return "Woof";
  }
}
```

`implements` **checks** that the class satisfies the interface. It adds no runtime behaviour and creates no inheritance — the class does not get the interface's members, it must supply them itself. A class can implement several interfaces:

```ts
class Service implements Readable, Closeable {
  read(): string { return ""; }
  close(): void {}
}
```

A class can also `extends` one class **and** `implements` interfaces at the same time:

```ts
class Derived extends Base implements Serializable, Comparable { }
```

### Intersections compose types

```ts
type Timestamped = { createdAt: Date; updatedAt: Date };
type SoftDeletable = { deletedAt: Date | null };

type Record = Timestamped & SoftDeletable & { id: number };
```

This is the composition-over-inheritance idea made cheap. Prefer small pieces joined with `&` over deep hierarchies — the same advice as in [09_classes_oop](../09_classes_oop/lecture.md) section 7.

---

## 7. Common Mistakes with These Tools

**Over-annotating.** If a value is created and consumed nearby, inference is better. Types are for boundaries: function parameters, exports, and shared contracts.

**Making everything an interface.** A `Status` union cannot be an interface; a `Handler` function type reads better as `type`. Use each for what it is good at.

**`any` in an interface.** It spreads to every consumer:
```ts
interface Config {
  data: any;          // every read of config.data is now unchecked
}
// prefer
interface Config {
  data: unknown;      // force the consumer to narrow
}
```

**Optional everywhere.** `email?: string` on a type where email is always present makes every consumer handle a case that never happens. Optional means *genuinely sometimes absent*.

**Treating `readonly` as immutability.** It is shallow and erased. `Object.freeze` is the runtime version, and even that is shallow.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Declare the same `User` shape as both an `interface` and a `type`. Assign a value to each and confirm they behave identically.
2. Add a union `Status` and explain in a comment why an interface cannot express it.
3. Declare two interfaces named `Merged` in the same file and show that they merge. Then do the same with `type` and read the error.
4. Give an interface a `readonly` property and an optional one. Try to assign to the readonly, and read a missing optional as `undefined`.
5. Prove structural typing: two identically shaped interfaces, one assigned to the other with no cast.
6. Write a class that never mentions an interface, then pass an instance where the interface is expected.
7. Trigger an excess property check with a literal, then pass the same object through a variable.
8. Write a `type Handler` function type and a function that accepts it.
9. Compose three small types with `&` into a bigger one.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- **Docs:** [TypeScript Handbook — Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)
- **Docs:** [TypeScript Handbook — Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)
- **Docs:** [TypeScript — Type Compatibility (structural typing)](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- **Article:** [Interfaces vs Types in TypeScript](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) — the handbook's own summary table
