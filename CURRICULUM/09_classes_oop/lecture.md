# Lecture 09: Classes & OOP

A class bundles data and the behaviour that operates on it. JavaScript's classes are **syntactic sugar over prototypes** — a fact that explains most of their quirks — and TypeScript adds real access control and type checking on top.

This lecture is the introduction. The dedicated [`OOP/`](../../OOP/README.md) module covers the same ground in ten lessons with far more depth, so treat this as the map and that as the territory. It also links directly to [08_functions](../08_functions/lecture.md) section 6, since `this` is the thing that makes classes behave unlike their Python equivalents.

---

## 1. Your First Class

```ts
class Dog {
  name: string;              // a field declaration — required in TypeScript
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  bark(): string {
    return `${this.name} says Woof!`;
  }
}

const rex = new Dog("Rex", 3);

rex.bark();                  // "Rex says Woof!"
rex.name;                    // "Rex"
typeof rex;                  // "object"
rex instanceof Dog;          // true
```

Compare with Python:

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age
```

| Python | TypeScript |
|---|---|
| `__init__(self, ...)` | `constructor(...)` |
| `self` — explicit first parameter | **`this`** — implicit, never declared |
| `self.name = name` | `this.name = name` — but the field must be **declared first** |
| `Dog("Rex", 3)` | `new Dog("Rex", 3)` — **`new` is mandatory** |
| fields spring into existence on assignment | fields must be declared, or `strict` complains |

That third row is the biggest practical difference. Assigning `this.name` without a `name: string;` declaration is an error under `strict`:

```text
error TS2339: Property 'name' does not exist on type 'Dog'.
```

> **Forgetting `new`** is the mistake everyone makes once. `Dog("Rex", 3)` without `new` in a class that is not a function throws `TypeError: Class constructor Dog cannot be invoked without 'new'`. TypeScript catches it at compile time instead, which is one of the clearest wins of using the type layer.

---

## 2. Declaring and Initialising Fields

```ts
class Config {
  host: string = "localhost";       // initialised at declaration
  port: number;                     // declared, assigned in the constructor
  tags: string[] = [];              // a FRESH array per instance, always
  optional?: string;                // may be absent — type is string | undefined

  constructor(port: number) {
    this.port = port;
  }
}
```

Fields declared without an initialiser must be definitely assigned by the end of the constructor, or `strictPropertyInitialization` (part of `strict`) reports an error:

```ts
class Broken {
  name: string;
  constructor() { }      // error TS2564: Property 'name' has no initializer
}
```

Three ways to satisfy it:

```ts
class A {
  name: string = "";                       // 1. give it a default
}

class B {
  name: string;
  constructor(name: string) { this.name = name; }   // 2. assign in the constructor
}

class C {
  name!: string;                           // 3. the definite-assignment assertion.
}                                          //    You PROMISE you will assign it. No check.
```

Option 3, the `!`, is an escape hatch with no runtime effect. It is occasionally necessary — when a framework calls an init method after construction — and it should be rare. Reaching for it to silence the compiler gives up the check you wanted.

**Class fields are per-instance in JavaScript.** `tags: string[] = []` creates a new array for every object. This is genuinely different from Python, where a mutable class attribute is shared by all instances:

```python
# Python — a classic bug
class Dog:
    tricks = []          # SHARED by every Dog ever created
```

```ts
// TypeScript — no such bug. Each instance gets its own.
class Dog {
  tricks: string[] = [];   // a fresh array per dog
}
```

The Python mutable-class-attribute trap has no direct equivalent here. The JavaScript version of it is the `new Array(3).fill(sameArray)` problem from [04_arrays_tuples](../04_arrays_tuples/lecture.md).

---

## 3. `this` Inside a Class

Inside a method, `this` refers to the instance — **but only when the method is called on an instance.**

```ts
class Counter {
  count = 0;

  increment(): void {
    this.count += 1;
  }
}

const c = new Counter();
c.increment();               // fine — `this` is c

