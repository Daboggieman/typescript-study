// OOP Exercise 08: Abstract Classes and Interfaces
// Run this file with: npm run ex OOP/curriculum/08_abstract_classes_and_interfaces/exercises.ts
// Typecheck with:    npm run check
//
// An INTERFACE says what something can do. An ABSTRACT CLASS says what
// something is, and gives it something. This file builds the same Shape both
// ways so the difference is visible.
//
// Several "prove it does not compile" lines are COMMENTED OUT. Uncomment one,
// run `npm run check`, read the error, then comment it back.


// ---------------------------------------------------------------------------
// Exercise 1 — An abstract class: a contract plus shared code
// ---------------------------------------------------------------------------

// TODO: Exercise 1  [lecture Part 1]
// `describe()` is written ONCE and calls an abstract `area()` that each
// subclass supplies. That is the template method, and it is the best reason
// to reach for `abstract`.
export abstract class AbstractShape {
  constructor(public readonly name: string) {}

  describe(): string {
    return `${this.name} with area ${this.area().toFixed(2)}`;
  }

  abstract area(): number;
}

export class Circle extends AbstractShape {
  constructor(public radius: number) {
    super("circle");
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}

export class Square extends AbstractShape {
  constructor(public side: number) {
    super("square");
  }

  override area(): number {
    return this.side ** 2;
  }
}

// Uncomment, run `npm run check`, read the error, then comment it back.
//
// const impossible = new AbstractShape("blob");

// TODO: Exercise 2  [lecture Part 1]
// Uncomment `Triangle` below. It extends AbstractShape and never supplies
// `area`, so the compiler refuses to let the class exist.
//
// class Triangle extends AbstractShape {
//   constructor(public base: number, public height: number) {
//     super("triangle");
//   }
// }


// ---------------------------------------------------------------------------
// Exercise 3 — An abstract PROPERTY
// ---------------------------------------------------------------------------

// TODO: Exercise 3  [lecture Part 1]
// Any member can be abstract, not just methods. `Product` supplies the
// implementation; `price` and `sku` come from the subclasses.
export abstract class Sellable {
  abstract readonly sku: string;

  protected abstract price(): number;

  priceLabel(): string {
    return `${this.sku}: $${this.price().toFixed(2)}`;
  }
}

export class Book extends Sellable {
  override readonly sku = "BOOK-001";

  constructor(public readonly title: string, private readonly cents: number) {
    super();
  }

  protected override price(): number {
    return this.cents / 100;
  }
}


// ---------------------------------------------------------------------------
// Exercise 4 — The same contract as an INTERFACE
// ---------------------------------------------------------------------------

// TODO: Exercise 4  [lecture Part 2]
// No code, no runtime existence, no constructor. Note that `Circle2` has to
// write its own `describe` — an interface shares nothing.
export interface IShape {
  readonly name: string;
  area(): number;
  describe(): string;
}

export class Circle2 implements IShape {
  constructor(public readonly name: string, public radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  describe(): string {
    return `${this.name}: ${this.area().toFixed(2)}`;
  }
}

// Uncomment, run `npm run check`, read the error, then comment it back.
//
// class Bad implements IShape {
//   readonly name = "bad";
//   // `area` and `describe` are both missing
// }


// ---------------------------------------------------------------------------
// Exercise 5 — Structural typing: `implements` is optional
// ---------------------------------------------------------------------------

// TODO: Exercise 5  [lecture Part 2]
// `Statue` never mentions IShape, and satisfies it anyway. Delete the
// `implements` clause from Circle2 and nothing changes — except that your
// error would move from the class to the call site.
export class Statue {
  readonly name = "statue";

  area(): number {
    return 0;
  }

  describe(): string {
    return "a statue has no area";
  }
}

// Uncomment, run `npm run check`, read the error, then comment it back.
// The error names the missing member, at the CLASS — which is the reason to
// write `implements` even though structural typing does not require it.
//
// class Weird implements IShape {
//   readonly name = "weird";
//   area(): number { return 1; }
//   // `describe` is missing
// }

export function totalArea(shapes: IShape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}


// ---------------------------------------------------------------------------
// Exercise 6 — Several interfaces on one class
// ---------------------------------------------------------------------------

// TODO: Exercise 6  [lecture Part 3]
// The practical substitute for multiple inheritance. Fill in the two methods.
export interface Serializable {
  toJSON(): unknown;
}

export interface Comparable<T> {
  compareTo(other: T): number;
}

export class Version implements Serializable, Comparable<Version> {
  constructor(
    public readonly major: number,
    public readonly minor: number,
  ) {}

