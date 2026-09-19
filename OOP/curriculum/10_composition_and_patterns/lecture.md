# OOP 10: Composition and Patterns

This is the last lesson in the module, and it is the one that changes how you design things.

You have spent nine lessons learning inheritance thoroughly. This lesson is about **when not to use it** — and about the alternative, which is simpler, more flexible, and correct far more often than the textbooks suggest.

---

## Part 1 — Two Ways to Reuse

**Inheritance** is an *is-a* relationship. `Dog extends Animal` says a dog **is an** animal.

**Composition** is a *has-a* relationship. `Car` holds an `Engine` — a car **has an** engine.

Both let you reuse code. They are not interchangeable, and the difference shows up when requirements change.

```ts
// INHERITANCE — Car IS-A Vehicle
abstract class Vehicle {
  abstract move(): string;
}

class Car extends Vehicle {
  override move(): string { return "drives"; }
}

// COMPOSITION — Car HAS-A Engine
class Engine {
  start(): string { return "vroom"; }
}

class Car2 {
  private readonly engine = new Engine();

  start(): string {
    return this.engine.start();      // DELEGATION
  }
}
```

The second one has a name for that inner call: **delegation**. `Car2.start()` forwards to `this.engine.start()`. That one line is the whole mechanism.

### Why composition wins more often than you would expect

**Inheritance is a one-time decision that is hard to revisit.** `class Car extends Vehicle` is baked in. If a `Motorcycle` should also be a `Car` in some respect, or if `Vehicle` gains an abstract method, you are editing the hierarchy.

**Composition is a list of parts you can change.** Swap `new Engine()` for an injected one and you can test with a fake. Add a `has-a` for something new without touching anything else.

**And the killer: inheritance forces an *all-or-nothing* relationship.** `Penguin extends Bird` inherits `fly()`, and it cannot legitimately have it. Composition says what a penguin *has* — `beak`, `wings`, `swimBladder` — and each capability is separate.

Here is that case, side by side:

```ts
// INHERITANCE — the problem case
abstract class Bird {
  abstract fly(): string;
}

class Penguin extends Bird {
  override fly(): string {
    throw new Error("penguins do not fly");    // ← the Liskov violation
  }
}
```

Every function that takes a `Bird` and calls `fly()` now has a landmine in it, and the type system says everything is fine. Compare:

```ts
// COMPOSITION — capabilities are optional, and the types say so
interface CanFly { fly(): string }
interface CanSwim { swim(): string }

class Penguin {
  constructor(public readonly swim: CanSwim) {}
  // no `fly` at all
}

class Sparrow {
  constructor(public readonly fly: CanFly) {}
}

function takeOff(bird: CanFly): string {
  return bird.fly();          // only accepts things that CAN fly
}
```

`takeOff(penguin)` is now a **compile error**, which is what you wanted. The type carries the truth.

---

## Part 2 — The Rule, Stated Honestly

The slogan is "favour composition over inheritance" and it is usually presented as a law. The useful version is narrower:

> **Use inheritance when the subclass genuinely is a more specific version of the base and will obey every rule the base states. Use composition otherwise — and otherwise is most of the time.**

The test, in three questions:

1. **Is every subclass a true member of the supertype?** If you cannot say "an X is a Y" out loud without hedging, the relationship is not there.
2. **Will every subclass honour the parent's contract, not just its signatures?** [Lesson 07](../07_inheritance_and_super/lecture.md)'s Liskov section. If any subclass throws or returns a sentinel for something the parent supports, no.
3. **Is the hierarchy going to stay shallow?** Beyond two or three levels, both problems above compound, and the code gets hard to follow.

Three yeses: use inheritance, and use it well — the template method from [lesson 08](../08_abstract_classes_and_interfaces/lecture.md) is a genuinely excellent use of it.

Any no: compose.

**And a fourth signal that settles it:** if what you really want is to **share code**, that is not inheritance's job at all. Inheritance expresses a *type relationship*. When two classes want the same helper, a shared function or a plain module does the job with no coupling:

```ts
// Two unrelated classes that both want the same logic
function formatMoney(cents: number, currency = "USD"): string {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

class Invoice {
  constructor(private readonly cents: number) {}
  label(): string { return formatMoney(this.cents); }
}

class Refund {
  constructor(private readonly cents: number) {}
  label(): string { return formatMoney(this.cents, "EUR"); }
}
```