const inc = c.increment;     // the method is detached
inc();                       // TypeError: Cannot read properties of undefined
```

This is the call-site rule from [08_functions](../08_functions/lecture.md) section 6, and it bites hardest here: **passing a method as a callback loses its `this`.**

```ts
setTimeout(c.increment, 100);        // BROKEN — `this` is undefined inside increment

setTimeout(() => c.increment(), 100);   // works — the arrow keeps the call site

setTimeout(c.increment.bind(c), 100);   // works — pinned explicitly
```

The permanent fix is an **arrow class property**, which is bound per instance at construction:

```ts
class Counter {
  count = 0;

  increment = (): void => {       // an arrow PROPERTY, not a method
    this.count += 1;
  };
}

const c = new Counter();
setTimeout(c.increment, 100);     // works — `this` was captured when c was built
```

The trade-off: an arrow property is created fresh for every instance and lives on the instance rather than the prototype, so it costs a little memory. For callbacks that get passed around, it is worth it. This pattern is the standard answer inside classes and is covered in depth in [OOP/curriculum/03_this_and_binding](../../OOP/curriculum/03_this_and_binding/lecture.md).

---

## 4. Access Modifiers — TypeScript Only

Python has a convention: a leading underscore means "private, please do not touch". TypeScript has actual keywords.

```ts
class BankAccount {
  public owner: string;             // default — anyone
  private balance: number;          // only this class
  protected history: string[] = []; // this class and its subclasses
  readonly id: string;              // assignable once, in the constructor only

  constructor(owner: string, id: string, opening: number) {
    this.owner = owner;
    this.id = id;
    this.balance = opening;
  }

  deposit(amount: number): void {
    this.balance += amount;         // fine — we are inside the class
  }
}

const acct = new BankAccount("Ada", "A1", 100);

acct.owner;              // fine
acct.balance;            // error TS2341: Property 'balance' is private
acct.balance = 999999;   // error — the same rule applies to writing
acct.id = "B2";          // error — readonly after construction
```

Two facts to hold together:

1. **TypeScript's `private` is compile-time only.** The property exists at runtime with its real name, and `(acct as any).balance` or plain JavaScript can still read it. It prevents accidents, not attacks.
2. **JavaScript has real runtime privacy** with `#`, and it is a different feature:

```ts
class Secure {
  #balance = 0;                    // genuinely inaccessible from outside

  deposit(n: number): void { this.#balance += n; }
  get balance(): number { return this.#balance; }
}

const s = new Secure();
s.#balance;                        // SYNTAX error — not merely a type error
```

> **Which to use:** `private` for everyday encapsulation and tooling support; `#private` when the guarantee must hold at runtime — library internals, or values that must not be discoverable. You can combine them (`readonly #id: string`).

### Constructor parameter properties — the shorthand

Declaring a field, taking it as a constructor parameter, and assigning it is three lines of boilerplate. TypeScript collapses it:

```ts
class Point {
  constructor(
    public x: number,
    public y: number,
    private label: string = "origin",
    readonly version: number = 1,
  ) {}
}

const p = new Point(3, 4);
p.x;              // 3
p.label;          // error — private
```

Putting a modifier on a constructor parameter declares the field *and* assigns it. This is idiomatic TypeScript and you will see it constantly. It is covered properly in [OOP/curriculum/02_constructors](../../OOP/curriculum/02_constructors/lecture.md).

---

## 5. Static Members

`static` members belong to the **class**, not to instances. Python's `@staticmethod` and `@classmethod` both land here.

```ts
class MathUtils {
  static readonly PI = 3.14159;

  static square(n: number): number {
    return n * n;                    // no `this` instance available
  }

  static create(): MathUtils {       // a factory — Python's @classmethod returns cls(...)
    return new MathUtils();
  }
}

MathUtils.PI;            // 3.14159
MathUtils.square(5);     // 25
new MathUtils().PI;      // undefined — PI is not on instances
```

Inside a static method, `this` refers to the **class itself**, which is what makes a factory work through subclassing:

```ts
class Base {
  static create<T extends Base>(this: new () => T): T {
    return new this();
  }
}
```

