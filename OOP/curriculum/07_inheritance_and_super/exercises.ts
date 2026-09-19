// OOP Exercise 07: Inheritance and `super`
// Run this file with: npm run ex OOP/curriculum/07_inheritance_and_super/exercises.ts
// Typecheck with:    npm run check
//
// `extends` is a prototype chain, not a copy. This file walks the chain, the
// constructor rules, the initialisation-order trap, and the Liskov failure.
//
// Several "prove it does not compile" lines are COMMENTED OUT. Uncomment one,
// run `npm run check`, read the error, then comment it back.


// ---------------------------------------------------------------------------
// Exercise 1 — The chain
// ---------------------------------------------------------------------------

// TODO: Exercise 1  [lecture Part 0]
// `name` is an own field; `speak`/`describe` live on Animal.prototype;
// `fetch` lives on Dog.prototype. The last line is the important one.
export class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak(): string {
    return `${this.name} makes a sound`;
  }

  describe(): string {
    return `${this.name} says: ${this.speak()}`;
  }
}

export class Dog extends Animal {
  fetch(): string {
    return `${this.name} fetches the ball`;
  }
}


// ---------------------------------------------------------------------------
// Exercise 2 — super() must come first
// ---------------------------------------------------------------------------

// TODO: Exercise 2  [lecture Part 1]
// Read the commented-out line: touching `this` before `super()` does not
// compile, because the object does not exist until the base constructor
// creates it.
export class Cat extends Animal {
  indoor: boolean;

  constructor(name: string, indoor: boolean) {
    // console.log(this.name);     // ERROR TS2339/TS17009 — no `this` yet
    super(name);
    this.indoor = indoor;
  }

  override describe(): string {
    return `${super.describe()} (${this.indoor ? "indoor" : "outdoor"})`;
  }
}

// A subclass with NO constructor gets one inserted that forwards everything.
export class Puppy extends Dog {}


// ---------------------------------------------------------------------------
// Exercise 3 — The initialisation-order trap  [THE IMPORTANT ONE]
// ---------------------------------------------------------------------------

// TODO: Exercise 3  [lecture Part 2]
// `Base2`'s constructor calls `this.greet()`, which is overridable. The
// Derived2 override reads `title`, whose field initialiser has NOT run yet.
//
// Run the file. The constructor prints `undefined Ada`, and the later call
// prints `Dr Ada`. SAME METHOD, SAME OBJECT, TWO DIFFERENT ANSWERS.
//
// YOUR ANSWER: in what order do these four things happen?
//   (a) Base2's constructor body
//   (b) Derived2's field initialiser `title = "Dr"`
//   (c) super() returns
//   (d) the object is allocated
export class Base2 {
  name: string;

  constructor(name: string) {
    this.name = name;
    this.greet();                 // ← an overridable method, from a constructor
  }

  greet(): string {
    return `Base2: ${this.name}`;
  }
}

export class Derived2 extends Base2 {
  title = "Dr";

  override greet(): string {
    return `${this.title} ${this.name}`;
  }
}

// The fix: do not call overridable methods during construction. Compare the
// two lines in the main block.
export class FixedBase {
  constructor(public name: string) {}

  greet(): string {
    return `FixedBase: ${this.name}`;
  }
}

export class FixedDerived extends FixedBase {
  title: string;

  constructor(name: string, title: string) {
    super(name);
    this.title = title;
  }

  override greet(): string {
    return `${this.title} ${this.name}`;
  }
}


// ---------------------------------------------------------------------------
// Exercise 4 — Overriding, `override`, and the misspelling it catches
// ---------------------------------------------------------------------------

// TODO: Exercise 4  [lecture Part 3]
// Uncomment the `speek` method below, run `npm run check`, and read the error.
// Without `override` you would have silently added a second, never-called
// method instead of overriding `speak`.
export class LoudDog extends Dog {
  override speak(): string {
    return `${super.speak()} — WOOF`;
  }

  // override speek(): string { return "typo"; }   // ERROR: no member to override
}


// ---------------------------------------------------------------------------
// Exercise 5 — A three-level super chain
// ---------------------------------------------------------------------------

// TODO: Exercise 5  [lecture Part 3 / Part 8]
// `super` is one step up from the class the method is WRITTEN IN, not the
// root. Run it and check the answer is "ABC".
export class A {
  greet(): string {
    return "A";
  }
}

export class B extends A {
  override greet(): string {
    return `${super.greet()}B`;
  }
}

export class C extends B {
  override greet(): string {
    return `${super.greet()}C`;
  }
}


// ---------------------------------------------------------------------------
// Exercise 6 — What a legal override may change
// ---------------------------------------------------------------------------

// TODO: Exercise 6  [lecture Part 4]
export class Shape {
  clone(): Shape {
    return new Shape();
  }

