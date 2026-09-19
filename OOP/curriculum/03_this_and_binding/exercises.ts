// OOP Exercise 03: `this` and Binding
// Run this file with: npm run ex OOP/curriculum/03_this_and_binding/exercises.ts
// Typecheck with:    npm run check
//
// THIS IS THE MOST IMPORTANT EXERCISE FILE IN THE MODULE.
//
// A note on the casts you will see below. TypeScript CHECKS `this` at compile
// time, so several of these deliberately-broken demos would be compile errors
// — which would stop the file running at all. Casting the extracted method to
// a plain `() => void` steps around the compile-time check so you can watch
// the RUNTIME failure, which is the thing this lesson is about.
//
// Exercise 7 shows the compile-time check in action, on purpose.

export class Greeter {
  constructor(public name: string) {}

  greet(): string {
    return `Hello, ${this.name}`;
  }
}

const ada = new Greeter("Ada");
const grace = new Greeter("Grace");


// TODO: Exercise 1  [lecture Part 1, rule 3]
// Implicit binding: the object LEFT OF THE DOT is `this`.
// The second line is the point of the whole lesson — the SAME function
// object, called with a different receiver, produces a different answer.
console.log("--- Exercise 1: the dot decides ---");
console.log("ada.greet()            ->", ada.greet());            // Hello, Ada
console.log("grace.greet()          ->", grace.greet());          // Hello, Grace
console.log("ada.greet.call(grace)  ->", ada.greet.call(grace));  // ???

// YOUR ANSWER: what did the third line print, and why does it prove that a
// method does NOT carry its object around with it?


// TODO: Exercise 2  [lecture Part 2.1]
// Lose `this` by copying the method to a variable. The cast is only there so
// the file compiles — at runtime this is a TypeError.
console.log("\n--- Exercise 2: losing `this` by copying ---");
const detached = ada.greet as () => string;
try {
  console.log("detached()             ->", detached());
} catch (error) {
  console.log("detached()             -> threw:", error instanceof Error ? error.message : error);
}


// TODO: Exercise 3  [lecture Part 2.1]
// Lose `this` the way it actually happens in real code: by passing a method
// as a callback. Both setTimeout and forEach call it with no receiver.
export class Counter {
  count = 0;

  incrementMethod(): void {
    this.count += 1;
  }

  // An arrow CLASS PROPERTY — `this` is captured when the instance is built.
  // TODO: confirm this survives everything incrementMethod does not.
  increment = (): void => {
    this.count += 1;
  };
}

console.log("\n--- Exercise 3: losing `this` as a callback ---");
const counter = new Counter();

// These two are the broken versions. Uncomment ONE at a time and run the
// file — the error is thrown asynchronously, so it appears after everything
// else has printed.
//
// [1, 2, 3].forEach(counter.incrementMethod);
// setTimeout(counter.incrementMethod, 10);

// These two work, because the arrow captured `this` at construction.
[1, 2, 3].forEach(counter.increment);
setTimeout(counter.increment, 10);
console.log("counter.count (after the arrow ones) ->", counter.count);


// TODO: Exercise 4  [lecture Part 2.3]
// A plain `function` nested inside a method does NOT inherit `this`,
// even though it is written inside one. An arrow does.
export class Nested {
  name = "inner";

  broken(): string {
    function inner(this: void): string {
      // `this` here is undefined, not the Nested instance.
      return "broken";
    }
    return inner();
  }

  fixed(): string {
    const inner = (): string => {
      return this.name;      // the arrow inherited the method's `this`
    };
    return inner();
  }
}

console.log("\n--- Exercise 4: nested functions vs arrows ---");
const nested = new Nested();
console.log("fixed()  ->", nested.fixed());      // "inner"
console.log("broken() ->", nested.broken());     // "broken" — no `this` at all

// YOUR ANSWER: change `broken` so its inner function reads `this.name` the
// way `fixed` does. What is the one-character-class change?


// TODO: Exercise 5  [lecture Part 1, rule 2]
// `bind` locks `this` in permanently — a later `.call` cannot override it.
// And `call` vs `apply` differ only in how the arguments are passed.
export function describeAge(this: { name: string; age: number }, suffix: string): string {
  return `${this.name} is ${this.age}${suffix}`;
}

const person = { name: "Ada", age: 36 };

console.log("\n--- Exercise 5: call, apply, bind ---");
console.log("call   ->", describeAge.call(person, " years old"));
console.log("apply  ->", describeAge.apply(person, [" years old"]));

const bound = describeAge.bind(person);
console.log("bind   ->", bound(" years old"));

const rebound = bound.call({ name: "Grace", age: 45 }, " years old");
console.log("rebound->", rebound);      // still Ada — bind wins

// YOUR ANSWER: why does `rebound` print Ada rather than Grace?


// TODO: Exercise 6  [lecture Part 6]
// The four fixes for a lost `this`, side by side. Only the first one lives
// in the class. Uncomment the commented lines and confirm each works.
export class Fixes {
  count = 0;

  // Fix 1: an arrow property — `this` captured at construction
  arrow = (): void => {
    this.count += 1;
  };

  // Fix 2 target: a plain method, bound at the call site
  bump(): void {
    this.count += 1;
  }
}

const fixes = new Fixes();
fixes.arrow();
setTimeout(fixes.arrow, 10);                                   // fix 1
setTimeout(fixes.bump.bind(fixes), 10);                        // fix 2
setTimeout(() => fixes.bump(), 10);                            // fix 3
// fixes.bump.call(fixes);                                     // fix 4


// TODO: Exercise 7  [lecture Part 5]
// The `this: T` parameter is TypeScript-only — erased at runtime, never
// passed — but it turns a wrong `this` into a COMPILE error.
//
// Uncomment the two lines below, one at a time, run `npm run check`, and read
// the errors. Then comment them back.
export function greetTyped(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}`;
}

const named = { name: "Ada", greetTyped };
console.log("\n--- Exercise 7: this parameters ---");
console.log("named.greetTyped ->", named.greetTyped("Hello"));

// greetTyped("Hello");
//
// YOUR ANSWER: without the `this: { name: string }` annotation, what would
// `greetTyped("Hello")` do — compile and crash, or fail to compile?


// TODO: Exercise 8  [lecture Part 5]
// `this: void` forbids a receiver entirely — the function must never be
// called as a method.
//
// Uncomment the offending line, run `npm run check`, read the error, and put
// it back.
export function pure(this: void, n: number): number {
  return n * 2;
}

console.log("\n--- Exercise 8: this: void ---");
console.log("pure(21) ->", pure(21));

// pure.call({ name: "Ada" }, 21);


// TODO: Exercise 9  [lecture Part 4]
// The cost of arrow properties, made visible: a method is shared through the
// prototype, an arrow property is a separate function per instance.
console.log("\n--- Exercise 9: methods are shared, arrows are not ---");
const c1 = new Counter();
const c2 = new Counter();
console.log("c1.incrementMethod === c2.incrementMethod ->", c1.incrementMethod === c2.incrementMethod);
console.log("c1.increment === c2.increment             ->", c1.increment === c2.increment);
