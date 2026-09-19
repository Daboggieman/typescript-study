// OOP Exercise 04: Properties and Accessors
// Run this file with: npm run ex OOP/curriculum/04_properties_and_accessors/exercises.ts
// Typecheck with:    npm run check
//
// Accessors look like fields from the outside. From the inside they are code.
// Run this file and read the output — several of these print a before and an
// after so you can see the accessor fire.


// TODO: Exercise 1  [lecture Part 1]
// A plain field accepts anything. Nothing here stops a negative radius.
export class PlainCircle {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}


// TODO: Exercise 2  [lecture Part 1]
// The same class with a validating accessor pair. `_radius` is the private
// backing field; `radius` is the accessor.
//
// Fill in the setter body so that a negative value throws a RangeError.
export class Circle {
  private _radius: number;

  constructor(radius: number) {
    this._radius = radius;
  }

  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    // TODO: throw a RangeError if value is negative, otherwise assign
  }

  // TODO: Exercise 3 — add a GET-ONLY `area` accessor returning the area.
  // It takes no parentheses at the call site.
}


// TODO: Exercise 4  [lecture Part 1]
// THE INFINITE RECURSION BUG. Uncomment the getter below and run the file.
// `this.radius` inside `get radius` calls the getter again, forever.
//
// YOUR ANSWER: what error does Node print, and why is a differently-named
// backing field the fix?
export class RecursiveCircle {
  private _radius = 5;

  get radius(): number {
    return this._radius;
    // return this.radius;
  }
}


// TODO: Exercise 5  [lecture Part 3]
// Two units, one stored number, and one validation rule reachable from both.
// Fill in the two accessors so the conversion round-trips.
export class Temperature {
  // The `= 0` is here for a TypeScript reason worth knowing: the compiler's
  // "definitely assigned in the constructor" analysis follows direct
  // assignments to `this._celsius`, and it does NOT follow a call to a setter.
  // So assigning through `this.celsius = ...` below satisfies the RULE but not
  // the CHECK, and the initialiser is what settles the compiler. Harmless here
  // because the constructor overwrites it immediately.
  private _celsius: number = 0;

  constructor(celsius: number) {
    // NOTE: assigning through the SETTER, not to _celsius directly —
    // that way the constructor cannot bypass the check.
    this.celsius = celsius;
  }

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (!Number.isFinite(value)) {
      throw new RangeError(`temperature must be finite, got ${value}`);
    }
    if (value < -273.15) {
      throw new RangeError(`temperature below absolute zero: ${value}`);
    }
    this._celsius = value;
  }

  get fahrenheit(): number {
    // TODO: convert _celsius to fahrenheit
    return 0;
  }

  set fahrenheit(value: number) {
    // TODO: convert and assign through `this.celsius`, so absolute zero
    // is still checked
  }
}


// TODO: Exercise 6  [lecture Part 4]
// The same circle with a genuinely private `#` field. Uncomment the outside
// access below and read what happens — `#` is enforced by the PARSER, so it
// is not even a type error.
export class PrivateCircle {
  #radius: number;

  constructor(radius: number) {
    this.#radius = radius;
  }

  get radius(): number {
    return this.#radius;
  }

  set radius(value: number) {
    if (value < 0) throw new RangeError("negative radius");
    this.#radius = value;
  }

  get area(): number {
    return Math.PI * this.#radius ** 2;
  }
}

const pc = new PrivateCircle(2);
// console.log(pc.#radius);
// pc.#radius = -1;


// TODO: Exercise 7  [lecture Part 4]
// `private` versus `#`. A `private` field is invisible to the compiler but
// PRESENT on the object; a `#` field is not on the object at all.
// Run the file and compare the two Object.keys lines.
export class Mixed {
  private declaredPrivate = 1;
  #hashPrivate = 2;
  publicField = 3;

  keys(): string[] {
    return Object.keys(this);
  }
}


// TODO: Exercise 8  [lecture Part 6]
// A getter with a SIDE EFFECT — the mistake the lecture warns about.
// Run the file and read the three values. They are not all the same.
export class Sneaky {
  private _count = 0;

  get count(): number {
    this._count += 1;
    return this._count;
  }

  // The correct version: a method, because it changes something.
  takeNext(): number {
    this._count += 1;
    return this._count;
  }
}


// TODO: Exercise 9  [lecture Part 5]
// Prefer immutability to caching. `summary` is computed ONCE, in the
// constructor, and is readonly afterwards. No cache, no invalidation, no
// staleness. Fill in the constructor.
export class Report {
  readonly total: number;
  readonly summary: string;

  constructor(private readonly rows: string[]) {
    // TODO: set this.total to the row count,
    // and this.summary to the rows upper-cased and joined with "\n"
    this.total = 0;
    this.summary = "";
  }
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

console.log("--- Exercise 1: a plain field accepts anything ---");
const plain = new PlainCircle(5);
plain.radius = -3;
console.log("plain.radius ->", plain.radius, " area ->", plain.area());

console.log("\n--- Exercise 2/3: a validating accessor ---");
const circle = new Circle(5);
console.log("circle.radius ->", circle.radius);
circle.radius = 10;
console.log("after set to 10 ->", circle.radius);
try {
  circle.radius = -3;
} catch (error) {
  console.log("negative radius ->", error instanceof Error ? error.message : error);
}
console.log("unchanged after the throw ->", circle.radius);

console.log("\n--- Exercise 4: infinite recursion ---");
const recursive = new RecursiveCircle();
console.log("recursive.radius ->", recursive.radius);

console.log("\n--- Exercise 5: two units, one stored number ---");
const temp = new Temperature(100);
console.log("100C ->", temp.fahrenheit, "F");
temp.fahrenheit = 32;
console.log("32F  ->", temp.celsius, "C");
try {
  temp.fahrenheit = -500;
} catch (error) {
  console.log("below absolute zero ->", error instanceof Error ? error.message : error);
}

console.log("\n--- Exercise 6/7: # versus private ---");
console.log("pc.radius ->", pc.radius, " pc.area ->", pc.area);
const mixed = new Mixed();
console.log("Object.keys(this) inside the class ->", mixed.keys());
console.log("Object.keys from OUTSIDE          ->", Object.keys(mixed));

console.log("\n--- Exercise 8: a getter with a side effect ---");
const sneaky = new Sneaky();
console.log("three reads of the same getter ->", sneaky.count, sneaky.count, sneaky.count);
console.log("the method version             ->", sneaky.takeNext());

console.log("\n--- Exercise 9: computed once, in the constructor ---");
const report = new Report(["alpha", "beta"]);
console.log("total   ->", report.total);
console.log("summary ->", JSON.stringify(report.summary));