  move(distance: number): string {
    return `moved ${distance}`;
  }
}

export class Blob extends Shape {
  // A NARROWER return type is fine — a Blob IS a Shape.
  override clone(): Blob {
    return new Blob();
  }

  // An OPTIONAL extra parameter is fine.
  override move(distance: number, speed?: number): string {
    return super.move(distance) + (speed === undefined ? "" : ` at ${speed}`);
  }

  // Uncomment each of these, run `npm run check`, read the error, put it back.
  //
  // override clone(): unknown { return {}; }                  // wider return — ERROR
  // override move(distance: number, speed: number): string {  // required extra — ERROR
  //   return "nope";
  // }
}

// Visibility may WIDEN, never narrow.
export class Guarded {
  protected value = 1;
}

export class Opened extends Guarded {
  public override value = 1;      // widening: fine

  // protected override nothing = 2;    // (see the lecture — narrowing is an error)
}


// ---------------------------------------------------------------------------
// Exercise 7 — Subclassing Error
// ---------------------------------------------------------------------------

// TODO: Exercise 7  [lecture Part 3]
// Two details matter: `super(message)` first, and setting `this.name`, or
// `toString()` says "Error" for every subclass you ever write.
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "ValidationError";       // TODO: what happens without this line?
  }

  override toString(): string {
    return `${this.name} on '${this.field}': ${this.message}`;
  }
}

export function checkPositive(n: number, field: string): number {
  if (!Number.isFinite(n) || n <= 0) {
    throw new ValidationError(`must be a positive number, got ${n}`, field);
  }
  return n;
}


// ---------------------------------------------------------------------------
// Exercise 8 — The Liskov failure
// ---------------------------------------------------------------------------

// TODO: Exercise 8  [lecture Part 7]
// Every signature matches. It compiles. And `stretch` returns two different
// answers depending on which subclass it was handed.
export class Rectangle {
  constructor(
    public width: number,
    public height: number,
  ) {}

  setWidth(w: number): void {
    this.width = w;
  }

  setHeight(h: number): void {
    this.height = h;
  }

  area(): number {
    return this.width * this.height;
  }
}

export class Square extends Rectangle {
  override setWidth(w: number): void {
    this.width = w;
    this.height = w;
  }

  override setHeight(h: number): void {
    this.width = h;
    this.height = h;
  }
}

export function stretch(rect: Rectangle): number {
  rect.setWidth(5);
  rect.setHeight(4);
  return rect.area();
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

console.log("--- Exercise 1: the chain ---");
const rex = new Dog("Rex");
console.log("rex.fetch()    ->", rex.fetch());
console.log("rex.speak()    ->", rex.speak());
console.log("rex.describe() ->", rex.describe());
console.log("instanceof Dog    ->", rex instanceof Dog);
console.log("instanceof Animal ->", rex instanceof Animal);
console.log("own keys ->", Object.keys(rex), "— the methods are NOT own properties");

console.log("\n--- Exercise 2: super() and inherited constructors ---");
const cat = new Cat("Mog", true);
console.log("cat.describe() ->", cat.describe());
console.log("new Puppy('Bit').speak() ->", new Puppy("Bit").speak(), "— no constructor written");

console.log("\n--- Exercise 3: the initialisation-order trap ---");
console.log("constructing a Derived2 now — watch the next line:");
const derived = new Derived2("Ada");
console.log("...and afterwards: derived.greet() ->", derived.greet());
console.log("the same call during construction printed `undefined Ada`");
const fixed = new FixedDerived("Ada", "Dr");
console.log("the fixed version ->", fixed.greet());

console.log("\n--- Exercise 4: override and super ---");
console.log("new LoudDog('Rex').speak() ->", new LoudDog("Rex").speak());

console.log("\n--- Exercise 5: a three-level super chain ---");
console.log("new C().greet() ->", new C().greet());

console.log("\n--- Exercise 6: what an override may change ---");
const blob = new Blob();
console.log("blob.clone() instanceof Blob ->", blob.clone() instanceof Blob);
console.log("blob.move(10)       ->", blob.move(10));
console.log("blob.move(10, 3)    ->", blob.move(10, 3));
console.log("new Opened().value  ->", new Opened().value, "— widened to public");

console.log("\n--- Exercise 7: subclassing Error ---");
try {
  checkPositive(-1, "amount");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("toString ->", error.toString());
    console.log("field    ->", error.field);
    console.log("instanceof Error ->", error instanceof Error);
  }
}

console.log("\n--- Exercise 8: the Liskov failure ---");
console.log("stretch(new Rectangle(0, 0)) ->", stretch(new Rectangle(0, 0)));
console.log("stretch(new Square(0, 0))    ->", stretch(new Square(0, 0)), "← the surprise");
