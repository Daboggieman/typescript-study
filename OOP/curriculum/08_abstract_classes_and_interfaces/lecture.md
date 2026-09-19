# OOP 08: Abstract Classes and Interfaces

Inheritance so far has been about *reusing* code. This lesson is about the other half of its job: **stating a contract** — "any shape must be able to report its area" — without saying how.

TypeScript gives you two mechanisms for that, and choosing between them is a question people ask a lot. By the end of this lesson you will have a rule.

---

## Part 1 — Abstract Classes

An `abstract` class is a class that **cannot be instantiated**. It exists to be extended.

```ts
abstract class Shape {
  constructor(public readonly name: string) {}

  // A concrete method — shared by every subclass, written once
  describe(): string {
    return `${this.name} with area ${this.area().toFixed(2)}`;
  }

  // An abstract method — a PROMISE that subclasses must keep
  abstract area(): number;
}

class Circle extends Shape {
  constructor(public radius: number) {
    super("circle");
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Square extends Shape {
  constructor(public side: number) {
    super("square");
  }

  override area(): number {
    return this.side ** 2;
  }
}

new Shape("blob");       // ERROR TS2511: Cannot create an instance of an abstract class
new Circle(2).describe();   // "circle with area 12.57"
new Square(3).describe();   // "square with area 9.00"
```

Three things are happening, and each one is worth naming:

**`abstract area(): number;` has no body.** It is a declaration with a semicolon — a requirement, not an implementation. TypeScript enforces that every concrete subclass supplies one:

```ts
class Triangle extends Shape {
  // ERROR TS2515: Non-abstract class 'Triangle' does not implement
  // inherited abstract member 'area' from class 'Shape'.
}
```

**`describe()` is written once and uses `area()`.** This is the real point. `Shape` can express an algorithm in terms of methods its subclasses will provide. The base class knows *what* to do; the subclasses know *how*. That is the **template method** pattern, and it is the best reason to reach for an abstract class.

**`new Shape()` is a compile error.** An abstract class is deliberately incomplete, so constructing one would produce an object with a method that does not exist. The compiler stops you.

### Abstract properties

Methods are not special — any member can be abstract:

```ts
abstract class Entity {
  abstract readonly id: string;
  abstract tags: string[];

  equals(other: Entity): boolean {
    return this.id === other.id;
  }
}
```

The same rule applies: a concrete subclass must provide them, and `strictPropertyInitialization` still applies to whatever the subclass declares.

### Abstract classes are still classes

Everything from lessons 01–07 works: constructors, `super`, access modifiers, static members, getters.

```ts
abstract class Repository {
  protected abstract readonly table: string;     // subclasses supply the name

  protected connection(): string {
    return `connected to ${this.table}`;         // ...and this uses it
  }
}
```

Note `protected abstract` — abstract members can be private-ish too. (`private abstract` is meaningless and rejected, since nobody could implement it.)

---

## Part 2 — Interfaces as Contracts

An **interface** describes a shape. It has no implementation at all, and it produces no JavaScript.

```ts
interface HasArea {
  readonly area: number;      // a property, not a method — a fact, not an action
}

interface Shape {
  name: string;
  area(): number;
  describe(): string;
}
```

A class **implements** an interface with the `implements` clause:

```ts
class Circle implements Shape {
  constructor(public name: string, public radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  describe(): string {
    return `${this.name}: ${this.area()}`;
  }
}

const c: Shape = new Circle("circle", 2);     // a Circle IS a Shape
```

`implements` is a **check**, not an inheritance. Nothing is copied, nothing is shared, and the compiled JavaScript contains no trace of `Shape`. The class is judged against the interface and an error is reported if it does not match:

```ts
class Bad implements Shape {
  // ERROR TS2420: Class 'Bad' incorrectly implements interface 'Shape'.
  //   Property 'describe' is missing.
  //   Property 'area' is missing.
}
```

### `implements` is optional

Here is the thing that surprises people coming from Java or C#:

```ts
interface Shape {
  area(): number;
}

class Circle {
  area(): number { return 1; }        // no `implements` clause anywhere
}

function totalArea(shapes: Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

totalArea([new Circle()]);            // fine
```

