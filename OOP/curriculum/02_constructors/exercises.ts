// OOP Exercise 02: Constructors
// Run this file with: npm run ex OOP/curriculum/02_constructors/exercises.ts
// Typecheck with:    npm run check
//
// Lines that deliberately produce a COMPILE ERROR are commented out. Uncomment
// one, run `npm run check`, read the error, then comment it back.


// TODO: Exercise 1  [lecture Part 1]
// The long form: declare, receive, assign.
// Then uncomment `new Dog1()` at the bottom of this file and read the error —
// an incomplete Dog is now impossible to build.
export class Dog1 {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  describe(): string {
    return `${this.name} is ${this.age}`;
  }
}


// TODO: Exercise 2  [lecture Part 1]
// Delete (or comment out) the `this.age = age;` line in Dog2 below and run
// `npm run check`. Read TS2564 and put it back.
//
// YOUR ANSWER: what exactly is the compiler complaining about?
export class Dog2 {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}


// TODO: Exercise 3  [lecture Part 2]
// Rewrite Dog2 using PARAMETER PROPERTIES — the modifier on the parameter
// is the whole shorthand. The class body should end up empty.
export class Dog3 {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}


// TODO: Exercise 4  [lecture Part 2]
// `readonly id` is set from the constructor and can never change again.
// Uncomment the reassignment below and read the error.
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    private email: string,
    public nickname?: string,
  ) {}
}

const ada = new User("u1", "Ada", "ada@example.com");
// ada.id = "u2";


// TODO: Exercise 5  [lecture Part 3]
// Three overload SIGNATURES and one implementation BODY. Only the signatures
// are callable — the implementation signature is invisible to callers.
// Uncomment `new Point(1)` and `new Point("nope")` and compare the two errors.
export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number);
  constructor(coords: [number, number]);
  constructor(from: { x: number; y: number });
  constructor(a: number | [number, number] | { x: number; y: number }, b?: number) {
    if (typeof a === "number") {
      this.x = a;
      this.y = b ?? 0;
    } else if (Array.isArray(a)) {
      this.x = a[0];
      this.y = a[1];
    } else {
      this.x = a.x;
      this.y = a.y;
    }
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

// new Point(1);
// new Point("nope");


// TODO: Exercise 6  [lecture Part 4]
// A PRIVATE constructor and static factories. `new Account(...)` from outside
// this class is a compile error, so every Account came through a path the
// class controls. Uncomment the direct `new` below and read the error.
export class Account {
  private constructor(
    public readonly id: string,
    public readonly owner: string,
    public balance: number,
  ) {}

  static open(owner: string): Account {
    return new Account(`acc_${Math.random().toString(36).slice(2, 8)}`, owner, 0);
  }

  static fromJSON(raw: unknown): Account {
    if (typeof raw !== "object" || raw === null) {
      throw new Error("expected an object");
    }
    const data = raw as { id?: unknown; owner?: unknown; balance?: unknown };
    if (
      typeof data.id !== "string" ||
      typeof data.owner !== "string" ||
      typeof data.balance !== "number"
    ) {
      throw new Error("malformed account record");
    }
    return new Account(data.id, data.owner, data.balance);
  }
}

// new Account("a1", "Ada", 0);


// TODO: Exercise 7  [lecture Part 4]
// A constructor cannot be async. A static factory can.
// Fill in `Config.load` so it awaits the promise and returns a Config.
const fakeRead = async (): Promise<string> =>
  JSON.stringify({ port: 8080, host: "localhost" });

export class Config {
  private constructor(
    public readonly port: number,
    public readonly host: string,
  ) {}

  static async load(): Promise<Config> {
    const text = await fakeRead();
    const parsed = JSON.parse(text) as { port: number; host: string };
    // TODO: return a new Config built from `parsed`
    throw new Error("TODO: Config.load is not implemented yet");
  }
}


// TODO: Exercise 8  [lecture Part 5]
// Prove that a per-instance ARRAY field initialiser is safe — that unlike
// Python, each object gets its own array rather than sharing one.
// Run the file and read the output.
export class Basket {
  items: string[] = [];

  constructor(first: string) {
    this.items.push(first);
  }
}


// TODO: Exercise 9  [lecture Part 5]
// `this` as a return type, for method chaining. Each call returns the SAME
// object, so the chain keeps operating on one Counter.
export class Counter {
  count: number;

  constructor(start: number = 0) {
    this.count = start;
  }

  increment(): this {
    this.count += 1;
    return this;
  }
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

// new Dog1();

console.log("--- Exercise 1: a complete object, or none at all ---");
const rex = new Dog1("Rex", 3);
console.log(rex.describe());

console.log("\n--- Exercise 4: readonly and private ---");
console.log(ada.id, ada.name, ada.nickname ?? "(no nickname)");

console.log("\n--- Exercise 5: constructor overloads, one body ---");
console.log(new Point(1, 2).toString());
console.log(new Point([3, 4]).toString());
console.log(new Point({ x: 5, y: 6 }).toString());

console.log("\n--- Exercise 6: static factories with a private constructor ---");
const acc = Account.open("Ada");
console.log(acc.id, acc.owner, acc.balance);
const loaded = Account.fromJSON({ id: "acc_1", owner: "Grace", balance: 100 });
console.log(loaded.id, loaded.owner, loaded.balance);
try {
  Account.fromJSON({ id: "acc_1", owner: "Grace" });
} catch (error) {
  console.log("fromJSON rejected ->", error instanceof Error ? error.message : error);
}

console.log("\n--- Exercise 8: per-instance field initialisers are safe ---");
const basket1 = new Basket("apple");
const basket2 = new Basket("banana");
basket1.items.push("pear");
console.log("basket1 ->", basket1.items);   // ["apple", "pear"]
console.log("basket2 ->", basket2.items);   // ["banana"]  — NOT shared

console.log("\n--- Exercise 9: `this` as a return type ---");
const counter = new Counter();
counter.increment().increment().increment();
console.log("counter.count ->", counter.count);   // 3

void Config.load()
  .then((config) => {
    console.log("\n--- Exercise 7: an async static factory ---");
    console.log(config.host, config.port);
  })
  .catch((error: unknown) => {
    console.log("\n--- Exercise 7: not implemented yet ---");
    console.log(error instanceof Error ? error.message : error);
  });