No base class, no coupling, and `formatMoney` is testable on its own. **Reaching for inheritance to share a function is the single most common design mistake in this area.**

---

## Part 3 — Composition in TypeScript: It Is Just Fields

Composition has no syntax of its own. It is fields holding objects, and interfaces describing what those objects must look like.

```ts
interface Logger {
  info(message: string): void;
  error(message: string): void;
}

interface Storage {
  save(key: string, value: string): void;
  load(key: string): string | undefined;
}

class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly storage: Storage,
  ) {}

  register(name: string): void {
    this.storage.save("user", name);
    this.logger.info(`registered ${name}`);
  }

  lookup(): string | undefined {
    return this.storage.load("user");
  }
}
```

Notice what this buys, because it is a lot:

**`UserService` knows nothing about files, databases, or consoles.** It knows two interfaces. Any implementation works, including one written later by someone else.

**Testing needs no framework.** Pass object literals:

```ts
const lines: string[] = [];

const service = new UserService(
  {
    info: (m) => lines.push(`INFO ${m}`),
    error: (m) => lines.push(`ERROR ${m}`),
  },
  {
    save: () => {},
    load: () => undefined,
  },
);

service.register("Ada");
console.log(lines);      // ["INFO registered Ada"]
```

No mocks, no `jest.mock`, no subclass of a `FakeLogger`. **Because the dependency is an interface and TypeScript checks structurally, an object literal is a valid implementation.** That is the composition payoff in one example.

**This is dependency injection**, and it needs no framework either. It is a constructor parameter list. Frameworks exist for wiring large graphs; the concept is this.

> **A note on `private readonly logger: Logger`.** That is a parameter property ([lesson 02](../02_constructors/lecture.md)) — it declares the field, the parameter, and the assignment in one line. With composition-heavy code you will write this a lot.

---

## Part 4 — Delegation, and the Trap of Forgetting It

Composition works because you forward. Forgetting to is the characteristic bug.

```ts
interface Counter {
  increment(): void;
  value(): number;
}

class Tally implements Counter {
  #n = 0;

  increment(): void { this.#n += 1; }
  value(): number { return this.#n; }
}

class Survey implements Counter {
  constructor(private readonly tally: Tally) {}

  increment(): void { this.tally.increment(); }    // delegate
  value(): number { return this.tally.value(); }   // delegate
}
```

If you forget one of those bodies and write `increment(): void {}`, the object silently reports stale numbers. **Delegation is boilerplate, and boilerplate is where mistakes live.** Two ways to reduce it:

**Forward a whole object rather than re-exposing each method.** If the caller can hold the inner object directly, do not wrap it:

```ts
class Survey {
  constructor(public readonly tally: Tally) {}
}

new Survey(new Tally()).tally.increment();
```

That is less encapsulation and less code, and often exactly right.

**Let the interface describe the shape, not the class.** Nothing stops you exposing the composed object as a property of an interface type.

---

## Part 5 — Mixins: Reuse Without a Hierarchy

Sometimes you genuinely want to add a *capability* to several unrelated classes. JavaScript's answer is a **mixin** — a function taking a class and returning a subclass.

```ts
type Constructor<T = object> = new (...args: any[]) => T;

function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    toJSON(): object {
      return { ...this };          // shallow, and good enough for a demo
    }
  };
}

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    readonly createdAt = new Date();
  };
}

class Order {
  constructor(public readonly id: string) {}
}

class TrackedOrder extends Timestamped(Serializable(Order)) {}

const o = new TrackedOrder("A-1");
o.toJSON();          // works
o.createdAt;         // works
o.id;                // still there
```

Three capabilities, one class, no diamond hierarchy, and `Order` was never modified. This is how several well-known libraries compose behaviour, and it is the closest JavaScript gets to Python's multiple inheritance.

### The caveats

**TypeScript makes you write the type plumbing.** Note the generic signatures: each mixin must preserve the base's type. It is more ceremony than the runtime cost justifies in small cases.

**`instanceof Order` still works** (`TrackedOrder` extends it), but `o instanceof Serializable` does not — there is no such value.

**Mixins make the type of a thing harder to read.** A stack trace involving four nested mixins is not pleasant.

> **When a single boolean-shaped capability would do, use a field instead.** `new TrackedOrder(...)` and `{ order: new Order(...), createdAt: new Date() }` often carry the same information with far less machinery. Reach for a mixin when the capability must be *on the object itself* — usually because an external API requires it.