That is a genuinely advanced use and it appears in [OOP/curriculum/06_static_members](../../OOP/curriculum/06_static_members/lecture.md). For daily work, `static` means "a helper or constant that lives with the class for tidiness but needs no instance".

---

## 6. Getters and Setters

Python's `@property` has a direct JavaScript equivalent:

```ts
class Temperature {
  private _celsius = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) throw new Error("below absolute zero");
    this._celsius = value;
  }

  get fahrenheit(): number {            // a computed, read-only property
    return this._celsius * 1.8 + 32;
  }
}

const t = new Temperature();
t.celsius = 25;          // invokes the setter — NO parentheses
t.celsius;               // 25, via the getter
t.fahrenheit;            // 77
t.fahrenheit = 100;      // error — no setter was defined, so it is read-only
```

Two differences from Python:

- **`get` and `set` are separate declarations**, not one `@property` plus `@x.setter`.
- **Callers use plain property syntax** — `t.celsius`, never `t.celsius()`. The accessor is invisible at the call site, which is the point.

A getter with no setter is automatically read-only. Returning a value from a setter is an error; setters take exactly one parameter.

---

## 7. Inheritance, Briefly

```ts
class Animal {
  constructor(public name: string) {}

  speak(): string {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);                     // MUST call super before using `this`
  }

  override speak(): string {         // `override` is required by our tsconfig
    return `${this.name} barks`;
  }
}

const d = new Dog("Rex", "Labrador");
d.speak();                             // "Rex barks"
d instanceof Animal;                   // true
```

`super(...)` calls the parent constructor and is mandatory before any use of `this` in a subclass constructor. The `override` keyword is not optional in this repo — `noImplicitOverride` is on, and it exists to catch the case where a parent method is renamed and a child silently stops overriding anything.

Subclassing is covered properly, along with `abstract` and `implements`, in the `OOP/` module. The short version of the design advice: **prefer composition to inheritance**, and reach for interfaces ([17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md)) before class hierarchies.

---

## 8. Classes vs Plain Objects

```ts
// A class — behaviour travels with the data
class Rectangle {
  constructor(public width: number, public height: number) {}
  area(): number { return this.width * this.height; }
}

// A plain object — data only
const rect = { width: 10, height: 20 };
const area = (r: { width: number; height: number }) => r.width * r.height;
```

| Use a class when | Use a plain object when |
|---|---|
| Behaviour is intrinsic to the data | It is a plain record, e.g. an API response |
| You need `instanceof` | You need to serialise to JSON (**methods are dropped!**) |
| You need private state | You want structural typing to work freely |
| Many instances share methods | It is configuration or a one-off |

That serialisation row is important: `JSON.stringify(new Rectangle(10, 20))` produces `{"width":10,"height":20}` — the `area` method vanishes, and `JSON.parse` gives back a plain object with no methods at all. Anything crossing a network boundary should be data, not an instance.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write a `Car` class with `make`, `model`, and `year` fields, a constructor, and a `describe()` method.
2. Add a `mileage` field initialised to `0` and a `drive(miles)` method that adds to it.
3. Create two cars and confirm each has its own `mileage` — the Python shared-class-attribute bug cannot happen.
4. Add a `private` field and try to read it from outside. Read the error number, then prove with `as any` that the value is still there at runtime.
5. Rewrite the `Car` constructor using parameter properties and compare the line count.
6. Add a `static` factory `Car.create(model)` returning a new instance.
7. Add a getter for a computed property and a setter that validates its input.
8. Demonstrate the detached-method bug on a class, then fix it with an arrow property.

---

## 📚 Resources

- **MDN:** [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- **MDN:** [Private class features (`#`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- **Docs:** [TypeScript Handbook — Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- **Docs:** [TypeScript Handbook — `strictPropertyInitialization`](https://www.typescriptlang.org/tsconfig#strictPropertyInitialization)
- **Module:** [`OOP/`](../../OOP/README.md) — the ten-lesson deep dive this lecture points to
