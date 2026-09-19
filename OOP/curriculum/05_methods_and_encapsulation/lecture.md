# OOP 05: Methods and Encapsulation

Lesson 04 hid a value behind an accessor. This lesson is about hiding *everything else* — and about the two pieces of technique that turn a class from a bag of fields into something with a usable surface: **visibility modifiers** and **method chaining**.

---

## Part 1 — The Access Modifiers

TypeScript has three, plus the runtime-private `#` from lesson 04.

```ts
class Account {
  public owner: string;              // anyone
  protected balance: number;         // this class and its subclasses
  private pin: string;               // this class only
  #auditLog: string[] = [];          // this class only, AND enforced at runtime

  constructor(owner: string, balance: number, pin: string) {
    this.owner = owner;
    this.balance = balance;
    this.pin = pin;
  }
}
```

| Modifier | Visible to | Enforced by | Default? |
|---|---|---|---|
| `public` | everyone | — | **yes** |
| `protected` | this class + subclasses | the compiler | no |
| `private` | this class only | the compiler | no |
| `#name` | this class only | **the runtime** | no |

`public` is the default, and writing it out is optional. Some teams write it for symmetry; the TypeScript style guide does not. Either is fine — be consistent.

```ts
class A {
  x = 1;                  // public
  public y = 2;           // exactly the same thing
}
```

### It is compile-time only

This is worth stating plainly, because it trips people coming from languages where `private` is a runtime guarantee:

```ts
class Secret {
  private value = 42;
}

const s = new Secret();
(s as unknown as { value: number }).value;    // 42. `private` did not stop you.
```

`private` and `protected` are **erased at runtime**. They stop *accidental* access and they make intent legible; they are not a security boundary. If you need the value genuinely unreachable, use `#`.

**Do not put secrets in a `private` field and call it protected.** Anything a browser or an attacker can run can read it.

---

## Part 2 — What Encapsulation Is Actually For

The word gets used loosely. Here is the version that earns its keep:

> **Encapsulation means the class's fields are not the class's interface.**

A class with public fields invites every caller to do this:

```ts
class Account {
  balance = 0;
}

const acc = new Account();
acc.balance = 1_000_000;        // no deposit, no validation, no audit
```

The field is public, so *anything* can set it to *anything*. Every rule about what a balance may be is now unenforceable, because there is a door around the side.

The fix is to make the data private and expose **intentions** instead:

```ts
class Account {
  #balance = 0;
  #history: string[] = [];

  get balance(): number {
    return this.#balance;
  }

  deposit(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RangeError(`deposit must be positive, got ${amount}`);
    }
    this.#balance += amount;
    this.#history.push(`+${amount}`);
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new RangeError(`withdrawal must be positive, got ${amount}`);
    }
    if (amount > this.#balance) {
      throw new RangeError(`insufficient funds: balance ${this.#balance}`);
    }
    this.#balance -= amount;
    this.#history.push(`-${amount}`);
  }

  get statement(): string {
    return this.#history.join(", ");
  }
}
```

Now look at what changed:

- `acc.deposit(50)` is the *only* way money goes in, so the rule runs **every time**. There is no path that skips it.
- The history is maintained automatically, because the only ways to change the balance also write the history. **The two cannot drift apart.**
- `balance` is get-only, so it is readable but not assignable.
- If the invariant changes tomorrow — a maximum balance, an overdraft — there is exactly one place to change it.

That last point is the real payoff. **Encapsulation is what makes an invariant cheap to maintain.** With a public field, every caller is a place that could break the rule. With a private field, there is one.

### Tell, don't ask

A design rule that falls out of the above:

```ts
// ASK — the caller decides, using the object's data
if (account.balance >= amount) {
  account.balance -= amount;
}

// TELL — the object decides, and you find out what happened
account.withdraw(amount);      // throws if it cannot
```

The "ask" version spreads the rule — *a withdrawal requires sufficient funds* — into every caller. The "tell" version keeps it in one method. When the rule changes (an overdraft facility, a fee), the ask version needs a change at every call site and the tell version needs a change in one method.

The tell version also handles the failure honestly, with an error, rather than leaving the caller to notice.

---

## Part 3 — Method Chaining

A method that returns `this` can be chained:

```ts
class QueryBuilder {
  private parts: string[] = [];

  select(...columns: string[]): this {
    this.parts.push(`SELECT ${columns.join(", ")}`);
    return this;
  }

  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }

  where(condition: string): this {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }

  build(): string {
    return this.parts.join(" ");
  }
}

const sql = new QueryBuilder()
  .select("id", "name")
  .from("users")
  .where("age > 18")
  .build();

