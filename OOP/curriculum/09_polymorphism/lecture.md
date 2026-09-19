# OOP 09: Polymorphism

Polymorphism is a frightening word for a simple idea:

> **The same call does the right thing for whatever you called it on.**

Everything in the previous eight lessons has been building to it. This lesson is what it is *for* — and, just as importantly, when a plain discriminated union does the job better.

---

## Part 1 — The Problem It Solves

Here is code without polymorphism. It works, and it is the code you will write a hundred times before you notice the pattern:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}
```

That is a **dispatch on a tag**. It is fine — and TypeScript's exhaustive checking ([CURRICULUM/18](../../CURRICULUM/18_unions_and_narrowing/lecture.md)) makes it genuinely safe, since adding a fourth `kind` produces a compile error at every `switch`.

But look at what happens as the program grows. Every new operation needs every branch:

```ts
function perimeter(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return 2 * Math.PI * shape.radius;
    case "square": return 4 * shape.side;
    case "rect": return 2 * (shape.width + shape.height);
  }
}

function describe(shape: Shape): string {
  switch (shape.kind) { /* ...every branch again... */ }
}

function scale(shape: Shape, factor: number): Shape {
  switch (shape.kind) { /* ...every branch again... */ }
}
```

**Adding a shape means editing every function.** Adding an operation means writing every branch. The knowledge of "what shapes exist" is smeared across the whole file.

Polymorphism flips that. Each shape knows how to compute its own area:

```ts
abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;
  abstract describe(): string;
}

class Circle extends Shape {
  constructor(public radius: number) { super(); }

  override area(): number { return Math.PI * this.radius ** 2; }
  override perimeter(): number { return 2 * Math.PI * this.radius; }
  override describe(): string { return `a circle of radius ${this.radius}`; }
}

class Square extends Shape {
  constructor(public side: number) { super(); }