`Circle` never mentioned `Shape`, and it satisfies it anyway. That is **structural typing** ([CURRICULUM/17](../../CURRICULUM/17_interfaces_and_aliases/lecture.md)): TypeScript asks "does it have the right members?", not "did it declare so?".

So why write `implements` at all? Three reasons, and they are good ones:

1. **It checks the class at the point of definition.** Without it, the error surfaces at the *call site* — possibly far away — and says something confusing about the argument not being assignable. With it, you get `Class 'Circle' incorrectly implements interface 'Shape'` right where the mistake is.
2. **It documents intent.** `class Circle implements Shape` tells a reader that `Shape` is the contract this class is meant to satisfy.
3. **It catches drift.** If someone adds a member to `Shape`, every `implements` site lights up immediately.

> **Use `implements` for classes you own. Skip it for classes you don't** — a plain object literal passed to a function is already checked structurally, and writing `const x: Shape = { … }` is the idiomatic way to state the intent there.

### `implements` is not `extends`

```ts
class Circle implements Shape {
  // super.area()  ← does not exist. There is nothing to call.
}
```

An interface has no code to reuse and no constructor. `implements` gives you a **obligation**, not a starting point.

---

## Part 3 — A Class Can Implement Several

The clause takes a list:

```ts
interface Serializable {
  toJSON(): unknown;
}

interface Comparable<T> {
  compareTo(other: T): number;
}

class Version implements Serializable, Comparable<Version> {
  constructor(public major: number, public minor: number) {}

  toJSON(): unknown {
    return { major: this.major, minor: this.minor };
  }

  compareTo(other: Version): number {
    return this.major - other.major || this.minor - other.minor;
  }
}
```

**This is the practical answer to "JavaScript has no multiple inheritance".** A class extends exactly one class, but it can implement any number of interfaces. Each one is an independent contract, and there is no diamond problem because none of them carry state or code.

The common TypeScript idiom is a class that extends one base and implements several contracts:

```ts
abstract class Entity {
  abstract readonly id: string;
}

class User extends Entity implements Serializable, Comparable<User> {
  constructor(public readonly id: string, public name: string) {
    super();
  }

  toJSON(): unknown { return { id: this.id, name: this.name }; }
  compareTo(other: User): number { return this.name.localeCompare(other.name); }
}
```

> **A class that declares a member without an access modifier is `public`.** When you implement an interface, the members must be at least as visible as the interface requires — which, for an interface member with no modifier, means `public`.

---

## Part 4 — Abstract Class or Interface?

This is the question. Here is the rule, stated as a decision you can actually make:

> **An interface says what something can do. An abstract class says what it is, and gives it something.**

| | Interface | Abstract class |
|---|---|---|
| Produces JavaScript | no | yes |
| Can have implementations | no | yes |
| Can have a constructor | no | yes |
| Can have fields | no (only their shape) | yes, real ones |
| Can have `private` / `protected` members | no | yes |
| Multiple per class | yes, any number | one |
| Can be implemented by a plain object | **yes** | no |
| Extends another | interfaces, several | one class |

**Reach for an interface when** you are describing a capability: `Serializable`, `Comparable`, `HasArea`, `Loggable`. There is nothing to share, and other code — possibly not yours — should be able to satisfy it.

**Reach for an abstract class when** you have code to share *and* a method subclasses must fill in. The template-method case from Part 1 is the canonical example: `describe()` is written once and calls an abstract `area()`.

**The tell:** if your abstract class has no implementation in it at all — every member is abstract — then it is an interface wearing a heavier costume. Write an interface instead.

```ts
// A heavy costume
abstract class Shape {
  abstract area(): number;
}

// The same thing, lighter
interface Shape {
  area(): number;
}
```

And the reverse tell: if your interface is sprouting default implementations in subclasses, the shared code wants an abstract class — or, more often, [composition](../10_composition_and_patterns/lecture.md).

### The mixed case

If you need both, you get both — and this is common in real code:

```ts
interface Shape {
  area(): number;
  describe(): string;
}

abstract class BaseShape implements Shape {
  constructor(public readonly name: string) {}

  describe(): string {                        // shared implementation
    return `${this.name}: ${this.area().toFixed(2)}`;
  }

  abstract area(): number;                    // still up to the subclass
}

class Circle extends BaseShape {
  constructor(public radius: number) {
    super("circle");
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}
```

