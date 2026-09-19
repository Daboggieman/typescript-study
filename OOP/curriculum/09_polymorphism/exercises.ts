// OOP Exercise 09: Polymorphism
// Run this file with: npm run ex OOP/curriculum/09_polymorphism/exercises.ts
// Typecheck with:    npm run check
//
// Polymorphism: the same call does the right thing for whatever you called it
// on. This file builds the same shape library twice — once as a tag dispatch,
// once as classes — and compares the consumers.


// ---------------------------------------------------------------------------
// Exercise 1 — The version WITHOUT polymorphism
// ---------------------------------------------------------------------------

// TODO: Exercise 1  [lecture Part 1]
// A `switch` on a tag. It works, and the exhaustiveness check makes it safe.
// Count the branches, then look at the consumer at the bottom of this file.
//
// YOUR ANSWER: if a fourth kind is added, how many functions must change?
export type TagShape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; width: number; height: number };

export function tagArea(shape: TagShape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}

export function tagPerimeter(shape: TagShape): number {
  switch (shape.kind) {
    case "circle":
      return 2 * Math.PI * shape.radius;
    case "square":
      return 4 * shape.side;
    case "rect":
      return 2 * (shape.width + shape.height);
  }
}


// ---------------------------------------------------------------------------
// Exercise 2 — The same library WITH polymorphism
// ---------------------------------------------------------------------------

// TODO: Exercise 2  [lecture Part 1]
// Fill in the three subclasses. Note that the consumer for this version is a
// ONE-LINE reduce, and it will never need to change.
export abstract class PolyShape {
  abstract area(): number;
  abstract perimeter(): number;
  abstract describe(): string;
}

export class PolyCircle extends PolyShape {
  constructor(public radius: number) {
    super();
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }

  override perimeter(): number {
    return 2 * Math.PI * this.radius;
  }

  override describe(): string {
    return `a circle of radius ${this.radius}`;
  }
}

export class PolySquare extends PolyShape {
  constructor(public side: number) {
    super();
  }

  override area(): number {
    return this.side ** 2;
  }

  override perimeter(): number {
    return 4 * this.side;
  }

  override describe(): string {
    return `a square of side ${this.side}`;
  }
}

export class PolyRect extends PolyShape {
  constructor(
    public width: number,
    public height: number,
  ) {
    super();
  }

  override area(): number {
    // TODO: width * height
    return 0;
  }

  override perimeter(): number {
    // TODO: 2 * (width + height)
    return 0;
  }

  override describe(): string {
    // TODO: `a ${width} x ${height} rectangle`
    return "";
  }
}

// ONE consumer, and it does not know what a circle is.
export function totalArea(shapes: PolyShape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}


// ---------------------------------------------------------------------------
// Exercise 3 — The receiver decides, at call time
// ---------------------------------------------------------------------------

// TODO: Exercise 3  [lecture Part 2]
// One call site, three objects, three answers. Run the file and read the
// `Robot` line: mutating the PROTOTYPE changes the behaviour of an object
// that already exists.
export class Robot extends PolyShape {
  override area(): number {
    return 1;
  }

  override perimeter(): number {
    return 4;
  }

  override describe(): string {
    return "a robot";
  }
}


// ---------------------------------------------------------------------------
// Exercise 4 — Polymorphism with no classes at all
// ---------------------------------------------------------------------------

// TODO: Exercise 4  [lecture Part 4]
// A plain object literal and a class instance, side by side, in the same
// array. There is no shared ancestor anywhere.
export interface Priced {
  total(): number;
}

export class LineItem {
  constructor(private readonly cents: number) {}

  total(): number {
    return this.cents / 100;
  }
}


// ---------------------------------------------------------------------------
// Exercise 5 — The strategy pattern, as a function field
// ---------------------------------------------------------------------------

// TODO: Exercise 5  [lecture Part 4]
// This replaces `StandardShipping extends Shipping`, `ExpressShipping extends
// Shipping`, and a factory. Fill in the two functions.
export type ShippingStrategy = (weight: number) => number;

export const standardShipping: ShippingStrategy = (kg) => {
  // TODO: 5 + kg * 0.5
  return 0;
};

export const expressShipping: ShippingStrategy = (kg) => {
  // TODO: 20 + kg * 2
  return 0;
};

export const freeShipping: ShippingStrategy = () => 0;

export class Order {
  constructor(
    public readonly weight: number,
    public readonly shipping: ShippingStrategy,
  ) {}

  shippingCost(): number {
    return this.shipping(this.weight);
  }
}

// The class-hierarchy version, for comparison. Notice how much more there is
// to write for the same three behaviours.
export abstract class ShippingMethod {
  abstract cost(weight: number): number;
}

export class StandardShipping extends ShippingMethod {
  override cost(weight: number): number {
    return 5 + weight * 0.5;
  }
}