---

## Part 6 — The Patterns Worth Knowing

Nineteen of the classic twenty-three design patterns are workarounds for missing language features — most of them for missing first-class functions. JavaScript has first-class functions, so they collapse. What survives is short.

### Strategy — a function-valued field

Covered in [lesson 09](../09_polymorphism/lecture.md). `constructor(private readonly shipping: (kg: number) => number)`. The `Strategy` interface, the context class, and the factory all disappear.

### Factory — a static method

Covered in [lesson 06](../06_static_members/lecture.md). `static create(...)`, `static fromJSON(...)`, `static async load(...)`. Worth it whenever construction is more than assignment.

### Repository — separate the data access shape from the storage

```ts
interface Repository<T> {
  find(id: string): Promise<T | undefined>;
  save(item: T): Promise<void>;
  all(): Promise<T[]>;
}

class InMemoryRepo<T extends { id: string }> implements Repository<T> {
  #items = new Map<string, T>();

  async find(id: string): Promise<T | undefined> { return this.#items.get(id); }
  async save(item: T): Promise<void> { this.#items.set(item.id, item); }
  async all(): Promise<T[]> { return [...this.#items.values()]; }
}
```

Business logic takes a `Repository<User>`; production passes a database-backed implementation, and tests pass the in-memory one. **This is the single most valuable pattern in application code**, and it is nothing more than an interface plus dependency injection.

### Observer — a collection of callbacks

The class version has a `Subject`, an `Observer` interface, and `attach`/`detach`/`notify`. The JavaScript version is a map of sets:

```ts
class Emitter<Events extends Record<string, unknown>> {
  // Every handler is stored as `(payload: any) => void`, because one
  // collection holds handlers for several different event types.
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
    return () => set.delete(handler);        // unsubscribe
  }

  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void {
    const set = this.#handlers.get(event);
    if (!set) return;
    for (const handler of set) handler(payload);
  }
}

const bus = new Emitter<{ saved: { id: string }; failed: { reason: string } }>();

const off = bus.on("saved", ({ id }) => console.log(`saved ${id}`));
bus.emit("saved", { id: "1" });         // "saved 1"
bus.emit("saved", { reason: "x" });     // ERROR — wrong payload shape
off();
```

That is `EventEmitter`, `addEventListener`, and every pub/sub library. The generic parameter is the interesting part: **`Events` is a map from event name to payload type**, so both the name and the payload are checked at every call site.

> **About that `any`, and when it is the right tool.** The private store holds handlers for several different event types, so its value type has to be *one* thing — and there is no single type that is correct for all of them. `any` is the honest answer here, and it is contained: the **public API is fully typed**, and `any` appears in exactly two places, both private.
>
> This is the distinction worth carrying away. `any` in a public signature is a hole in your type safety that callers fall through. `any` inside a single implementation detail, with a fully-typed boundary around it, is a deliberate escape hatch — and generic containers will always need one somewhere. **Keep it small, keep it private, and comment it.**

### Adapter — wrap an incompatible interface

```ts
interface PaymentGateway {
  charge(cents: number): Promise<{ ok: boolean }>;
}

// A third-party SDK that you cannot change
class LegacyStripeSDK {
  makePayment(dollars: number, callback: (status: string) => void): void {
    callback("ok");
  }
}

class StripeAdapter implements PaymentGateway {
  constructor(private readonly sdk: LegacyStripeSDK) {}

  charge(cents: number): Promise<{ ok: boolean }> {
    return new Promise((resolve) => {
      this.sdk.makePayment(cents / 100, (status) => resolve({ ok: status === "ok" }));
    });
  }
}
```

Now the legacy SDK satisfies your interface, and everything else in the codebase keeps talking to `PaymentGateway`. **This is the pattern you reach for when you cannot change the thing on the other side** — third-party code, a legacy module, a test double.

### Decorator — wrap and add behaviour

```ts
class LoggingRepo<T extends { id: string }> implements Repository<T> {
  constructor(
    private readonly inner: Repository<T>,
    private readonly logger: { info(m: string): void },
  ) {}

  async find(id: string): Promise<T | undefined> {
    this.logger.info(`find ${id}`);
    return this.inner.find(id);
  }

  async save(item: T): Promise<void> {
    this.logger.info(`save ${item.id}`);
    return this.inner.save(item);
  }

  async all(): Promise<T[]> { return this.inner.all(); }
}
```