  toJSON(): unknown {
    // TODO: return a plain object with major and minor
    return {};
  }

  compareTo(other: Version): number {
    // TODO: major first, then minor
    return 0;
  }
}


// ---------------------------------------------------------------------------
// Exercise 7 — Interfaces extend interfaces
// ---------------------------------------------------------------------------

// TODO: Exercise 7  [lecture Part 5]
// Unlike classes, an interface may extend several. `Person` is the union of
// both shapes.
export interface Named {
  name: string;
}

export interface Aged {
  age: number;
}

export interface Person extends Named, Aged {
  email: string;
}

export const ada: Person = { name: "Ada", age: 36, email: "ada@example.com" };


// ---------------------------------------------------------------------------
// Exercise 8 — Interfaces have no runtime presence
// ---------------------------------------------------------------------------

// TODO: Exercise 8  [lecture Part 6]
// Uncomment each line, run `npm run check`, read the error, put it back.
// An interface is erased entirely — it is not a value, and you cannot check
// against it. An abstract class, by contrast, IS a value.
//
// console.log(ada instanceof Named);
// console.log(typeof IShape);
export abstract class Marker {
  abstract tag(): string;
}

export class Tagged extends Marker {
  override tag(): string {
    return "tagged";
  }
}


// ---------------------------------------------------------------------------
// Exercise 9 — A construct signature
// ---------------------------------------------------------------------------

// TODO: Exercise 9  [lecture Part 8 / CURRICULUM/17]
// `new (...) => ...` describes a CLASS, not an instance. Fill in `register`'s
// body. Note that a construct-signature type has no `Function` members — try
// `ctor.length` or `ctor.name` and see for yourself.
export interface ShapeConstructor {
  new (name: string): { name: string; area(): number };
  readonly kind: string;
}

export class NamedCircle {
  static readonly kind = "circle";

  constructor(public name: string) {}

  area(): number {
    return 0;
  }
}

export function register(ctor: ShapeConstructor): string {
  // TODO: build an instance with `new ctor("probe")` and return
  // `${ctor.kind} builds a ${instance.name}`
  //
  // A construct-signature type has no `Function` members — try `ctor.length`
  // or `ctor.name` and read the error. The signature describes what `new`
  // produces, not the function object underneath.
  return "";
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

console.log("--- Exercise 1: the template method ---");
console.log("new Circle(2).describe() ->", new Circle(2).describe());
console.log("new Square(3).describe() ->", new Square(3).describe());
console.log("Circle instanceof AbstractShape ->", new Circle(2) instanceof AbstractShape);

console.log("\n--- Exercise 3: an abstract property ---");
const book = new Book("Dune", 1250);
console.log("book.priceLabel() ->", book.priceLabel());
console.log("book.sku          ->", book.sku);

console.log("\n--- Exercise 4/5: interface vs abstract class ---");
const shapes: IShape[] = [new Circle2("circle", 2), new Statue()];
console.log("totalArea ->", totalArea(shapes).toFixed(2));
console.log("Statue was never told about IShape, and satisfies it anyway");
console.log("a plain object works too ->", totalArea([{ name: "dot", area: () => 0, describe: () => "dot" }]));

console.log("\n--- Exercise 6: two interfaces at once ---");
const v1 = new Version(1, 2);
const v2 = new Version(2, 0);
console.log("v1.toJSON()          ->", JSON.stringify(v1.toJSON()));
console.log("v1.compareTo(v2)     ->", v1.compareTo(v2));
console.log("v2.compareTo(v1)     ->", v2.compareTo(v1));

console.log("\n--- Exercise 7: interfaces extending interfaces ---");
console.log("ada ->", JSON.stringify(ada));

console.log("\n--- Exercise 8: runtime presence ---");
console.log("new Tagged() instanceof Marker ->", new Tagged() instanceof Marker, "— abstract classes are values");
console.log("an interface cannot appear on the right of instanceof at all");

console.log("\n--- Exercise 9: a construct signature ---");
console.log("register(NamedCircle) ->", register(NamedCircle));