console.log(sql);   // SELECT id, name FROM users WHERE age > 18
```

Two things make this work, and the return type is the interesting one.

### `this` as a return type, not the class name

```ts
class Base {
  setA(): this {
    return this;
  }
}

class Derived extends Base {
  setB(): this {
    return this;
  }
}

new Derived().setA().setB();      // fine — setA returned a Derived
```

If `setA` were typed `: Base`, then `new Derived().setA().setB()` would be an error, because `setA` would have erased the subclass. The `this` return type means **"the same type as the object this was called on"**, so chaining preserves the subclass. This is worth using whenever you write a chainable method on a class that might be extended.

### When chaining is a good idea

Chaining reads well when the calls **build up one thing** and the order matters: query builders, DOM/jQuery-style APIs, test assertion libraries, configuration objects.

It reads badly when the calls are **unrelated actions**:

```ts
// Do not do this
user.setName("Ada").sendEmail().logIn().save();
```

Those are four separate things that happen to be on the same object. Chaining them implies a sequence and a relationship that does not exist, and it makes the failure point ambiguous — if the third call throws, which operation failed?

**The test: if the methods share one piece of state being progressively refined, chain. If they are independent verbs, do not.**

### The cost

```ts
const sql = new QueryBuilder().select("id").from("users").build();
```

If `where` throws, the stack trace points at the whole expression rather than a line. Chaining trades a little debuggability for a lot of readability, and that trade is right for builders and wrong for business logic.

---

## Part 4 — Visibility in Practice

A few patterns that hold up, and the reasoning behind each.

**Private fields, public methods.** The default. Data is internal, behaviour is the interface.

**`protected` is a subclassing commitment.** Every `protected` member is part of the contract with *every future subclass*, and you cannot take it back without breaking them. Favour `private` unless a subclass genuinely needs the member — and if you find yourself needing many, that is a signal the design wants composition ([lesson 10](../10_composition_and_patterns/lecture.md)) rather than inheritance.

**`readonly` is not a visibility modifier.** It says "this is set once and never changes", which is orthogonal to who can see it:

```ts
class Id {
  constructor(
    public readonly value: string,     // everyone can read, nobody can reassign
    private readonly secret: string,   // only this class can read, nobody can reassign
  ) {}
}
```

**Prefer a getter to a public readonly field when the value is derived.** Lesson 04's point, restated: `get fullName()` is always consistent with the parts, where a public `fullName` field can drift.

**`static` members are public by default too** ([lesson 06](../06_static_members/lecture.md)), and private statics are common for internal counters and caches.

---

## Part 5 — Immutability, the Stronger Encapsulation

Encapsulation hides state. **Immutability removes it.** Where you have the choice, immutable is simpler, and this is worth taking seriously rather than treating as a style preference.

```ts
// Mutable — the object can be put into an invalid state at any moment
class Range {
  min: number;
  max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
}

const r = new Range(0, 10);
r.min = 100;              // now min > max, and nothing noticed
```

```ts
// Immutable — the invariant is checked once, and can never be broken
class Range {
  readonly min: number;
  readonly max: number;

  constructor(min: number, max: number) {
    if (min > max) {
      throw new RangeError(`min ${min} exceeds max ${max}`);
    }
    this.min = min;
    this.max = max;
  }

  /** Returns a NEW Range; this one is untouched. */
  withMin(min: number): Range {
    return new Range(min, this.max);
  }
}

const r = new Range(0, 10);
const bigger = r.withMin(5);      // r is still (0, 10)
```

Four things follow from making it immutable:

1. **The invariant is checked exactly once**, in the constructor. Every method after that can assume it holds, because nothing can change the fields.
2. **`withMin` cannot fail halfway.** It either returns a valid `Range` or throws — it never leaves a half-updated object behind.
3. **Sharing is safe.** You can pass `r` to anything and it cannot be modified by accident. This is the bug class that disappears entirely.
4. **Equality is meaningful.** Two ranges with the same bounds are indistinguishable, so comparing them by value is correct. With mutable objects it is not.

TypeScript's `readonly` is **shallow**, so a `readonly` array field still has mutable contents. For the real thing you need `readonly T[]` (which prevents `push`) and, for nested objects, `DeepReadonly` ([CURRICULUM/23](../../CURRICULUM/23_advanced_types/lecture.md) section 5) — or, more simply, keeping the structures flat.

> **The pattern to reach for:** make the fields `readonly`, validate in the constructor, and have every "modifying" method return a new instance. It is a small amount of extra code and it deletes a category of bug.

---

## Part 6 — Predicting the Output

```ts
class Counter {
  private count = 0;