It **is a** `Repository` and it **has a** `Repository`. Caching, logging, retrying, and metrics all look like this. (Unrelated to the `@decorator` syntax, which is a different feature.)

### Pattern summary

| Pattern | In TypeScript it is |
|---|---|
| Strategy | A function-valued field |
| Factory | `static create()` |
| Repository | An interface + dependency injection |
| Observer | A `Set` of callbacks |
| Adapter | A class implementing your interface by wrapping theirs |
| Decorator | A class that implements an interface and holds one |
| Command | A closure |
| Template Method | An abstract class with abstract hooks ([lesson 08](../08_abstract_classes_and_interfaces/lecture.md)) |
| Singleton | A module-level `const` — usually ([quest](../../quest/questions/03_hard/oop_singleton_pattern.md)) |

---

## Part 7 — A Worked Refactor

Inheritance first, then the composed version. This is the shape of the change you will make most often.

**Before:**

```ts
abstract class Report {
  abstract rows(): string[][];

  render(): string {
    return this.rows().map((r) => r.join(",")).join("\n");
  }

  save(): void {
    // ...
  }
}

class CsvReport extends Report { override rows() { /* ... */ } }
class HtmlReport extends Report { override rows() { /* ... */ } }
class CsvReportWithTotals extends CsvReport { /* ... */ }
class HtmlReportWithTotals extends HtmlReport { /* ... */ }
// four classes for two independent choices — and it doubles again with the next one
```

Two axes of variation — **format** and **totals** — modelled as a class hierarchy. That is a cartesian product, and it grows as the product of the choices. This is called the **combinatorial explosion problem**, and inheritance cannot avoid it.

**After:**

