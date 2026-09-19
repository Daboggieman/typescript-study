# OOP 06: Static Members

Every field and method so far has belonged to *an instance*. `static` moves a member onto the **class itself**. That sounds like a small syntactic variation. It is not — a static member lives in a different place in memory, has no access to instance state, and is inherited by subclasses in a way that catches people out.

---

## Part 1 — What `static` Means

```ts
class Circle {
  // Instance members — one copy per object, reachable as `c.radius`
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  // Static members — one copy total, reachable as `Circle.PI`
  static readonly PI = 3.141592653589793;

  static unit(): Circle {
    return new Circle(1);
  }
}

const c = new Circle(5);
c.radius;          // fine
c.area();          // fine

Circle.PI;         // fine — on the class
Circle.unit();     // fine — a factory
new Circle(5).PI;  // undefined! `PI` is NOT on the instance
```

Two rules, and everything else follows:

1. **A static member belongs to the class, not to any object.** There is exactly one copy, created when the class is defined.
2. **A static method has no `this` of the instance kind.** Inside a static method, `this` is *the class itself*.

That second rule is the one that trips people up:

```ts
class Counter {
  static count = 0;

  static increment(): void {
    this.count += 1;        // `this` is Counter, so this is Counter.count
  }

  reset(): void {
    this.count = 0;         // ERROR TS2339: Property 'count' does not exist on type 'Counter'
  }                         // — an instance method cannot see a static by bare name
}
```

An instance method reaching for a static must say where it lives:

```ts
reset(): void {
  Counter.count = 0;        // explicit, and correct
}
```

> **The mental model: statics and instances are two separate namespaces.** `Counter.count` and `counter.count` are unrelated. Writing `this.count` means one or the other depending on whether you are in a static method or an instance method, which is a genuine wart — when in doubt, spell out the class name.

---

## Part 2 — When to Use a Static

Three uses hold up. Everything else is usually a sign the thing should be a plain function or a module-level constant.

### 2.1 Constants that belong to the concept

```ts
class Circle {
  static readonly PI = Math.PI;
  static readonly MAX_RADIUS = 1_000;
}
```

`Circle.PI` reads better than a free-floating `PI` and it is namespaced, so two classes can each have their own `PI`. This is the JavaScript equivalent of a class constant.

**`static readonly` is the combination you want.** `static` alone is reassignable by anyone: `Circle.PI = 3` compiles and silently breaks every area calculation in the program.

### 2.2 Factories

The most valuable use, and it connects directly to [lesson 02](../02_constructors/lecture.md):

```ts
class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
  ) {}

  static create(name: string, email: string): User {
    return new User(crypto.randomUUID(), name, email);
  }

  static guest(): User {
    return new User("guest", "Guest", "");
  }

  static fromJSON(raw: string): User {
    const data = JSON.parse(raw) as { id: string; name: string; email: string };
    return new User(data.id, data.name, data.email);
  }

  static async load(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { id: string; name: string; email: string };
    return new User(data.id, data.name, data.email);
  }
}

const a = User.create("Ada", "ada@example.com");
const b = User.guest();
const c = await User.load("42");
```

The `private constructor` is what makes this pattern work: it forces every caller through a named factory. `new User(...)` is a compile error, so there is no way to build a `User` with a missing id — every construction goes through a method whose name says what it is doing.

A factory is the answer whenever **constructing the object involves more than assigning arguments**: generating an id, parsing input, awaiting a network call, choosing between several shapes.

### 2.3 Shared state that genuinely is shared

A counter of instances, a cache, a registry:

```ts
class Connection {
  static #open = 0;

  static get openCount(): number {
    return Connection.#open;
  }

  constructor() {
    Connection.#open += 1;
  }

  close(): void {
    Connection.#open -= 1;
  }
}
```

> **The warning.** Static mutable state is global state wearing a class costume. Every test that touches it starts from whatever the last test left behind, and it is the reason the **singleton pattern** ([quest `oop_singleton_pattern`](../../quest/questions/03_hard/oop_singleton_pattern.md)) is controversial. Use it for genuinely process-wide things — a pool, a registry, a build-time counter — and prefer a module-level `const` for anything that never changes.

Statics can be private, which is often what you want:

```ts
class Id {
  static #next = 1;

  static reserve(): number {
    return Id.#next++;
  }
}
```

