// OOP Exercise 05: Methods and Encapsulation
// Run this file with: npm run ex OOP/curriculum/05_methods_and_encapsulation/exercises.ts
// Typecheck with:    npm run check
//
// Encapsulation means the fields are not the interface. This file builds the
// same idea three ways — a public field, a private field with methods, and a
// `#` field — and then covers chaining and immutability.
//
// Some of the "prove it does not compile" lines are COMMENTED OUT. Uncomment
// one, run `npm run check`, read the error, then comment it back.


// ---------------------------------------------------------------------------
// Exercise 1 — A public field cannot hold an invariant
// ---------------------------------------------------------------------------

// TODO: Exercise 1  [lecture Part 2]
// Nothing stops a caller from putting this object into an impossible state.
// Run the file and read the main block to see it happen.
export class LeakyAccount {
  balance = 0;

  deposit(amount: number): void {
    this.balance += amount;
  }
}


// ---------------------------------------------------------------------------
// Exercise 2 — The same class, encapsulated
// ---------------------------------------------------------------------------

// TODO: Exercise 2  [lecture Part 2]
// Fill in `deposit` and `withdraw` so that:
//   - a non-finite or non-positive amount throws a RangeError
//   - a withdrawal larger than the balance throws a RangeError
//   - both push a line onto #history, so the balance and the history
//     can never drift apart
export class Account {
  #balance = 0;
  #history: string[] = [];

  get balance(): number {
    return this.#balance;
  }

  get statement(): string {
    return this.#history.join(", ");
  }

  deposit(amount: number): void {
    // TODO: validate, then update #balance and push `+${amount}` to #history
  }

  withdraw(amount: number): void {
    // TODO: validate, then update #balance and push `-${amount}` to #history
  }
}


// ---------------------------------------------------------------------------
// Exercise 3 — Proving `private` is compile-time only
// ---------------------------------------------------------------------------

// TODO: Exercise 3  [lecture Part 1]
// `private` is erased at runtime, so a cast gets straight past it. This is
// why `private` is not a security boundary.
export class Secret {
  private value = 42;

  reveal(): number {
    return this.value;
  }
}

// Uncomment, run `npm run check`, read the error, then comment it back.
// The point is that the compiler DOES stop you here.
//
// const probe = new Secret();
// probe.value = 99;

// And this is the same field, reached anyway — via a cast. Run the file.
const bypass = new Secret() as unknown as { value: number };
bypass.value = 99;


// ---------------------------------------------------------------------------
// Exercise 4 — Proving `#` cannot be reached at all
// ---------------------------------------------------------------------------

// TODO: Exercise 4  [lecture Part 1]
// A `#` field is not a string-keyed property, so there is no name to cast to.
// Uncomment the line below and run `npm run check` — the error is a PARSE
// error (TS18028 / "Property '#x' is not accessible"), not just a type error.
// There is no cast that gets around it.
export class Vault {
  #combination = 1234;

  get combination(): number {
    return this.#combination;
  }
}

const vault = new Vault();
// console.log(vault.#combination);


// ---------------------------------------------------------------------------
// Exercise 5 — A chainable builder
// ---------------------------------------------------------------------------

// TODO: Exercise 5  [lecture Part 3]
// Fill in the three methods so they append to `#parts` and `return this`.
// Note the return type: `this`, not `QueryBuilder`.
export class QueryBuilder {
  #parts: string[] = [];

  select(...columns: string[]): this {
    // TODO: push `SELECT a, b, c` and return this
    return this;
  }

  from(table: string): this {
    // TODO: push `FROM table` and return this
    return this;
  }

  where(condition: string): this {
    // TODO: push `WHERE condition` and return this
    return this;
  }

  build(): string {
    return this.#parts.join(" ");
  }
}


// ---------------------------------------------------------------------------
// Exercise 6 — Why the return type must be `this`
// ---------------------------------------------------------------------------

// TODO: Exercise 6  [lecture Part 3]
// Base.setA returns `this`, so a chain on a Child is still a Child.
export class Base {
  #log: string[] = [];

  setA(): this {
    this.#log.push("A");
    return this;
  }

  get log(): string {
    return this.#log.join("");
  }
}

export class Child extends Base {
  setB(): this {
    return this.setA();
  }

  extra(): string {
    return "extra";
  }
}

