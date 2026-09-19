# OOP 02: Constructors

Lesson 01 closed the shape problem: fields are declared, so every instance has them. But a field with a default is a field that says the same thing about every object. This lesson is about the values that are **different for each object** — and about making it impossible to construct an incomplete one.

That is what a constructor is for.

---

## Part 0 — The Problem With Defaults

Lesson 01 left us here:

```ts
class Dog {
  name = "unnamed";
  age = 0;
}

const rex = new Dog();
rex.name = "Rex";        // works, but nothing made you do it
rex.age = 3;

const mystery = new Dog();   // a dog called "unnamed", aged 0. Nobody wanted this.
```

The class compiles, every field is initialised, and the problem from the Python lesson is still entirely present: **you can build a dog and forget to give it a name.** The defaults just hide it — `mystery` is not an error, it is a wrong dog.

> **The insight for this lesson:** a *default* answers "what if nobody says?", and the answer for a name is "nobody should be allowed to say nothing".

What you want is a class where `new Dog()` does not compile, and `new Dog("Rex", 3)` does. The mechanism is a **constructor**.

---

## Part 1 — The Constructor

A constructor is a special method that runs when an object is built. It is where you demand the values an instance cannot sensibly exist without.

```ts
class Dog {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

const rex = new Dog("Rex", 3);       // fine
const bad = new Dog();               // ERROR: Expected 2 arguments, but got 0
```

That error is the whole point, and it is worth pausing on. **An incomplete `Dog` is now impossible to create.** Not "discouraged", not "caught in review" — impossible. The compiler will not let the program exist.

> **Python comparison.** `__init__` is a normal method you call with `self` explicitly, and it can be called again on an existing object (`rex.__init__("Fido", 5)` works, and mutates `rex`). A TypeScript `constructor` is **not** callable after construction at all — `rex.constructor(...)` is a syntax error. A constructor runs exactly once, when `new` builds the object, and never again. If you want "re-initialise this object", write an ordinary method.

### What the compiler checks

```ts
class Dog {
  name: string;
  age: number;

  constructor(name: string) {
    this.name = name;
    // forgot this.age
  }
}
```

```text
error TS2564: Property 'age' has no initializer and is not definitely assigned
in the constructor.
```

`strictPropertyInitialization` ([CURRICULUM/21](../../CURRICULUM/21_tsconfig_deep_dive/lecture.md)) knows exactly what a constructor is for. It will accept a field that has a default, a field assigned in the constructor, or a field marked `!` — and nothing else.

Note what it does *not* check: it does not follow your logic. `if (condition) this.age = age;` satisfies the compiler even though the `else` branch leaves the field `undefined`. The check is syntactic, and it is a good servant and a poor master.

---

## Part 2 — Parameter Properties: The TypeScript Shorthand

The three-step dance above — declare, receive, assign — is so common that TypeScript has a shorthand. Put an **access modifier** on a constructor parameter and it does all three:

```ts
// The long way
class DogLong {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// The same class, in three lines
class Dog {
  constructor(
    public name: string,
    public age: number,
  ) {}
}
```

Identical behaviour. The modifier (`public`, `private`, `protected`, or `readonly`) on a parameter is the signal: *declare a field with this name, with this modifier, and assign the argument to it.*

```ts
class User {
  constructor(
    public readonly id: string,      // public, and can never change after construction
    private email: string,           // only this class can read it
    public nickname?: string,        // optional — may be omitted
  ) {}
}

const u = new User("u1", "ada@example.com");
u.id;            // "u1"
u.email;         // ERROR: Property 'email' is private
u.id = "u2";     // ERROR: Cannot assign to 'id' because it is a read-only property
```

This is the idiomatic style, and you will see it constantly in real TypeScript. Two things worth knowing before you adopt it everywhere:

- **You cannot mix it with a closure over the parameter.** A parameter property is only a shorthand for that declare-assign pattern; anything more elaborate needs the long form.
- **It hides work in the signature.** A constructor with six parameter properties is doing six assignments you cannot see. That is fine at three, unhelpful at eight.

`readonly` is the one to reach for most often: **anything that is set from a constructor and never changed should be `readonly`**, and the compiler will then enforce it for the life of the object.

---

## Part 3 — One Constructor, Not Several

Python has no constructor overloading either, but it fakes it well with default arguments:

```python
def __init__(self, name, age=0, breed="unknown"):
    ...
```

