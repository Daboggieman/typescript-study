// OOP Exercise 06: Static Members
// Run this file with: npm run ex OOP/curriculum/06_static_members/exercises.ts
// Typecheck with:    npm run check
//
// `static` moves a member onto the CLASS. One copy, no instance needed, and
// `this` inside a static method is the class rather than an object.
//
// Several "prove it does not compile" lines are COMMENTED OUT. Uncomment one,
// run `npm run check`, read the error, then comment it back.


// ---------------------------------------------------------------------------
// Exercise 1 — A static constant and a static factory
// ---------------------------------------------------------------------------

// TODO: Exercise 1  [lecture Part 1]
// `PI` and `unit` live on the class. Run the file and see that the INSTANCE
// does not have `PI`.
export class Circle {
  static readonly PI = 3.141592653589793;

  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  area(): number {
    return Circle.PI * this.radius ** 2;
  }

  static unit(): Circle {
    return new Circle(1);
  }
}

// Uncomment, run `npm run check`, read the error, then comment it back.
// Static members are not reachable through an instance.
//
// console.log(new Circle(2).PI);
// new Circle(2).unit();


// ---------------------------------------------------------------------------
// Exercise 2 — `this` in a static method is the class
// ---------------------------------------------------------------------------

// TODO: Exercise 2  [lecture Part 1]
// `#count` is shared: two instances, one counter. And note that both the
// static method and the static getter say `Counter.` rather than `this.` —
// being explicit works in both static and instance contexts.
export class InstanceCounter {
  static #count = 0;

  static get count(): number {
    return InstanceCounter.#count;
  }

  constructor() {
    InstanceCounter.#count += 1;
  }
}


// ---------------------------------------------------------------------------
// Exercise 3 — The instance/static namespace split
// ---------------------------------------------------------------------------

// TODO: Exercise 3  [lecture Part 1]
// An instance method CANNOT reach a static through bare `this`. Uncomment the
// broken line inside `brokenReset`, run `npm run check`, read the error, then
// comment it back and leave the fixed version working.
export class InstanceVsStatic {
  static total = 0;
  own = 0;

  bump(): void {
    this.own += 1;
    InstanceVsStatic.total += 1;
  }

  brokenReset(): void {
    // this.total = 0;        // ERROR — `total` is not on the instance
  }

  reset(): void {
    InstanceVsStatic.total = 0;   // the explicit form, which works
  }
}


// ---------------------------------------------------------------------------
// Exercise 4 — Private constructor + a named factory
// ---------------------------------------------------------------------------

// TODO: Exercise 4  [lecture Part 2.2]
// Fill in `create` and `guest` so they build a User through the private
// constructor. The point: `new User(...)` is a compile error from outside,
// so every construction goes through a method whose name says what it does.
export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
  ) {}

  static create(name: string, email: string): User {
    // TODO: build a User with a generated id. `crypto.randomUUID()` is
    // available globally in Node 18+.
    return new User("TODO", name, email);
  }

  static guest(): User {
    // TODO: return a guest user
    return new User("guest", "Guest", "");
  }

  static fromJSON(raw: string): User {
    // TODO: parse `raw` and build a User. Note that JSON.parse returns `any`,
    // so assert the shape you expect.
    return new User("TODO", "TODO", "TODO");
  }

  describe(): string {
    return `${this.name} <${this.email}>`;
  }
}

// Uncomment, run `npm run check`, read the error, then comment it back.
//
// const illegal = new User("1", "Ada", "ada@example.com");


// ---------------------------------------------------------------------------
// Exercise 5 — Static initialisation order
// ---------------------------------------------------------------------------

// TODO: Exercise 5  [lecture Part 3]
// Statics run TOP TO BOTTOM, once, when the class is defined. `Good` works.
// `Bad` reads a sibling that has not run yet.
//
// The plain version does not even compile:
//
//   static readonly LABEL = `${Bad.NAME} v1`;
//   static readonly NAME = "app";
//
//   error TS2729: Property 'NAME' is used before its initialization.
//
// Uncomment those two lines in place of the cast below, run `npm run check`,
// read the error, then put the cast back.
//
// The cast is there only to get past the compiler so you can watch what the
// runtime does regardless: reading a static field before its initialiser runs
// gives you `undefined`, and there is no error at all.
export class Good {
  static readonly NAME = "app";
  static readonly LABEL = `${Good.NAME} v1`;
}

export class Bad {
  static readonly LABEL = `${(Bad as { NAME?: string }).NAME} v1`;
  static readonly NAME = "app";
}


// ---------------------------------------------------------------------------
// Exercise 6 — A factory that inherits correctly
// ---------------------------------------------------------------------------

