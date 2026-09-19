// OOP Exercise 10: Composition and Patterns
// Run this file with: npm run ex OOP/curriculum/10_composition_and_patterns/exercises.ts
// Typecheck with:    npm run check
//
// The capstone. Every exercise here is the same move: replace a hierarchy
// with a field, and replace a concrete dependency with an interface.
//
// Two "prove it does not compile" lines are COMMENTED OUT. Uncomment one,
// run `npm run check`, read the error, then comment it back.


// ---------------------------------------------------------------------------
// Exercise 1 — The same car, both ways
// ---------------------------------------------------------------------------

// TODO: Exercise 1  [lecture Part 1]
// Inheritance: a Car IS-A Engine-holder. Composition: a Car HAS-A Engine.
// Compare how you would change the engine in each.
export abstract class Motor {
  abstract start(): string;
}

export class Diesel extends Motor {
  override start(): string {
    return "diesel rumble";
  }
}

export class Electric extends Motor {
  override start(): string {
    return "silent hum";
  }
}

// The inheritance version.
export class InheritedCar extends Diesel {
  startCar(): string {
    return `car: ${this.start()}`;
  }
}

// The composition version. Note the field, and the delegation.
export class ComposedCar {
  constructor(private readonly motor: Motor) {}

  startCar(): string {
    return `car: ${this.motor.start()}`;      // DELEGATION
  }
}


// ---------------------------------------------------------------------------
// Exercise 2 — The Liskov violation, and the composed fix
// ---------------------------------------------------------------------------

// TODO: Exercise 2  [lecture Part 1]
// Every function that takes a `FlyingBird` may now explode at runtime, and
// the type system says nothing is wrong.
export abstract class FlyingBird {
  constructor(public readonly name: string) {}

  abstract fly(): string;
}

export class Sparrow extends FlyingBird {
  override fly(): string {
    return `${this.name} flaps`;
  }
}

export class Penguin extends FlyingBird {
  override fly(): string {
    throw new Error(`${this.name} cannot fly`);      // ← the violation
  }
}

// The composed version: capabilities are separate, and the types say so.
export interface CanFly {
  fly(): string;
}

export interface CanSwim {
  swim(): string;
}

export class ComposedPenguin {
  constructor(public readonly swim: CanSwim) {}
  // no `fly` member at all
}

export function takeOff(bird: CanFly): string {
  return bird.fly();
  // takeOff(new ComposedPenguin(...)) would be a COMPILE error — which is the point
}


// ---------------------------------------------------------------------------
// Exercise 3 — Shared code is a function, not a base class
// ---------------------------------------------------------------------------

// TODO: Exercise 3  [lecture Part 2]
// Two classes with nothing in common that both want the same helper. No base
// class, no coupling, and `formatMoney` is testable on its own.
export function formatMoney(cents: number, currency = "USD"): string {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export class Invoice {
  constructor(private readonly cents: number) {}

  label(): string {
    return formatMoney(this.cents);
  }
}

export class Refund {
  constructor(private readonly cents: number) {}

  label(): string {
    return formatMoney(this.cents, "EUR");
  }
}


// ---------------------------------------------------------------------------
// Exercise 4 — Dependency injection, and testing with object literals
// ---------------------------------------------------------------------------

// TODO: Exercise 4  [lecture Part 3]
// Fill in `register` and `lookup`. The two constructor parameters are the
// whole of dependency injection.
export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

export interface Storage {
  save(key: string, value: string): void;
  load(key: string): string | undefined;
}

export class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly storage: Storage,
  ) {}

  register(name: string): void {
    // TODO: save under the key "user", then log `registered ${name}`
  }

  lookup(): string | undefined {
    // TODO: load the "user" key
    return undefined;
  }
}


// ---------------------------------------------------------------------------
// Exercise 5 — The delegation bug
// ---------------------------------------------------------------------------

// TODO: Exercise 5  [lecture Part 4]
// `Tally` counts properly. `ForgotToDelegate` holds one and forgets to
// forward `increment` — so the numbers silently go stale.
export interface Counter {
  increment(): void;
  value(): number;
}

export class Tally implements Counter {
  #n = 0;