// This compiles because setA() returns `this` — a Child, not a Base.
// Now change Base.setA's return type to `Base` and re-run `npm run check`.
const chained = new Child().setA().setB().extra();


// ---------------------------------------------------------------------------
// Exercise 7 — Mutable vs immutable
// ---------------------------------------------------------------------------

// TODO: Exercise 7  [lecture Part 5]
// A mutable Range can be put into an impossible state after construction.
export class MutableRange {
  min: number;
  max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  contains(n: number): boolean {
    return n >= this.min && n <= this.max;
  }
}

// TODO: Exercise 8  [lecture Part 5]
// The same Range, immutable. Fill in the constructor so it THROWS when
// min > max, and fill in `withMin` so it returns a NEW ImmutableRange,
// leaving this one untouched.
export class ImmutableRange {
  readonly min: number;
  readonly max: number;

  constructor(min: number, max: number) {
    // TODO: throw a RangeError if min > max, then assign both fields
    this.min = min;
    this.max = max;
  }

  contains(n: number): boolean {
    return n >= this.min && n <= this.max;
  }

  /** Returns a NEW range with a different min. This one is untouched. */
  withMin(min: number): ImmutableRange {
    // TODO: return new ImmutableRange(min, this.max)
    return this;
  }
}


// ---------------------------------------------------------------------------
// Exercise 9 — Visibility, all four kinds, on one object
// ---------------------------------------------------------------------------

// TODO: Exercise 9  [lecture Part 1, Part 4]
// Run the file and look at what `Object.keys` sees. `protected` and `private`
// are BOTH present on the object; only `#` is missing.
export class Visibility {
  public open = "public";
  protected inherited = "protected";
  private confined = "private";
  #sealed = "sealed";

  keys(): string[] {
    return Object.keys(this);
  }
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

console.log("--- Exercise 1: a public field cannot hold an invariant ---");
const leaky = new LeakyAccount();
leaky.balance = 1_000_000;
console.log("after a direct assignment ->", leaky.balance, "(no deposit ever ran)");

console.log("\n--- Exercise 2: the encapsulated version ---");
const account = new Account();
account.deposit(100);
account.withdraw(30);
console.log("balance  ->", account.balance);
console.log("statement->", JSON.stringify(account.statement));
try {
  account.withdraw(1_000);
} catch (error) {
  console.log("overdraw ->", error instanceof Error ? error.message : error);
}
try {
  account.deposit(-5);
} catch (error) {
  console.log("bad input->", error instanceof Error ? error.message : error);
}
console.log("balance after the failures ->", account.balance);

console.log("\n--- Exercise 3/4: private vs # ---");
const secret = new Secret();
console.log("secret.reveal()  ->", secret.reveal());
console.log("bypass.value     ->", bypass.value, "(cast past `private`)");
console.log("vault.combination->", vault.combination, "(only route to a # field)");
console.log("Object.keys(new Secret()) ->", Object.keys(secret), "— `private` is visible");
console.log("Object.keys(vault)        ->", Object.keys(vault), "— `#` is not");

console.log("\n--- Exercise 5/6: chaining ---");
const sql = new QueryBuilder().select("id", "name").from("users").where("age > 18").build();
console.log("built query ->", sql);
console.log("child chain ->", chained, " log ->", new Child().setA().setB().log);

console.log("\n--- Exercise 7/8: mutable vs immutable ---");
const mutable = new MutableRange(0, 10);
mutable.min = 100;
console.log("mutable after min = 100 ->", `[${mutable.min}, ${mutable.max}]`,
  " contains(5) ->", mutable.contains(5), "(an impossible range, and it lies)");

const immutable = new ImmutableRange(0, 10);
const shifted = immutable.withMin(5);
console.log("original ->", `[${immutable.min}, ${immutable.max}]`);
console.log("withMin(5) ->", `[${shifted.min}, ${shifted.max}]`, "— a new object");
console.log("the original is unchanged ->", immutable.min === 0);
try {
  new ImmutableRange(10, 0);
} catch (error) {
  console.log("new ImmutableRange(10, 0) ->", error instanceof Error ? error.message : error);
}

console.log("\n--- Exercise 9: what Object.keys sees ---");
const vis = new Visibility();
console.log("keys inside the class ->", vis.keys());
console.log("keys from outside     ->", Object.keys(vis));
console.log("open (public)      ->", vis.open);