// TODO: Exercise 6  [lecture Part 4]
// `this: new () => T` is a THIS PARAMETER (lesson 03) — it tells the compiler
// what the receiver must be, and `T` is inferred from it. `new this()` then
// builds whatever class it was called on.
export class Animal {
  constructor(public readonly name: string = "unnamed") {}

  static create<T extends Animal>(this: new () => T): T {
    return new this();
  }

  speak(): string {
    return `${this.name} makes a sound`;
  }
}

export class Dog extends Animal {
  override speak(): string {
    return `${this.name} barks`;
  }
}

// TODO: Exercise 7  [lecture Part 4]
// The pitfall. This factory HARD-CODES the base class, so a subclass gets an
// Animal back. It typechecks — a Dog IS an Animal — and lies at runtime.
//
// YOUR ANSWER: what does `LyingDog.create()` give you, and what breaks when
// you call `.speak()` on it?
export class LyingAnimal {
  constructor(public readonly name: string = "unnamed") {}

  static create(): LyingAnimal {
    return new LyingAnimal();
  }

  speak(): string {
    return `${this.name} makes a sound`;
  }
}

export class LyingDog extends LyingAnimal {
  override speak(): string {
    return `${this.name} barks`;
  }
}


// ---------------------------------------------------------------------------
// Exercise 8 — A static block
// ---------------------------------------------------------------------------

// TODO: Exercise 8  [lecture Part 5]
// Fill in the static block so `Lookup.table` maps each word to its index.
// Note that `readonly` stopped a REASSIGNMENT of `table` but not the `.set`
// calls — that is shallow `readonly`.
export class Lookup {
  static readonly WORDS = ["zero", "one", "two"];
  static readonly table: Map<string, number> = new Map();

  static {
    // TODO: for each [index, word] of Lookup.WORDS.entries(), set the entry
  }
}


// ---------------------------------------------------------------------------
// Exercise 9 — Shared state, and why it is a warning
// ---------------------------------------------------------------------------

// TODO: Exercise 9  [lecture Part 2.3]
// A registry: genuinely process-wide, which is the case static state is FOR.
// Run the file twice in a row (same process) and notice you would have to
// reset it — that is the danger the lecture warns about.
export class Registry {
  static #items: string[] = [];

  static add(item: string): void {
    Registry.#items.push(item);
  }

  static get items(): readonly string[] {
    return Registry.#items;
  }

  static reset(): void {
    Registry.#items = [];
  }
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

console.log("--- Exercise 1: statics live on the class ---");
console.log("Circle.PI          ->", Circle.PI);
console.log("Circle.unit().area ->", Circle.unit().area());
console.log("Object.keys(new Circle(2)) ->", Object.keys(new Circle(2)), "— no PI, no unit");

console.log("\n--- Exercise 2: one counter, shared ---");
new InstanceCounter();
new InstanceCounter();
new InstanceCounter();
console.log("InstanceCounter.count ->", InstanceCounter.count);

console.log("\n--- Exercise 3: instance vs static namespaces ---");
const mixed = new InstanceVsStatic();
mixed.bump();
mixed.bump();
console.log("mixed.own ->", mixed.own, " static total ->", InstanceVsStatic.total);
mixed.reset();
console.log("after reset -> static total =", InstanceVsStatic.total, ", mixed.own =", mixed.own, "(untouched)");

console.log("\n--- Exercise 4: a private constructor and named factories ---");
const ada = User.create("Ada", "ada@example.com");
const guest = User.guest();
console.log("create   ->", ada.describe());
console.log("guest    ->", guest.describe());
console.log("fromJSON ->", User.fromJSON('{"id":"7","name":"Grace","email":"g@example.com"}').describe());
console.log("the generated id ->", JSON.stringify(ada.id));

console.log("\n--- Exercise 5: static initialisation order ---");
console.log("Good.LABEL ->", Good.LABEL);
console.log("Bad.LABEL  ->", Bad.LABEL, "— Bad.NAME had not run yet");
console.log("Bad.NAME   ->", Bad.NAME);

console.log("\n--- Exercise 6/7: factories and inheritance ---");
console.log("Animal.create() ->", Animal.create().speak());
console.log("Dog.create()    ->", Dog.create().speak(), "— the this parameter worked");
console.log("LyingDog.create() ->", LyingDog.create().speak(), "— hard-coded, so it lies");
console.log("...and its constructor name ->", LyingDog.create().constructor.name);

console.log("\n--- Exercise 8: a static block ---");
console.log("Lookup.table.get('two') ->", Lookup.table.get("two"));
console.log("table size ->", Lookup.table.size);

console.log("\n--- Exercise 9: shared state ---");
Registry.add("first");
Registry.add("second");
console.log("registry ->", Registry.items);
Registry.reset();
console.log("after reset ->", Registry.items);