The interface is the *public contract* — code that consumes shapes depends on `Shape` and nothing else. The abstract class is the *shared plumbing*. Callers never mention `BaseShape`; they accept `Shape`, and a plain object with an `area()` and a `describe()` satisfies it too.

---

## Part 5 — Interfaces Extending Interfaces

Interfaces compose by extension, and — unlike classes — an interface may extend several:

```ts
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

interface Person extends Named, Aged {
  email: string;
}

const p: Person = { name: "Ada", age: 36, email: "ada@example.com" };
```

This is the interface equivalent of a mixin, and it is a clean way to build up a shape from small pieces. A class implementing `Person` must satisfy all three.

An interface can also extend a **class**, which is occasionally useful for capturing "everything this class has, including private state":

```ts
class Point {
  private brand = "point";
  constructor(public x: number, public y: number) {}
}

interface PointLike extends Point {}

const p: PointLike = new Point(1, 2);      // fine — it really is a Point
const fake: PointLike = { x: 1, y: 2 };    // ERROR — missing the private `brand`
```

Only a genuine `Point` (or a subclass) satisfies `PointLike`, because the private member is part of the shape. **You will rarely need this**, and reaching for it usually means the design wants to be explicit about something.

### Interfaces can describe constructors

An interface can describe a class *itself* rather than its instances:

```ts
interface Shape {
  area(): number;
}

interface ShapeConstructor {
  new (name: string): Shape;       // a construct signature
  readonly kind: string;
}

class Circle {
  static readonly kind = "circle";

  constructor(public name: string) {}

  area(): number { return 0; }
}

function register(ctor: ShapeConstructor): void {
  console.log(`registering ${ctor.kind}`);
}

register(Circle);       // fine — a static `kind` and a matching constructor
register({ kind: "x", new: (name: string) => ({ name, area: () => 0 }) });   // also fine
```

`new (…) => …` is called a **construct signature**. It is how you type "a class, or something that behaves like one" — dependency injection, factories, plugin registries. Note the last line: because the check is structural, a plain object with a `new` property satisfies it too. `ShapeConstructor` asks for something callable with `new` and a `kind`, and it does not care whether that came from a `class`.

---

## Part 6 — Interfaces Are Not Runtime Things

Worth stating outright, because it is the source of a whole class of confusion:

```ts
interface Shape {
  area(): number;
}

const s: Shape = { area: () => 1 };

console.log(s instanceof Shape);      // ERROR TS2693: 'Shape' only refers to a type,
                                      // but is being used as a value here.
console.log(typeof Shape);            // same error
```

**An interface does not exist at runtime.** It is erased completely. You cannot check against it, you cannot `typeof` it, and you cannot build it dynamically. Only *classes* survive compilation.

If you need a runtime check, you need something with a runtime presence:

```ts
abstract class Shape {
  abstract area(): number;
}

s instanceof Shape;      // fine — abstract classes DO exist at runtime
```

That is a genuine, if occasional, reason to prefer an abstract class over an interface: **an abstract class can be used as a runtime marker, and an interface cannot.** This matters for `instanceof` in error handling ([lesson 07](../07_inheritance_and_super/lecture.md)) and for DI containers.

And the `readonly` reminder from CURRICULUM/17 that shows up here too:

```ts
interface HasArea {
  readonly area: number;      // only a READ-only promise
}

const h: HasArea = { area: 1 };
h.area = 2;                   // ERROR — the interface caught it
```

---

## Part 7 — Predicting the Output

```ts
abstract class Animal {
  constructor(public name: string) {}

  abstract sound(): string;

  speak(): string {
    return `${this.name} says ${this.sound()}`;
  }
}

class Cow extends Animal {
  override sound(): string { return "moo"; }
}

const c = new Cow("Bessie");
console.log(c.speak());
console.log(c instanceof Animal);
```

And, does this compile?

```ts
interface Speaker {
  speak(): string;
}

function announce(s: Speaker): void {
  console.log(s.speak());
}

announce({ speak: () => "hello from an object literal" });
```

<details>
<summary>Answers</summary>

**First:** `Bessie says moo`, then `true`.