`private static` and `#` static both work, and `#` is again the runtime-enforced one.

---

## Part 3 — Static and Initialisation Order

Statics are evaluated **when the class declaration runs**, in source order, before any instance exists. That matters when one static refers to another:

```ts
class Config {
  static readonly NAME = "app";
  static readonly LABEL = `${Config.NAME} v1`;      // fine — NAME already ran
}

class Broken {
  static readonly LABEL = `${Broken.NAME} v1`;      // TypeError at load time
  static readonly NAME = "app";
}
```

`Broken.LABEL` runs before `Broken.NAME` is assigned, so `Broken.NAME` is `undefined` and the template produces `"undefined v1"` — or throws outright if you call a method on it. **Statics run top to bottom, once.** If you must reference a sibling, order the declarations so the dependency comes first.

---

## Part 4 — Static in Inheritance

A static member is inherited, and `this` inside a static method is the **class it was called on** — not the class it was defined on. This is identical in spirit to instance `this`, and it is genuinely useful:

```ts
class Animal {
  static kind(): string {
    return this.name;              // the class's own name
  }
}

class Dog extends Animal {}

Animal.kind();      // "Animal"
Dog.kind();         // "Dog"  — `this` was the subclass
```

`Dog.kind()` works because `this` is `Dog`, not because `kind` was overridden. The method is written once and its answer depends on who asked.

### Making a factory inherit

The same idea applied to a factory needs one extra piece of syntax, and it is worth learning rather than guessing at:

```ts
class Animal {
  static create<T extends Animal>(this: new () => T): T {
    return new this();
  }
}

class Dog extends Animal {}

Animal.create();    // an Animal
Dog.create();       // a Dog
```

Read that signature carefully, because both `this`es mean different things:

- **`this: new () => T`** is a **`this` parameter** — the TypeScript-only fake first argument from [lesson 03](../03_this_and_binding/lecture.md). It says "this method may only be called on a constructor that takes no arguments and produces a `T`".
- **`T extends Animal`** then gets *inferred from that receiver*. When you write `Dog.create()`, the compiler fills in `T = Dog`.

`new this()` inside then constructs whatever it was called on. The `this` parameter is doing the work — without it there is nothing to infer `T` from, which is why this pattern looks more ceremonial than you would expect.

**And here is the pitfall.** A static that names its own class explicitly does not inherit that way:

```ts
class Animal {
  static create(): Animal {
    return new Animal();              // hard-coded — ALWAYS an Animal
  }
}

class Dog extends Animal {}

Dog.create();       // an Animal. Not a Dog. No error, no warning.
```

The call typechecks, because a `Dog` *is* an `Animal`. The bug is invisible until something calls a `Dog` method on the result. **Any factory on a class you expect people to subclass needs the `this` parameter form above.**

### Statics are not on the prototype chain of instances

```ts
class A {
  static helper(): string { return "hi"; }
}

new A().helper();      // ERROR TS2339: Property 'helper' does not exist on type 'A'
```

An instance has no route to a static through the dot. `instance.helper` is `undefined`. (There is a `constructor` reference — `instance.constructor.helper()` — but typing it precisely is awkward and you should not reach for it.)

---

## Part 5 — Static Blocks

For initialisation that needs more than one expression, ES2022 added **static blocks**:

```ts
class Lookup {
  static readonly table: Map<string, number> = new Map();

  static {
    for (const [i, name] of ["zero", "one", "two"].entries()) {
      Lookup.table.set(name, i);
    }
  }
}

Lookup.table.get("two");      // 2
```

The `static { ... }` block runs once, at class-definition time, in order with the other statics. It exists because a `static readonly` field does not have to be *assigned* in one expression:

> **Note what `readonly` did and did not do here.** It stopped `Lookup.table = someOtherMap`, but it did **not** stop `Lookup.table.set(...)` — the map's contents are still mutable. That is the shallow-`readonly` point from [lesson 05](../05_methods_and_encapsulation/lecture.md), and the static block is a natural place to trip over it.

Note the assignment style is `Lookup.table.set(...)`, and any reassignment inside the block would be written `Lookup.table = m` rather than `this.table = m`. Inside a static block `this` is the class and either works, but naming the class is what you will see in most code.

---

## Part 6 — Predicting the Output