TypeScript has default parameters too, and they work the same way:

```ts
class Dog {
  constructor(
    public name: string,
    public age: number = 0,
    public breed: string = "unknown",
  ) {}
}

new Dog("Rex");                      // age 0, breed "unknown"
new Dog("Rex", 3);                   // breed "unknown"
new Dog("Rex", 3, "Labrador");       // all three
```

**But JavaScript classes allow exactly one constructor.** Where Python and Java would declare three `__init__` overloads, TypeScript requires you to write one real implementation plus **overload signatures** describing the permitted shapes:

```ts
class Point {
  x: number;
  y: number;

  // Overload signatures — declarations only, no bodies
  constructor(x: number, y: number);
  constructor(coords: [number, number]);
  constructor(from: { x: number; y: number });

  // The implementation — the only body, and the only one that runs
  constructor(a: number | [number, number] | { x: number; y: number }, b?: number) {
    if (typeof a === "number") {
      this.x = a;
      this.y = b ?? 0;
    } else if (Array.isArray(a)) {
      this.x = a[0];
      this.y = a[1];
    } else {
      this.x = a.x;
      this.y = a.y;
    }
  }
}

new Point(1, 2);              // fine
new Point([1, 2]);            // fine
new Point({ x: 1, y: 2 });    // fine
new Point("nope");            // ERROR: no overload matches this call
```

The implementation signature is **not** callable. Only the overload signatures are visible to callers, and only the implementation body runs. Three rules that catch everyone once:

1. The implementation signature must be **compatible with every overload** — its parameter types have to be a superset.
2. The implementation signature is **invisible to callers**. `new Point(1)` fails even though the implementation would accept it.
3. Overloads are matched **top to bottom**, first match wins — so put the specific ones first.

> **Honest advice: prefer optional parameters, defaults, and static factories over constructor overloads.** Overloads are the heaviest tool here, and a class that needs three ways to build a point usually wants three named functions instead. Reach for them when you are typing a library that already has that shape.

### Overloads are not just for constructors

The same mechanism works on any method, and it is how most of the standard library is typed:

```ts
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}
```

---

## Part 4 — Static Factories

A constructor must return the instance, and it cannot be `async`. Both limits push a certain kind of construction out into a **static factory method** — a method on the class itself that returns an instance.

```ts
class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
  ) {}

  /** The everyday way to make one. */
  static create(name: string, email: string): User {
    return new User(crypto.randomUUID(), name, email);
  }

  /** Rebuild one from stored data. */
  static fromJSON(raw: unknown): User {
    if (typeof raw !== "object" || raw === null) {
      throw new Error("expected an object");
    }
    const data = raw as { id?: unknown; name?: unknown; email?: unknown };
    if (typeof data.id !== "string" || typeof data.name !== "string" || typeof data.email !== "string") {
      throw new Error("malformed user record");
    }
    return new User(data.id, data.name, data.email);
  }
}

const u = User.create("Ada", "ada@example.com");
const loaded = User.fromJSON({ id: "u1", name: "Ada", email: "a@example.com" });
```

Three things are happening, and each is worth having on its own:

**A `private constructor` makes the factories the only way in.** `new User(...)` from outside the class is a compile error, so every `User` in the program came through a path you control. That is how you enforce an invariant — an email that has been validated, an id that was actually generated.

**A factory can have a name.** `User.fromJSON(raw)` says what it does. `new User(id, name, email)` requires the reader to know the argument order. When construction has several modes, naming them is most of the clarity.

**A factory can be `async`.** A constructor cannot:

```ts
class Config {
  private constructor(public readonly port: number) {}

  // `new` cannot await, so this is the only way
  static async load(path: string): Promise<Config> {
    const text = await readFile(path, "utf8");
    const parsed = JSON.parse(text) as { port: number };
    return new Config(parsed.port);
  }
}

const config = await Config.load("./config.json");
```

This is the standard answer to "how do I do async work in a constructor", and the answer is: **you don't — you move it to a static factory.**

### When a private constructor is overkill

`private constructor` is a strong statement: *no one outside may build one directly*. That is right for a value type with invariants, and wrong for a plain data holder. A `Point` with a private constructor and no factories is a class nobody can instantiate, which is a bug rather than a design.

---

## Part 5 — Predicting the Output

Before you run the exercises, settle these. The answers are below; commit to a guess first.

