// OOP Exercise 01: Classes and Objects
// Run this file with: npm run ex OOP/curriculum/01_classes_and_objects/exercises.ts
// Typecheck with:    npm run check
//
// Work top to bottom. Each exercise maps to a Part of lecture.md, noted in
// brackets. The file runs end to end from the start — the class below is
// complete enough to execute, and the TODOs ask you to change and extend it.
// Run it often to track progress.
//
// Lines that deliberately produce a COMPILE ERROR are commented out. Uncomment
// one, run `npm run check`, read the error, then comment it back.


// TODO: Exercise 1  [lecture Part 1.2 - 1.3]
// Define an empty `Car` class. Use `{}` for the body.
// Then look at the main block below: it creates two Cars and checks that they
// are separate objects. Run the file and confirm the output.
export class EmptyCar {}


// TODO: Exercise 2  [lecture Part 1.4]
// THE BIG DIFFERENCE FROM PYTHON. Uncomment the line below and run
// `npm run check`. Read the error carefully.
//
// In Python you can bolt attributes onto an object from outside the class.
// In TypeScript the shape is fixed by the class, so this is a COMPILE error.
//
// const probe = new EmptyCar();
// probe.make = "Toyota";


// TODO: Exercise 3  [lecture Part 1.4 - 1.5]
// Declare fields on a class, the TypeScript way. `make`, `model` and `year`
// are declared below with defaults, so every Car is guaranteed complete.
//
// Then uncomment the field with no default and no assignment and read what
// `strictPropertyInitialization` says about it.
export class Car {
  make: string = "unknown";
  model: string = "unknown";
  year: number = 0;

  // model2: string;
  // name!: string;         // the definite-assignment assertion — "trust me"
}


// TODO: Exercise 4  [lecture Part 2.1]
// Add a `honk` method to Car that prints exactly: Beep beep!
// A method is a function written in the class body with no `function` keyword.
export class CarWithHonk {
  make = "Toyota";
  model = "Corolla";
  year = 2020;

  honk(): void {
    // TODO: console.log("Beep beep!");
  }
}


// TODO: Exercise 5  [lecture Part 2.2]
// Add a `describe` method that uses `this` to print "<year> <make> <model>",
// for example "2020 Toyota Corolla".
//
// The main block calls it on TWO different cars, to prove that one method
// definition produces two different outputs depending on which object
// arrived as `this`.
export class CarDescriber {
  constructor(
    public make: string,
    public model: string,
    public year: number,
  ) {}

  describe(): void {
    // TODO: use this.year, this.make, this.model
  }
}


// TODO: Exercise 6  [lecture Part 2.4]
// A method and an arrow property, side by side. Both work when called on the
// object. Only ONE of them survives being handed to a variable.
//
// The main block demonstrates this with a try/catch. Read the output and
// explain which is which — then write the answer in the comment box below.
//
// YOUR ANSWER:
export class CarSounds {
  name = "Rex";

  methodVersion(): string {
    return `${this.name} says Woof!`;
  }

  arrowVersion = (): string => `${this.name} says Woof!`;
}


// TODO: Exercise 7  [lecture Part 4]
// Nothing to write. The main block prints `typeof` for a primitive and for
// its wrapper object, and shows they are not equal. Read the output and make
// sure you can say why `new String("hi")` is a trap.
//
// YOUR ANSWER:


// ---------------------------------------------------------------------------
// Main block — everything below runs when the file is executed.
// ---------------------------------------------------------------------------

console.log("--- Exercise 1: two objects are genuinely separate [Part 1.3] ---");
const car1 = new EmptyCar();
const car2 = new EmptyCar();
console.log("car1 === car2 ->", car1 === car2);   // expect: false
console.log("car1 === car1 ->", car1 === car1);   // expect: true

console.log("\n--- Exercise 3: declare fields, then set them [Part 1.4] ---");
const car3 = new Car();
console.log("defaults      ->", car3.year, car3.make, car3.model);
car3.make = "Toyota";
car3.model = "Corolla";
car3.year = 2020;
console.log("after setting ->", `${car3.year} ${car3.make} ${car3.model}`);

console.log("\n--- Exercise 4: a method [Part 2.1] ---");
const car4 = new CarWithHonk();
car4.honk();                                      // expect: Beep beep!

console.log("\n--- Exercise 5: this, and one definition with two outputs [Part 2.2] ---");
const car5 = new CarDescriber("Toyota", "Corolla", 2020);
const car6 = new CarDescriber("Honda", "Civic", 2018);
car5.describe();                                  // expect: 2020 Toyota Corolla
car6.describe();                                  // expect: 2018 Honda Civic

console.log("\n--- Exercise 6: a method loses `this`, an arrow keeps it [Part 2.4] ---");
const sounds = new CarSounds();

try {
  const detachedMethod = sounds.methodVersion;
  console.log("detached method ->", detachedMethod());
} catch (error) {
  console.log("detached method threw ->", error instanceof Error ? error.message : error);
}

const detachedArrow = sounds.arrowVersion;
console.log("detached arrow  ->", detachedArrow());   // works

console.log("\n--- Exercise 7: primitives and their wrappers [Part 4] ---");
const primitive: unknown = "hi";
const wrapper: unknown = new String("hi");
console.log('typeof "hi"             ->', typeof "hi");        // "string"
console.log('typeof new String("hi") ->', typeof wrapper);      // "object"
console.log('"hi" === new String("hi") ->', primitive === wrapper);   // false