```ts
class Counter {
  static #count = 0;

  static increment(): void {
    Counter.#count += 1;
  }

  static get count(): number {
    return Counter.#count;
  }
}

Counter.increment();
Counter.increment();
console.log(Counter.count);
```

And the inheritance one:

```ts
class Base {
  static label = "base";

  static describe(): string {
    return `I am ${this.label}`;
  }
}

class Sub extends Base {
  static label = "sub";
}

console.log(Base.describe());
console.log(Sub.describe());
```

<details>
<summary>Answers</summary>

**First:** `2`.

There is one `#count`, on the class. Two calls to a static method increment the same slot. No instance was ever created — which is the whole point: **statics do not need an object.**

**Second:** `"I am base"` then `"I am sub"`.

`describe` is written once on `Base`, but `this` inside it is whichever class was used to call it. `Sub.describe()` gets `this === Sub`, so `this.label` reads `Sub.label`.

This is worth being careful about, because it is a *static field shadowing* situation: `Sub.label` does not overwrite `Base.label`, it creates a second one. `describe` reads whichever `this` points at.

Compare with a version that names the class explicitly — `Base.describe()` and `Sub.describe()` would both print `"I am base"`, and that is the trap from Part 4.

</details>

---

## Part 7 — Cheat Sheet Summary

```ts
class User {
  static readonly MAX_NAME = 50;          // one copy, on the class

  static #createdCount = 0;               // private static state

  static create(name: string): User {     // a factory
    if (name.length > User.MAX_NAME) {
      throw new RangeError("name too long");
    }
    User.#createdCount += 1;
    return new User(crypto.randomUUID(), name);
  }

  static get createdCount(): number {     // a static getter
    return User.#createdCount;
  }

  private constructor(
    readonly id: string,
    readonly name: string,
  ) {}
}

User.create("Ada");        // the only way in — the constructor is private
User.MAX_NAME;             // 50
User.createdCount;         // 1
new User("x", "Ada");      // ERROR — constructor is private
```

| Idea | One-line version |
|---|---|
| `static` | Lives on the class, not on any instance. One copy. |
| `this` in a static method | The **class it was called on**, not the one it was defined in |
| Instance reaching a static | Must write `ClassName.member` — bare `this.member` fails |
| `static readonly` | The combination you want for constants |
| Factories | The best use. Pair with a `private constructor` to force the named path |
| Inheriting factory | `static create<T extends Animal>(this: new () => T): T { return new this(); }` |
| Pitfall | `static create(): Animal { return new Animal(); }` — always the base class |
| `static {}` block | For initialisation needing more than one expression |
| Initialisation order | Top to bottom, once, at class-definition time — a sibling reference above its declaration is `undefined` |
| The warning | Static mutable state is global state wearing a costume |

---

## Self-Check

- [ ] Where does a static member live, and how many copies exist?
- [ ] Inside a static method, what is `this`?
- [ ] Why does an instance method need `Counter.count` rather than `this.count`?
- [ ] What does `private constructor` plus a `static create` buy you?
- [ ] Which return type makes a static factory work correctly in subclasses, and what goes wrong without it?
- [ ] Why is static mutable state dangerous, and what is the alternative for a plain constant?

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Static Members](https://www.typescriptlang.org/docs/handbook/2/classes.html#static-members)
- **Reference:** [MDN — `static`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)
- **Reference:** [MDN — Class static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
- **Pattern:** [Factory Method](https://refactoring.guru/design-patterns/factory-method) — the pattern behind Part 2.2
- **Pattern:** [Singleton](https://refactoring.guru/design-patterns/singleton) — including a candid "criticism" section
- **Python parallel:** [Python `@staticmethod` / `@classmethod`](https://docs.python.org/3/library/functions.html#staticmethod) — note that Python's `classmethod` is the closer analogue of what `this` does here

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Add `static readonly PI` to a `Circle` and show `instance.PI` is `undefined`.
2. Add a `static count` and confirm two instances share one slot.
3. Try `this.count` from an instance method and read the compile error.
4. Write a `User` with a `private constructor` and a `static create`.
5. Add `static fromJSON` and confirm `new User(...)` no longer compiles.
6. Write `static create(): this { return new this(); }` and show a subclass gets the right type.
7. Change it to `static create(): Animal { return new Animal(); }` and watch the subclass factory lie.
8. Write a `static {}` block that builds a `Map`, and compare it with the IIFE spelling.