```ts
class Counter {
  count: number;

  constructor(start: number = 0) {
    this.count = start;
  }

  increment(): this {
    this.count += 1;
    return this;
  }
}

const a = new Counter();
const b = new Counter(10);
a.increment().increment();
b.increment();
console.log(a.count, b.count);
```

And this one, which is the trap of the lesson:

```ts
class Thing {
  items: string[] = [];

  constructor(name: string) {
    this.items.push(name);
  }
}

const t1 = new Thing("a");
const t2 = new Thing("b");
console.log(t1.items, t2.items);
```

<details>
<summary>Answers</summary>

**First:** `2 11`. `a.count` started at the default `0` and was incremented twice; `b.count` started at `10` and was incremented once. Two objects, two independent sets of fields — which is the entire point of declaring them on the instance.

**Second:** `["a"] ["b"]`. This is the *opposite* of the Python trap. In Python, `def __init__(self, name, items=[])` uses **one shared list for every instance**, and this is famous as the mutable-default-argument bug.

**JavaScript has no such bug.** A field initialiser (`items: string[] = []`) runs as part of the constructor, **once per instance**. Every object gets its own array. The same is true of a plain default parameter when the default is a new object each call.

This is one of the few places where the JavaScript design is genuinely safer than Python's, and it is worth knowing so you do not carry a Python superstition into TypeScript — or, worse, defensively write `items: string[] | null = null` and check for null, which is what you would do in Python and is pure noise here. **Per-instance field initialisers are safe.**

</details>

---

## Part 6 — Cheat Sheet Summary

```ts
class User {
  // 1. Declare, receive, assign — the explicit form
  readonly id: string;

  // 2. Parameter properties — the same thing, abbreviated
  constructor(
    id: string,
    public name: string,
    private email: string,
    public nickname?: string,
  ) {
    this.id = id;
  }

  // 3. A static factory: named, and allowed to be async
  static create(name: string, email: string): User {
    return new User(crypto.randomUUID(), name, email);
  }
}
```

| Idea | One-line version |
|---|---|
| `constructor` | The method that runs once, when `new` builds the object |
| Why it exists | To make an **incomplete object impossible**, not merely unlikely |
| `strictPropertyInitialization` | Every field needs a default, a constructor assignment, or `!` |
| Parameter property | `public name: string` in the constructor — declares *and* assigns |
| `readonly` | Set it in the constructor, then the compiler forbids changing it |
| `private constructor` | Only static factories inside the class can build one |
| One constructor only | Overload **signatures** plus a single implementation body |
| Implementation signature | Is **not** callable — only the overload signatures are |
| Static factory | Named construction, and the only way to build one asynchronously |
| Mutable defaults | **Safe here** — unlike Python, each instance gets its own |

---

## Self-Check

- [ ] Why is `new Dog()` (no arguments) a compile error once you write a constructor?
- [ ] What are the three ways to satisfy `strictPropertyInitialization`?
- [ ] Rewrite a declare-receive-assign constructor using parameter properties.
- [ ] Why can't a constructor be `async`, and what do you do instead?
- [ ] What does a `private constructor` buy you?
- [ ] Why is `items: string[] = []` safe in TypeScript when `items=[]` in Python is a famous bug?

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Classes (constructors)](https://www.typescriptlang.org/docs/handbook/2/classes.html#constructors)
- **Docs:** [TypeScript Handbook — Parameter Properties](https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties)
- **Docs:** [TypeScript — `strictPropertyInitialization`](https://www.typescriptlang.org/tsconfig#strictPropertyInitialization)
- **Reference:** [MDN — `constructor`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor)
- **Article:** [TypeScript — Constructor Overloading](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
- **Python parallel:** [Python `__init__`](https://docs.python.org/3/reference/datamodel.html#object.__init__)

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write a `Dog` class with a long-form constructor. Confirm `new Dog()` does not compile.
2. Delete one of the assignments in the constructor and read TS2564.
3. Rewrite the same class with parameter properties and confirm nothing changed.
4. Add a `readonly` field and try to reassign it after construction.
5. Write a `Point` with three constructor overloads and confirm the implementation signature is not callable.
6. Give `User` a `private constructor` and a `static create`, and prove `new User(...)` is rejected outside the class.
7. Write an `async static load` factory and await it.
8. Build two instances of a class with an array field initialiser and prove the arrays are independent.