  increment(): void {
    this.#n += 1;
  }

  value(): number {
    return this.#n;
  }
}

export class ForgotToDelegate implements Counter {
  constructor(private readonly tally: Tally) {}

  increment(): void {
    // TODO: write `this.tally.increment();` and compare the output.
    // Leaving it empty is the bug this exercise is about.
  }

  value(): number {
    return this.tally.value();
  }
}


// ---------------------------------------------------------------------------
// Exercise 6 — A mixin
// ---------------------------------------------------------------------------

// TODO: Exercise 6  [lecture Part 5]
// `toJSON` added to any class, with no base class to inherit from.
export type Constructor<T = object> = new (...args: any[]) => T;

export function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    toJSON(): Record<string, unknown> {
      // Own enumerable properties only — which is exactly what JSON does.
      return Object.fromEntries(Object.entries(this));
    }
  };
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly total: number,
  ) {}
}

export class SerializableOrder extends Serializable(Order) {}
// SerializableOrder has `id`, `total`, AND `toJSON`.


// ---------------------------------------------------------------------------
// Exercise 7 — The Observer pattern
// ---------------------------------------------------------------------------

// TODO: Exercise 7  [lecture Part 6]
// `Events` is a MAP from event name to payload type, so both are checked.
// The store below uses `any` — deliberately, and only here: one collection
// holds handlers of several different types, and the public API around it is
// fully typed.
export class Emitter<Events extends Record<string, unknown>> {
  #handlers = new Map<string, Set<(payload: any) => void>>();

  on<K extends keyof Events & string>(
    event: K,
    handler: (payload: Events[K]) => void,
  ): () => void {
    let set = this.#handlers.get(event);
    if (!set) {
      set = new Set();
      this.#handlers.set(event, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void {
    const set = this.#handlers.get(event);
    if (!set) return;
    for (const handler of set) handler(payload);
  }
}

export type BusEvents = {
  saved: { id: string };
  failed: { reason: string };
};

// Uncomment, run `npm run check`, read the error, then comment it back.
// The event name is right; the PAYLOAD is not.
//
// new Emitter<BusEvents>().emit("saved", { reason: "x" });


// ---------------------------------------------------------------------------
// Exercise 8 — Repository, and a decorator over it
// ---------------------------------------------------------------------------

// TODO: Exercise 8  [lecture Part 6]
// The most valuable pattern in application code: business logic depends on
// the interface, production passes a database, tests pass this.
export interface Repository<T> {
  find(id: string): Promise<T | undefined>;
  save(item: T): Promise<void>;
  all(): Promise<T[]>;
}

export class InMemoryRepo<T extends { id: string }> implements Repository<T> {
  #items = new Map<string, T>();

  async find(id: string): Promise<T | undefined> {
    return this.#items.get(id);
  }

  async save(item: T): Promise<void> {
    this.#items.set(item.id, item);
  }

  async all(): Promise<T[]> {
    return [...this.#items.values()];
  }
}

// A decorator: it IS a Repository, and it HAS a Repository.
export class CountingRepo<T extends { id: string }> implements Repository<T> {
  #reads = 0;

  constructor(private readonly inner: Repository<T>) {}

  get reads(): number {
    return this.#reads;
  }

  async find(id: string): Promise<T | undefined> {
    this.#reads += 1;
    return this.inner.find(id);
  }

  async save(item: T): Promise<void> {
    return this.inner.save(item);
  }

  async all(): Promise<T[]> {
    return this.inner.all();
  }
}


// ---------------------------------------------------------------------------
// Exercise 9 — Two axes, one class
// ---------------------------------------------------------------------------

// TODO: Exercise 9  [lecture Part 7]
// Format and totals are independent choices. As a hierarchy this is four
// classes and grows as a product; as two interfaces it is one class and one
// extra parameter.
export interface Formatter {
  render(rows: string[][]): string;
}

export interface Totaller {
  apply(rows: string[][]): string[][];
}

export const csvFormatter: Formatter = {
  render: (rows) => rows.map((r) => r.join(",")).join("\n"),
};

export const htmlFormatter: Formatter = {
  render: (rows) =>
    `<table>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`,
};

export const noTotals: Totaller = {
  apply: (rows) => rows,
};

export const withTotals: Totaller = {
  apply: (rows) => {
    // TODO: return a new array with a `["TOTAL", <row count>]` row appended
    return rows;
  },
};

export class Report {
  constructor(
    private readonly rows: string[][],
    private readonly formatter: Formatter,
    private readonly totaller: Totaller,
  ) {}