  inc(): this {
    this.count += 1;
    return this;
  }

  get value(): number {
    return this.count;
  }
}

const base = new Counter();
base.inc().inc();
const other = base.inc();
console.log(other.value, base.value);
console.log(other === base);
```

And this one:

```ts
class Base {
  chain(): Base {
    return this;
  }
}

class Child extends Base {
  extra(): string {
    return "extra";
  }
}

// Does this compile, and why or why not?
new Child().chain().extra();
```

<details>
<summary>Answers</summary>

**First:** `3 3`, then `true`.

Chaining mutates, so there is only ever one object. `base.inc().inc()` increments twice; `base.inc()` increments a third time and `other` is the *same object* as `base`, not a copy. Both reads give `3`, and `other === base` is `true`.

That is the honest downside of chaining: it is mutation dressed up as a fluent expression. It reads like a pipeline of transformations and behaves like a sequence of mutations. Which is fine, as long as you know — and it is the reason builders are usually consumed immediately (`.build()`) rather than held.

**Second:** it does **not** compile:

```text
error TS2339: Property 'extra' does not exist on type 'Base'.
```

`chain()` returns `Base`, so the chain has been flattened to the supertype and `extra` is gone. Change the return type to `this` and it compiles — and *that* is exactly what the `this` return type is for.

This is the practical reason to write `: this` rather than `: ClassName` on any chainable method. It costs nothing and it keeps subclasses usable.

</details>

---

## Part 7 — Cheat Sheet Summary

```ts
class Account {
  #balance = 0;                          // runtime-private
  protected readonly owner: string;      // this class + subclasses, set once
  private pin: string;                   // this class only, compile-time
  static readonly RATE = 0.05;           // on the class, not an instance

  constructor(owner: string, pin: string) {
    this.owner = owner;
    this.pin = pin;
  }

  get balance(): number { return this.#balance; }   // read, but not write

  deposit(amount: number): this {                    // `this` keeps subclasses
    if (amount <= 0) throw new RangeError("must be positive");
    this.#balance += amount;
    return this;
  }
}
```

| Idea | One-line version |
|---|---|
| `public` | Default. Anyone. |
| `protected` | This class and subclasses — a commitment to every future subclass |
| `private` | This class only, enforced by the **compiler** |
| `#name` | This class only, enforced by the **runtime** |
| Modifiers are | compile-time only — erased, and not a security boundary |
| Encapsulation | The fields are not the interface; callers express **intentions** |
| Tell, don't ask | `account.withdraw(n)`, not `if (account.balance >= n) …` |
| `this` return type | The same type as the receiver — chaining survives subclassing |
| Chain when | The calls progressively build one thing |
| Do not chain when | The calls are unrelated actions on the same object |
| `readonly` | Set once, never reassigned. **Shallow**, so `readonly string[]` for arrays |
| Best encapsulation | Remove the state entirely: `readonly` fields + methods returning new instances |

---

## Self-Check

- [ ] Name the four visibility mechanisms and say what enforces each.
- [ ] Why is `private` not a security boundary?
- [ ] What does it mean that "the fields are not the interface"?
- [ ] Rewrite an ask-style balance check as a tell-style withdrawal.
- [ ] Why is `: this` better than `: ClassName` as a return type on a chainable method?
- [ ] Give the test for when chaining is appropriate.
- [ ] What four things does immutability buy over encapsulation alone?

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Member Visibility](https://www.typescriptlang.org/docs/handbook/2/classes.html#member-visibility)
- **Docs:** [TypeScript Handbook — `this` types](https://www.typescriptlang.org/docs/handbook/2/classes.html#this-types)
- **Reference:** [MDN — Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- **Article:** [Tell, Don't Ask](https://martinfowler.com/bliki/TellDontAsk.html) — Martin Fowler, on the design rule in Part 2
- **Article:** [Fluid Interfaces](https://martinfowler.com/bliki/FluentInterface.html) — Martin Fowler, on chaining, including its costs
- **Python parallel:** [Python name mangling and `_private`](https://docs.python.org/3/tutorial/classes.html#private-variables)

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write an `Account` with a `#balance`, a `deposit`, a `withdraw`, and a get-only `balance`.
2. Rewrite the same class with a public field and show that any caller can break the invariant.
3. Prove `private` is compile-time only by casting past it.
4. Try the same trick on a `#` field and confirm it cannot be done.
5. Build a `QueryBuilder` with three chainable methods and a `build`.
6. Change one method's return type from `this` to the class name and watch chaining break in a subclass.
7. Write a mutable `Range` and an immutable one, and show the mutable version reaching an invalid state.