`Animal` is abstract, so `new Animal("x")` is a compile error — but `Animal.prototype` exists at runtime, so `Cow` inherits from a real prototype and `instanceof Animal` is `true`. The abstract class is a runtime object that you simply are not allowed to construct.

`speak()` is the template method: written once, calling an abstract `sound()` that `Cow` provides. `Cow` has no `speak` of its own.

**Second:** yes, it compiles and prints `hello from an object literal`.

`Speaker` is an interface, so any value with a matching `speak` satisfies it — including a plain object literal that has never heard of `Speaker`. This is structural typing, and it is why `implements` is a *documentation* choice rather than a requirement.

Note the contrast with the previous answer: an interface can be satisfied by an object literal, an abstract class cannot. That is precisely the difference the two mechanisms encode.

</details>

---

## Part 8 — Cheat Sheet Summary

```ts
interface Shape {                 // a CONTRACT — no runtime existence
  readonly name: string;
  area(): number;
}

abstract class BaseShape implements Shape {      // a contract + shared code
  constructor(public readonly name: string) {}

  describe(): string { return `${this.name}: ${this.area()}`; }

  abstract area(): number;                        // subclasses must supply this
}

class Circle extends BaseShape {
  constructor(public radius: number) { super("circle"); }

  override area(): number { return Math.PI * this.radius ** 2; }
}

class Plain implements Shape {                    // implements several contracts
  constructor(public readonly name = "plain") {}
  area(): number { return 0; }
}

new BaseShape("x");        // ERROR — abstract
const s: Shape = new Circle(2);
```

| Idea | One-line version |
|---|---|
| `abstract class` | A class that cannot be instantiated. Meant to be extended |
| `abstract method` | A declaration with no body — a promise the subclass must keep |
| Template method | A concrete base method that calls abstract hooks. **The best reason to reach for `abstract`** |
| `interface` | A shape. No code, no runtime existence, erased completely |
| `implements` | A **check**, not an inheritance. Nothing is copied |
| `implements` is optional | Structural typing means matching members are enough |
| Write it anyway | For the error at the class, the intent, and drift detection |
| Several interfaces | Yes — the practical substitute for multiple inheritance |
| Interface extends interface | Yes, and several at once |
| `new (…) => T` | A construct signature — describes a class, not an instance |
| `instanceof SomeInterface` | Compile error. Interfaces have no runtime presence |
| `instanceof SomeAbstractClass` | Works. Abstract classes are real objects |
| **Choose interface when** | Describing a capability, with nothing to share |
| **Choose abstract class when** | You have code to share *and* methods to mandate |
| The tell | All members abstract → it is an interface in a heavy costume |

---

## Self-Check

- [ ] What happens when you write `new` on an abstract class, and why is that correct?
- [ ] What does the template-method pattern let a base class express?
- [ ] Why does a class without an `implements` clause still satisfy an interface?
- [ ] Give the three reasons to write `implements` anyway.
- [ ] How does a class satisfy four contracts when it can extend only one class?
- [ ] What is the tell that an abstract class should have been an interface?
- [ ] Name one thing an abstract class can do that an interface cannot — beyond having code.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Abstract Classes and Members](https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-classes-and-members)
- **Docs:** [TypeScript Handbook — Class Heritage (`implements`)](https://www.typescriptlang.org/docs/handbook/2/classes.html#implements-clause)
- **Docs:** [TypeScript Handbook — Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- **Pattern:** [Template Method](https://refactoring.guru/design-patterns/template-method) — the pattern from Part 1
- **Article:** [Composition over Inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) — where this lesson and the next meet
- **Python parallel:** [Python `abc` module](https://docs.python.org/3/library/abc.html) — `ABC` + `@abstractmethod`, with runtime enforcement where TypeScript's is erased

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write an abstract `Shape` with a concrete `describe` and an abstract `area`.
2. Uncomment `new Shape(...)` and read the compile error.
3. Leave a subclass without `area` and read the "does not implement" error.
4. Make the same `Shape` an interface and show a plain object literal satisfies it.
5. Write a class `implements`-ing two interfaces at once.
6. Delete the `implements` clause and prove nothing changes — the class still works.
7. Try `instanceof` on an interface, then on an abstract class.
8. Use a construct signature to type a factory that takes a class.