  render(): string {
    return this.formatter.render(this.totaller.apply(this.rows));
  }
}


// ---------------------------------------------------------------------------
// Main block
// ---------------------------------------------------------------------------

const rows = [
  ["name", "qty"],
  ["widget", "3"],
  ["gadget", "7"],
];

console.log("--- Exercise 1: inheritance vs composition ---");
console.log("InheritedCar ->", new InheritedCar().startCar());
console.log("ComposedCar(Diesel)   ->", new ComposedCar(new Diesel()).startCar());
console.log("ComposedCar(Electric) ->", new ComposedCar(new Electric()).startCar());
console.log("the same class, two behaviours, one argument apart");

console.log("\n--- Exercise 2: the Liskov violation ---");
console.log("Sparrow ->", new Sparrow("Jack").fly());
try {
  console.log("Penguin ->", new Penguin("Pingu").fly());
} catch (error) {
  console.log("Penguin -> threw:", error instanceof Error ? error.message : error);
}
console.log("takeOff(new ComposedPenguin(...)) would not compile — the type tells the truth");

console.log("\n--- Exercise 3: a shared function, not a base class ---");
console.log("Invoice ->", new Invoice(1250).label());
console.log("Refund  ->", new Refund(1250).label());

console.log("\n--- Exercise 4: dependency injection ---");
const logLines: string[] = [];
const store = new Map<string, string>();

const service = new UserService(
  {
    info: (m) => logLines.push(`INFO ${m}`),
    error: (m) => logLines.push(`ERROR ${m}`),
  },
  {
    save: (k, v) => void store.set(k, v),
    load: (k) => store.get(k),
  },
);
service.register("Ada");
console.log("log   ->", logLines);
console.log("lookup ->", service.lookup());
console.log("both dependencies were plain object literals — no mocks, no framework");

console.log("\n--- Exercise 5: the delegation bug ---");
const forgot = new ForgotToDelegate(new Tally());
forgot.increment();
forgot.increment();
forgot.increment();
console.log("after three increments ->", forgot.value(), "← stale, because nothing was forwarded");
const tally = new Tally();
tally.increment();
tally.increment();
tally.increment();
console.log("the object it wraps       ->", tally.value());

console.log("\n--- Exercise 6: a mixin ---");
const order = new SerializableOrder("A-1", 1999);
console.log("order.id      ->", order.id);
console.log("order.total   ->", order.total);
console.log("order.toJSON()->", JSON.stringify(order.toJSON()));
console.log("order instanceof Order ->", order instanceof Order);

console.log("\n--- Exercise 7: the observer ---");
const bus = new Emitter<BusEvents>();
const seen: string[] = [];
const off = bus.on("saved", ({ id }) => seen.push(id));
bus.emit("saved", { id: "1" });
bus.emit("saved", { id: "2" });
off();
bus.emit("saved", { id: "3" });
console.log("handled ->", seen, "← the unsubscribe worked");

console.log("\n--- Exercise 8: repository and decorator ---");
const repo = new CountingRepo(new InMemoryRepo<{ id: string; name: string }>());
await repo.save({ id: "1", name: "Ada" });
await repo.save({ id: "2", name: "Grace" });
console.log("find('1') ->", JSON.stringify(await repo.find("1")));
console.log("all()     ->", JSON.stringify(await repo.all()));
console.log("reads     ->", repo.reads, "← the decorator counted them");

console.log("\n--- Exercise 9: two axes, one class ---");
console.log("csv  / no totals ->");
console.log(new Report(rows, csvFormatter, noTotals).render());
console.log("csv  / with totals ->");
console.log(new Report(rows, csvFormatter, withTotals).render());
console.log("html / no totals ->");
console.log(new Report(rows, htmlFormatter, noTotals).render());
console.log("two independent choices, one class, no class explosion");