  override area(): number { return this.side ** 2; }
  override perimeter(): number { return 4 * this.side; }
  override describe(): string { return `a square of side ${this.side}`; }
}
```

Now the *knowledge* lives with the thing it describes, and every consumer is one line:

```ts
function totalArea(shapes: Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

function report(shapes: Shape[]): string[] {
  return shapes.map((s) => `${s.describe()} — area ${s.area().toFixed(2)}`);
}
```

`totalArea` does not know a `Circle` exists. It never will. It will work, unchanged, with the `Triangle` someone adds next year.

> **That is the whole value proposition: `totalArea` has one branch instead of N, and it never needs to grow.**

---

## Part 2 — How the Dispatch Actually Works

Worth knowing, because it explains several otherwise-mysterious behaviours.

```ts
const shapes: Shape[] = [new Circle(2), new Square(3)];

for (const s of shapes) {
  console.log(s.area());
}
```

Three facts:

**The loop calls the same source-level expression.** `s.area()` — one call site, one identifier.

**The receiver's *actual* type decides.** At runtime, `s.area` is looked up on each object's prototype chain. The `Circle` finds `Circle.prototype.area`; the `Square` finds `Square.prototype.area`. The static type `Shape` is not consulted at all — it was erased at compile time.

**The lookup happens at call time.** Change the prototype and the behaviour changes, even for existing objects:

```ts
class Robot extends Shape {
  override area(): number { return 1; }
  override perimeter(): number { return 4; }
  override describe(): string { return "a robot"; }
}

const r = new Robot();
r.area();                                          // 1

(Robot.prototype as { area: () => number }).area = () => 99;
r.area();                                          // 99 — for the SAME object
```

That is a demonstration, not a recommendation. It is why monkey-patching works, and why it is dangerous.

This is also why `this` matters so much ([lesson 03](../03_this_and_binding/lecture.md)): if the method is detached from its receiver, the dynamic lookup still happens, but `this` inside it does not point where you expect. **Polymorphism and `this` are the same mechanism viewed from two sides.**

---

## Part 3 — The Four Kinds (Only One of Which Is "OOP")

"Polymorphism" gets used for several different things. Naming them separately makes the whole topic less mysterious.

**Subtype polymorphism** — the one this module is about:

```ts
function area(s: Shape): number { return s.area(); }    // one call, many classes
```

**Parametric polymorphism** — generics ([CURRICULUM/19](../../CURRICULUM/19_generics/lecture.md)). One function, many types, no classes involved:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

**Ad-hoc polymorphism** — overloading, where the implementation is chosen by the *arguments'* types:

```ts
function pad(value: string, width: number): string;
function pad(value: number, width: number): string;
function pad(value: string | number, width: number): string {
  return String(value).padStart(width, "0");
}
```

**Structural polymorphism** — "if it has the members, it works", which is what makes the plain-object version of a shape pass anywhere a `Shape` is expected:

```ts
function area(s: { area(): number }): number { return s.area(); }
```

All four are "the same call, different behaviour". Only one of them needs inheritance, and it is worth being clear that when someone says polymorphism, they may mean any of them.

---

## Part 4 — Polymorphism with a Function, Not a Class

Here is the part people coming from Java or C# usually do not see coming.

The mechanism above requires no classes at all. An object with the right method *is* polymorphic:

```ts
interface Priced {
  total(): number;
}

class LineItem {
  constructor(private readonly cents: number) {}
  total(): number { return this.cents / 100; }
}

const basket: Priced[] = [
  { total: () => 19.99 },                  // a plain object literal
  { total(): number { return 4.5 * 3; } }, // another one, with a method shorthand
  new LineItem(1200),                      // an instance
];

basket.reduce((sum, p) => sum + p.total(), 0);   // 19.99 + 13.5 + 12 = 45.49
```

Three completely unrelated things — two object literals and a class instance — and the loop does not care. Subtype polymorphism in JavaScript is **structural**, not nominal: the class is one convenient way to build the objects, not a requirement.

### The strategy pattern, without the pattern

This is the same idea applied to behaviour rather than data, and it replaces a large class hierarchy with a field:

```ts
type ShippingStrategy = (weight: number) => number;

class Order {
  constructor(
    public weight: number,
    private readonly shipping: ShippingStrategy,
  ) {}

  shippingCost(): number {
    return this.shipping(this.weight);
  }
}

const standard = (kg: number): number => 5 + kg * 0.5;
const express = (kg: number): number => 20 + kg * 2;
const free = (): number => 0;

new Order(10, standard).shippingCost();    // 10
new Order(10, express).shippingCost();     // 40
new Order(10, free).shippingCost();        // 0
```

Compare with the class version — `StandardShipping extends Shipping`, `ExpressShipping extends Shipping`, and a factory to choose between them. **The function version is shorter, needs no inheritance, and is easier to test** (you pass a lambda instead of constructing a subclass).

> **The general principle: polymorphism needs a shared *interface*, not a shared *ancestor*.** Reach for functions and plain objects first; reach for classes when there is state to carry along with the behaviour.

---

## Part 5 — Replacing a Conditional With Polymorphism

The refactor this lesson is really about has a name. You will find the shape of it everywhere.

**Before** — the tag dispatch from Part 1, grown:

```ts
interface Employee {
  kind: "engineer" | "manager" | "intern";
  base: number;
}

function pay(employee: Employee): number {
  switch (employee.kind) {
    case "engineer":
      return employee.base * 1.2;          // on-call
    case "manager":
      return employee.base * 1.5 + 500;    // bonus
    case "intern":
      return employee.base * 0.8;          // pro-rated
  }
}
```

Every payroll rule is now in one function, and the next rule is another `case` or another `if`. Adding a fourth kind of employee means finding every `switch` on `kind`.

**After** — each employee computes its own pay:

```ts
abstract class Employee {
  constructor(public readonly base: number) {}
  abstract pay(): number;
  abstract describe(): string;
}

class Engineer extends Employee {
  override pay(): number { return this.base * 1.2; }
  override describe(): string { return `engineer, on-call`; }
}

class Manager extends Employee {
  override pay(): number { return this.base * 1.5 + 500; }
  override describe(): string { return `manager, with bonus`; }
}

class Intern extends Employee {
  override pay(): number { return this.base * 0.8; }
  override describe(): string { return `intern, pro-rated`; }
}
```

The payroll rule moved to the class it is about. A new kind of employee is **a new file with one class in it** — no existing code is touched, and no `switch` needs to grow.

That property has a name: the **open/closed principle** — open for extension, closed for modification. It is real and worth having, and it is also the most over-sold idea in software design, so here is the honest caveat.

### The honest caveat

The refactor is not free:

| | Tag dispatch (`switch`) | Polymorphism (classes) |
|---|---|---|
| Where the logic lives | one function | spread across classes |
| Adding a **variant** | edit every function | add one class |
| Adding an **operation** | add one function | **edit every class** |
| Serialising it | easy — it is plain data | needs `toJSON` on each class |
| Testing | call a pure function | instantiate a class |
| Following the code | read one function | jump between files |

Read the two middle rows again. **They are exact opposites.** Polymorphism makes adding *variants* cheap and adding *operations* expensive. Tag dispatch does the reverse.

So the question is not "which is better" but **"which axis will grow?"**

- A shape library where you keep adding shapes, and the operations are stable → **classes**.
- A payroll system where the employee kinds are fixed by HR and the rules change every tax year → **a `switch` in one function**.
- Genuinely unsure → the `switch`, because it is easier to turn into classes later than the reverse.

> ### And this is why TypeScript's discriminated unions are not a poor substitute.
>
> A `switch` over `shape.kind` with an exhaustiveness check is a first-class design in TypeScript, not a workaround. You get compile-time safety that the class version does not have (the compiler proves you handled every case; it cannot prove your override is correct), the data stays serialisable, and the whole thing is testable without instantiating anything.
>
> **Use the union while the variants are data. Move to polymorphism when a variant needs behaviour that is genuinely its own.**

---

## Part 6 — Substitutability, One More Time

Polymorphism rests on everything being usable as the base type. [Lesson 07](../07_inheritance_and_super/lecture.md) covered what breaks that; the practical checklist:

```ts
function process(shapes: Shape[]): void {
  for (const s of shapes) {
    console.log(s.area());
  }
}
```

For this to be correct, every `Shape` must:

1. Have `area()` — guaranteed by the type.
2. Return a number that means the same thing as everyone else's. **Not** `-1` for "unsupported".
3. Not throw for any input the base class accepts. A `Triangle` whose `area()` throws on a valid state is not a `Shape`.
4. Not require the caller to know which concrete class it is:

```ts
// A LEAK — the caller is now doing the dispatch the class was supposed to do
for (const s of shapes) {
  if (s instanceof Circle) {
    console.log(s.radius);
  } else {
    console.log(s.area());
  }
}
```

That `instanceof` is the smell. **When you find yourself checking the concrete type inside a polymorphic loop, the abstraction is incomplete** — the operation the caller wanted should have been a method on `Shape` all along (here: `radius()` returning `number | undefined`, or a `describe()` that includes it).

Sometimes the check is legitimate — narrowing to reach a *specific* capability is what interfaces are for:

```ts
interface HasRadius {
  radius: number;
}

function isRound(s: Shape): s is Shape & HasRadius {
  return "radius" in s;
}
```

Now the caller asks for a *capability* rather than a class. That is polymorphism-friendly, because a new round shape works without touching it ([CURRICULUM/18](../../CURRICULUM/18_unions_and_narrowing/lecture.md) section 8).

---

## Part 7 — Predicting the Output

```ts
class Animal {
  constructor(public name: string) {}

  speak(): string {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  override speak(): string {
    return `${this.name} barks`;
  }
}

class Puppy extends Dog {
  override speak(): string {
    return `${super.speak()} (softly)`;
  }
}

const animals: Animal[] = [new Animal("generic"), new Dog("Rex"), new Puppy("Bit")];

for (const a of animals) {
  console.log(a.speak());
}

const loud: () => string = new Dog("Rex").speak;
try {
  console.log(loud());
} catch (error) {
  console.log("threw:", String(error));
}
```

And this one, which mixes a plain object, a class instance, and an anonymous class:

```ts
interface Priced {
  total(): number;
}

const items: Priced[] = [
  { total: () => 5 },
  new (class { total(): number { return 7; } })(),
];

console.log(items.reduce((sum, i) => sum + i.total(), 0));
```

<details>
<summary>Answers</summary>

**First:** three lines, and the third is the interesting one:

```text
generic makes a sound
Rex barks
Bit barks (softly)
```

`a.speak()` is one expression, and the method that runs depends on each object's prototype — the lookups go to `Animal.prototype`, `Dog.prototype`, and `Puppy.prototype` respectively. The static type `Animal` never comes up; it was erased.

The third line shows `super` inside a polymorphic override: `Puppy.speak` calls `super.speak()`, which is `Dog.prototype.speak`, which returns `"Bit barks"`. `Puppy` inherited `name` from `Animal` through two levels.

Then `threw: TypeError …`. `const loud = new Dog("Rex").speak` detaches the method from its receiver, exactly as in [lesson 03](../03_this_and_binding/lecture.md). **Dynamic dispatch still happens** — `loud` is `Dog.prototype.speak` — but `this` is `undefined`, so reading `this.name` throws. Polymorphism decides *which* function; the call site decides *what `this` is*. They are independent, and this is the case where they come apart.

**Second:** `12`.

Two objects with completely unrelated ancestries — a plain object literal and an anonymous class instance — both satisfy `Priced`, because TypeScript's structural check only asks whether `total` exists and returns a `number`.

There is no shared base class, no `extends`, no inheritance at all. `reduce` calls `i.total()` on each and gets `5` and `7`. That is subtype polymorphism in full, and it is worth sitting with: **the class hierarchy was never the point.**

</details>

---

## Part 8 — Cheat Sheet Summary

```ts
abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(public radius: number) { super(); }
  override area(): number { return Math.PI * this.radius ** 2; }
}

class Square extends Shape {
  constructor(public side: number) { super(); }
  override area(): number { return this.side ** 2; }
}

const shapes: Shape[] = [new Circle(2), new Square(3)];

shapes.reduce((sum, s) => sum + s.area(), 0);    // one call site, two behaviours

// No classes required at all:
interface Priced { total(): number }
const items: Priced[] = [{ total: () => 5 }, { total: () => 7 }];
```

| Idea | One-line version |
|---|---|
| Polymorphism | The same call does the right thing for whatever it was called on |
| The mechanism | Prototype lookup at **call time**, on the receiver's actual type |
| The payoff | One branch instead of N, and it never needs to grow |
| Subtype | `function area(s: Shape)` — the OOP kind |
| Parametric | Generics — one function, many types, no classes |
| Ad-hoc | Overloading — chosen by the arguments |
| Structural | "If it has the members, it works" — the JS default |
| Needs a shared ancestor? | **No.** A shared *interface* is enough |
| Strategy pattern | Usually just a function field — skip the class hierarchy |
| Tag dispatch vs polymorphic | **Opposite trade-offs** — variants cheap vs operations cheap |
| Discriminated unions | Not a workaround. Safer, serialisable, easier to test |
| The smell | `if (s instanceof Circle)` inside a polymorphic loop |
| The fix for the smell | Ask for a **capability** (`s is Shape & HasRadius`), not a class |

---

## Self-Check

- [ ] State the payoff of polymorphism in one sentence, in terms of branches.
- [ ] Where is the method for `s.area()` actually found, and when?
- [ ] Name the four kinds of polymorphism and which one needs inheritance.
- [ ] Write the strategy pattern as a function field and say what it replaces.
- [ ] Give the row of the comparison table where classes *lose*, and say why that matters.
- [ ] When would you deliberately choose a discriminated union over a class hierarchy?
- [ ] What does `if (s instanceof Circle)` inside a loop tell you about the design?

---

## 📚 Resources

- **Article:** [Refactoring — Replace Conditional with Polymorphism](https://refactoring.guru/replace-conditional-with-polymorphism) — the refactor in Part 5, with worked examples
- **Pattern:** [Strategy](https://refactoring.guru/design-patterns/strategy) — and note how much of it collapses into a function
- **Article:** [Polymorphism (Wikipedia)](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)) — for the four-kinds taxonomy in Part 3
- **Reference:** [MDN — Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) — the dispatch mechanism
- **Article:** [The Expression Problem](https://en.wikipedia.org/wiki/Expression_problem) — the formal name for the trade-off table in Part 5
- **Python parallel:** [Python duck typing](https://docs.python.org/3/glossary.html#term-duck-typing) — the same "structural, not nominal" idea

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write a `switch` on a `kind` tag, then rewrite it with classes, and count the branches in the consumer.
2. Add a fourth variant to each version and see which one you had to edit.
3. Call `area()` on a mixed array and confirm the receiver decides.
4. Replace a class hierarchy with a function-valued field (the strategy version).
5. Build an array of plain objects satisfying an interface, with no class anywhere.
6. Write the `instanceof` leak, then remove it by adding a method.
7. Write a type predicate for a capability and show it works for a shape that did not exist when you wrote it.