```ts
interface Formatter {
  render(rows: string[][]): string;
}

interface Totaller {
  apply(rows: string[][]): string[][];
}

const csv: Formatter = {
  render: (rows) => rows.map((r) => r.join(",")).join("\n"),
};

const html: Formatter = {
  render: (rows) => `<table>${rows.map((r) =>
    `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`,
};

const noTotals: Totaller = { apply: (rows) => rows };

const withTotals: Totaller = {
  apply: (rows) => [...rows, ["TOTAL", String(rows.length)]],
};

class Report {
  constructor(
    private readonly source: () => Promise<string[][]>,
    private readonly formatter: Formatter,
    private readonly totaller: Totaller,
  ) {}

  async render(): Promise<string> {
    return this.formatter.render(this.totaller.apply(await this.source()));
  }
}

new Report(fetchRows, csv, noTotals);
new Report(fetchRows, csv, withTotals);
new Report(fetchRows, html, withTotals);
```

**One class, four combinations, and adding a third axis is one more parameter** — not four more classes. The `Report` class also no longer needs to know about formats, totals, or where the rows come from: all three arrive as interfaces.

The one thing that got harder: `new Report(...)` takes three arguments, and the caller has to decide. That is a real cost, and it is why the composed version often wants a small factory to name the common combinations:

```ts
const csvWithTotals = (): Report => new Report(fetchRows, csv, withTotals);
```

---

## Part 8 — Predicting the Output

```ts
class Engine {
  start(): string { return "engine"; }
}

class Car {
  constructor(private readonly engine: Engine) {}

  start(): string { return `car: ${this.engine.start()}`; }
}

class TurboEngine extends Engine {
  override start(): string { return "turbo"; }
}

const a = new Car(new Engine());
const b = new Car(new TurboEngine());

console.log(a.start());
console.log(b.start());
console.log(a.start());
```

And:

```ts
interface Greeter { greet(): string }

class Formal implements Greeter {
  greet(): string { return "Good evening"; }
}

function welcome(g: Greeter): string {
  return `${g.greet()}, and welcome.`;
}

console.log(welcome(new Formal()));
console.log(welcome({ greet: () => "yo" }));
```

<details>
<summary>Answers</summary>

**First:** `car: engine`, `car: turbo`, `car: engine`.

The interesting part is the third line. `a` was constructed with a plain `Engine`, and passing a `TurboEngine` to `b` changed **nothing about `a`**. In the inheritance version — `class Car extends Engine` with `Car` calling `super.start()` — changing the base's behaviour would have changed every car ever made, including ones created before the change if the prototype were patched.

**Composition gives each object its own copy of the relationship.** `b` holds a `TurboEngine`; `a` holds an `Engine`. They are independent, permanently.

That is also the testability property from Part 3: swap the engine in a test and nothing else moves.

**Second:** `Good evening, and welcome.` then `yo, and welcome.`

`Formal` explicitly implements `Greeter`; the object literal never heard of it and satisfies it anyway, because TypeScript is structural. `welcome` takes a `Greeter` and cannot tell the difference — nor should it.

This is the composition payoff distilled: **the parameter type is an interface, so anything with the right shape works.** That includes a real class, a plain object, and a test double you write inline in a single line.

</details>

---

## Part 9 — Cheat Sheet Summary

```ts
// COMPOSE — the default
interface Logger { info(m: string): void }

class Service {
  constructor(
    private readonly logger: Logger,     // HAS-A, injected
    private readonly repo: Repository,
  ) {}

  run(): void {
    this.logger.info("running");          // DELEGATION
    this.repo.save(/* ... */);
  }
}

new Service(console, new InMemoryRepo());          // production
new Service({ info: () => {} }, new InMemoryRepo());   // test — an object literal

// INHERIT — when the is-a is real, the contract is honoured, and it stays shallow
abstract class Shape {
  abstract area(): number;
  describe(): string { return `${this.area()}`; }   // template method
}
```

| Idea | One-line version |
|---|---|
| Inheritance | **is-a**. `Dog extends Animal` |
| Composition | **has-a**. `Car` holds an `Engine` |
| Delegation | `this.engine.start()` — the one line that makes composition work |
| Favour composition when | You want to share **code**, not express a type relationship |
| Use inheritance when | The is-a is real, every contract is honoured, and it stays shallow (≤3) |
| The killer case | `Penguin extends Bird` — a subclass forced to throw |
| Dependency injection | A constructor parameter list. No framework needed |
| Testing | Pass a **plain object literal** — structural typing makes it valid |
| Mixins | `class X extends Timestamped(Serializable(Base))` — capability without hierarchy |
| Strategy | A function-valued field |
| Repository | An interface + injection. The most valuable pattern in app code |
| Observer | A `Set` of callbacks, generic over an event map |
| Adapter | Implement your interface by wrapping theirs |
| Decorator | Implements the interface **and** holds one |
| Singleton | Usually a module-level `const` |
| The refactor to know | Cartesian class explosion → one class + parameterised interfaces |

---

## Self-Check

- [ ] Give the is-a / has-a distinction with an example of each.
- [ ] What is delegation, and what is the characteristic bug of composition?
- [ ] State the three questions that decide inheritance versus composition.
- [ ] Why is "pass an object literal" a complete testing strategy here?
- [ ] Write the mixin signature for adding a capability `T` to any class.
- [ ] Which classic pattern collapses into a function-valued field, and why?
- [ ] Explain the combinatorial explosion in Part 7 and how composition removes it.

---

## 📚 Resources

- **Book:** [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns) — the original 23, worth reading with "how much of this is a missing language feature?" in mind
- **Book:** [Refactoring, 2nd ed.](https://martinfowler.com/books/refactoring.html) — Martin Fowler. Chapter 7 has the "Replace Inheritance with Delegation" refactor in Part 7's spirit
- **Article:** [Composition over Inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance)
- **Article:** [Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) — the official TypeScript treatment
- **Article:** [Dependency Injection is not a Framework](https://martinfowler.com/articles/injection.html) — Martin Fowler
- **Article:** [The Expression Problem](https://en.wikipedia.org/wiki/Expression_problem) — the trade-off table from lesson 09, formalised
- **Python parallel:** [Python mixins and MRO](https://docs.python.org/3/howto/mro.html) — Python's multiple inheritance does what JavaScript needs nested mixin functions for

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Build a `Car` by inheritance and by composition, and change the engine in each.
2. Write the `Penguin extends Bird` violation, then the composed version that refuses it.
3. Extract a shared helper into a function instead of a base class.
4. Write a `UserService` taking two interface-typed constructor parameters, and test it with object literals.
5. Forget a delegation and watch the object report stale data.
6. Build a mixin that adds `toJSON` to any class.
7. Write the generic `Emitter<Events>` and try to emit a wrongly-typed payload.
8. Refactor a two-axis class hierarchy into one class plus two interfaces.