export class ExpressShipping extends ShippingMethod {
  override cost(weight: number): number {
    return 20 + weight * 2;
  }
}


// ---------------------------------------------------------------------------
// Exercise 6 — The `instanceof` leak
// ---------------------------------------------------------------------------

// TODO: Exercise 6  [lecture Part 6]
// This is the smell: the caller is doing the dispatch the class was supposed
// to do. A new round shape is not handled, and there is no compile error.
export function leakyDescribe(shapes: PolyShape[]): string[] {
  return shapes.map((s) =>
    s instanceof PolyCircle ? `circle of radius ${s.radius}` : s.describe(),
  );
}

// The fix: ask for a CAPABILITY, not a class. Any future round shape works
// without touching this.
export interface HasRadius {
  radius: number;
}

export function hasRadius(shape: PolyShape): shape is PolyShape & HasRadius {
  // TODO: return true when "radius" is in the object
  return false;
}

export function betterDescribe(shapes: PolyShape[]): string[] {
  return shapes.map((s) => (hasRadius(s) ? `round, r=${s.radius}` : s.describe()));
}

// A shape that did NOT exist when `hasRadius` was written. It still works.
export class PolyDisc extends PolyShape {
  constructor(public readonly radius: number) {
    super();
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }

  override perimeter(): number {
    return 2 * Math.PI * this.radius;
  }

  override describe(): string {
    return `a disc of radius ${this.radius}`;
  }
}


// ---------------------------------------------------------------------------
// Exercise 7 — The other three kinds of polymorphism
// ---------------------------------------------------------------------------

// TODO: Exercise 7  [lecture Part 3]
// Ad-hoc (overloading) — chosen by the ARGUMENTS.
export function pad(value: string, width: number): string;
export function pad(value: number, width: number): string;
export function pad(value: string | number, width: number): string {
  return String(value).padStart(width, "0");
}

// Parametric (generics) — one function, many types, no classes involved.
export function first<T>(items: T[]): T | undefined {
  return items[0];
}

// Structural — "if it has the members, it works".
export function structuralArea(shape: { area(): number }): number {
  return shape.area();
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

const tagShapes: TagShape[] = [
  { kind: "circle", radius: 2 },
  { kind: "square", side: 3 },
  { kind: "rect", width: 4, height: 5 },
];

const polyShapes: PolyShape[] = [new PolyCircle(2), new PolySquare(3), new PolyRect(4, 5)];

console.log("--- Exercise 1: tag dispatch ---");
console.log("areas      ->", tagShapes.map(tagArea).map((n) => n.toFixed(2)).join(", "));
console.log("perimeters ->", tagShapes.map(tagPerimeter).map((n) => n.toFixed(2)).join(", "));

console.log("\n--- Exercise 2: classes, and one consumer ---");
console.log("totalArea  ->", totalArea(polyShapes).toFixed(2));
console.log("describe ->");
for (const s of polyShapes) {
  console.log("  ", s.describe(), "— area", s.area().toFixed(2));
}
console.log("totalArea does not mention Circle anywhere, and never will");

console.log("\n--- Exercise 3: the receiver decides, at call time ---");
const robot = new Robot();
console.log("robot.area() ->", robot.area());
(Robot.prototype as { area: () => number }).area = () => 99;
console.log("after patching Robot.prototype ->", robot.area(), "— the SAME object");

console.log("\n--- Exercise 4: no classes required ---");
const basket: Priced[] = [{ total: () => 19.99 }, { total: () => 4.5 * 3 }, new LineItem(1200)];
console.log("basket total ->", basket.reduce((sum, p) => sum + p.total(), 0));
console.log("an object literal and a class instance, in the same array");

console.log("\n--- Exercise 5: strategy as a function ---");
console.log("standard(10) ->", new Order(10, standardShipping).shippingCost());
console.log("express(10)  ->", new Order(10, expressShipping).shippingCost());
console.log("free(10)     ->", new Order(10, freeShipping).shippingCost());
console.log("the class version, for the same answer ->", new StandardShipping().cost(10));

console.log("\n--- Exercise 6: the instanceof leak, and the fix ---");
const withDisc: PolyShape[] = [...polyShapes, new PolyDisc(1)];
console.log("leakyDescribe  ->", leakyDescribe(withDisc).join(" | "), "← the disc is just 'a disc'");
console.log("betterDescribe ->", betterDescribe(withDisc).join(" | "), "← the capability found it");

console.log("\n--- Exercise 7: the other three kinds ---");
console.log("ad-hoc      ->", pad("7", 3), pad(7, 3));
console.log("parametric  ->", first([10, 20, 30]), first(["a", "b"]));
console.log("structural  ->", structuralArea({ area: () => 42 }));
