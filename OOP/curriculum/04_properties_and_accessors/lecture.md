# OOP 04: Properties and Accessors

A field is a slot that holds a value. An **accessor** is a slot that *looks* like it holds a value but actually runs code. That single difference is what lets a class enforce an invariant — a radius that cannot go negative, a temperature that stores one unit but reports two.

This is the JavaScript equivalent of Python's `@property`, and if you have used that, the idea transfers. The mechanics do not.

---

## Part 0 — The Problem With a Plain Field

```ts
class Circle {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}
```

Nothing here stops this:

```ts
const c = new Circle(5);
c.radius = -3;              // compiles. A circle with a negative radius.
console.log(c.area());      // 28.27…  — a positive area from an impossible circle
```

A negative radius is not an error the compiler can catch, because `-3` is a perfectly good `number`. The invariant — *a radius is non-negative* — lives in your head, not in the code.

There are two ways to enforce an invariant like that. **Validate at the boundary** (a constructor and every method that touches it) or **make the field impossible to set incorrectly**. The second is what accessors are for.

---

## Part 1 — `get` and `set`

An accessor is declared with the `get` or `set` keyword and looks like a property from the outside:

```ts
class Circle {
  private _radius: number;

  constructor(radius: number) {
    this._radius = radius;
  }

  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    if (value < 0) {
      throw new RangeError(`radius cannot be negative, got ${value}`);
    }
    this._radius = value;
  }

  get area(): number {
    return Math.PI * this._radius ** 2;
  }
}

const c = new Circle(5);

c.radius;            // 5        — calls the getter
c.radius = 10;       // fine     — calls the setter
c.radius = -3;       // throws RangeError
c.area;              // 314.15…  — a computed property, no parentheses
```

Read that from the outside and **nothing looks different from a plain field**. `c.radius` and `c.radius = 10` are ordinary property syntax. The class just decided to run code instead of reading a slot.

Four things to notice:

**The backing field is named `_radius`.** It has to be a different name, or the getter would call itself forever:

```ts
get radius(): number {
  return this.radius;      // RangeError: Maximum call stack size exceeded
}
```

That infinite recursion is the classic accessor bug. The underscore prefix is convention rather than enforcement — section 4 shows the enforced version.

**A getter takes no parameters and a setter takes exactly one.** That is not a style choice; the syntax allows nothing else. A "setter" that needs two values is a method, not an accessor.

**The return type of a setter is always `void`.** You cannot annotate it as anything else, because nothing can observe a return value from an assignment expression in a useful way.

**A getter called `area` has no parentheses.** `c.area`, not `c.area()`. This is the real ergonomic win: the class decides whether `area` is stored or computed, and callers do not need to know. **You can turn a field into an accessor later without changing a single call site** — which is exactly the kind of refactor that is painful in most languages.

---

## Part 2 — Accessor Pairs, and Read-Only

The two halves are independent. You can have either one alone.

```ts
class User {
  private _name = "unnamed";

  // get only — a READ-ONLY property
  get name(): string {
    return this._name;
  }

  // set only — a WRITE-ONLY property (rare, and usually a mistake)
  set password(value: string) {
    this._hashed = hash(value);
  }
}

const u = new User();
u.name;              // fine
u.name = "Ada";      // ERROR: Cannot assign to 'name' because it is a read-only property
```

> **A getter without a setter is the idiomatic way to express "read-only from outside".** It is stronger than `readonly`, because `readonly` only stops reassignment — the value is still whatever was put there. An accessor lets you compute it, validate it, or return a defensive copy.

Note the setter-only case: TypeScript will complain about assigning to a property that has no getter when you *read* it, and in practice write-only properties are a sign the design wants a method with a name (`setPassword(raw)`) rather than a property.

### Accessors on an interface

An interface can describe an accessor, and it looks exactly like a property:

```ts
interface HasArea {
  readonly area: number;
}

class Circle implements HasArea {
  get area(): number {
    return Math.PI * this._radius ** 2;
  }
  // ...
}
```

The `readonly` marks it as get-only. The implementing class is free to use an accessor or a plain field — the interface only says *what*, not *how*. That flexibility is deliberate: `HasArea` does not care whether you compute the area each time or cache it.

---

## Part 3 — Validation, and Where It Belongs

The setter is the natural home for validation, and it is worth being precise about what that buys.

```ts
class Temperature {
  private _celsius: number;

  constructor(celsius: number) {
    // Note: setting through the SETTER, not the backing field,
    // so the constructor enforces the same rule.
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
    return this._celsius * 9 / 5 + 32;
  }

  set fahrenheit(value: number) {
    this.celsius = (value - 32) * 5 / 9;      // delegating to the other setter
  }
}

const t = new Temperature(100);
t.fahrenheit;          // 212
t.fahrenheit = 32;     // sets celsius to 0
t.celsius;             // 0
t.celsius = -300;      // RangeError
```

Three things this demonstrates that a bare field cannot:

**Both entry points are validated, and they share one rule.** `t.fahrenheit = -500` goes through `set fahrenheit`, which converts and delegates to `set celsius`, so the absolute-zero check runs regardless of which unit was used. One rule, one place.

**The class presents two units and stores one.** `_celsius` is the source of truth; `fahrenheit` is a conversion in both directions. There is no way for the two to disagree, because there is only one number.

**The constructor sets through the setter**, so it cannot be a back door that skips validation:

```ts
// WRONG — the constructor bypasses the check
constructor(celsius: number) {
  this._celsius = celsius;      // new Temperature(-300) is now possible
}
```

That mistake is easy to make and worth watching for. **If a setter validates something, the constructor should assign through it, not around it.**

> **One TypeScript wrinkle when you do this.** `strictPropertyInitialization` ([lesson 02](../02_constructors/lecture.md)) follows *direct* assignments to `this._celsius` in the constructor — it does **not** follow a call to a setter. So a backing field assigned only via `this.celsius = ...` is still reported as "not definitely assigned". The fix is a harmless initialiser:
>
> ```ts
> private _celsius: number = 0;    // settles the compiler; the constructor overwrites it
> ```
>
> or the definite-assignment assertion `private _celsius!: number;`. The rule and the check are slightly out of step here, and now you know why.

**Prefer a check in the constructor to a check in the setter when the object is immutable.** If a temperature never changes after construction, a `readonly` field validated in the constructor is simpler than an accessor pair. Accessors earn their place when the value can change *and* the rule must hold every time.

---

## Part 4 — Truly Private State: `#`

The `_underscore` convention says "please do not touch". It does not stop anyone:

```ts
const c = new Circle(5);
c._radius = -3;          // compiles, because `_radius` is a normal field
```

`private` (lesson 05) fixes that at compile time. A **`#` field** fixes it at runtime as well:

```ts
class Circle {
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
}

const c = new Circle(5);
c.radius;          // 5 — through the accessor
c.#radius;         // SyntaxError — not even parseable from outside the class
```

`#` fields are **genuinely inaccessible** from outside the class body — the parser rejects the syntax, so there is no cast, no bracket access, and no reflection that gets around it. They are also invisible to `Object.keys`, to `JSON.stringify`, and to `for...in`, because they are not string-keyed properties at all.

| Mechanism | Enforced by | Visible to `Object.keys`? | Reachable from outside? |
|---|---|---|---|
| `_radius` | convention | yes | yes |
| `private radius` | the compiler | yes | not without a cast |
| `#radius` | the runtime | **no** | **no** |

Which to use:

- **`#` for state that must genuinely be hidden** — an invariant that only the class may hold.
- **`private` for "internal to this class"** — the common case. It is easier to debug, works with `JSON.stringify`, and the compile error is a better experience than a syntax error.
- **`_name` only when you cannot use either** — a plain object literal, or a class compiled to a target where `#` behaves differently.

Note that a `#` field cannot be a parameter property ([lesson 02](../02_constructors/lecture.md)) — `constructor(#radius: number)` is not valid. You write the field declaration separately.

---

## Part 5 — Computed Accessors and Caching

A getter runs every time it is read. That is usually what you want, and occasionally it is not:

```ts
class Report {
  private _rows: string[] = [];

  // Recomputes on every read
  get total(): number {
    return this._rows.length;
  }

  // Recomputes an expensive summary on every read — a problem at scale
  get summary(): string {
    return this._rows.map((r) => r.toUpperCase()).join("\n");
  }
}
```

`total` is O(1) and fine. `summary` allocates and joins the whole array on every single read, so a loop that reads `report.summary` a thousand times does a thousand full passes. The fix is to cache, and the tricky part is knowing when to invalidate:

```ts
class Report {
  #rows: string[] = [];
  #summaryCache: string | null = null;

  get summary(): string {
    if (this.#summaryCache === null) {
      this.#summaryCache = this.#rows.map((r) => r.toUpperCase()).join("\n");
    }
    return this.#summaryCache;
  }

  addRow(row: string): void {
    this.#rows.push(row);
    this.#summaryCache = null;      // invalidate
  }
}
```

Now it is fast — and every method that mutates `#rows` must remember to invalidate. **Forgetting one is a bug that produces stale data, which is worse than being slow.**

> **The honest advice: do not cache in a getter until you have measured a problem.** Invalidate-on-write bugs are subtle and the performance win is often imaginary. When the computation really is expensive and the data really is stable, an immutable class with a `readonly` field computed once in the constructor is simpler *and* faster than a cache:

```ts
class Report {
  readonly summary: string;

  constructor(private readonly rows: string[]) {
    this.summary = rows.map((r) => r.toUpperCase()).join("\n");    // computed once
  }
}
```

No cache, no invalidation, no staleness. **Prefer immutability to caching.** Reach for the invalidating cache when the data must change in place.

---

## Part 6 — Accessors vs Methods

Both run code when you use them. The choice is about what the thing *is*.

**Use a getter when it is a property of the object:**

```ts
circle.area;             // a fact about the circle
user.fullName;           // a fact about the user
cart.itemCount;          // a fact about the cart
```

**Use a method when it does something:**

```ts
cart.add(item);          // an action, with an argument
user.rename("Ada");      // an action, and the name says so
report.render();         // an action that produces output
```

Three tests that settle it:

| Test | Property | Method |
|---|---|---|
| Does it take arguments? | no | yes |
| Is it cheap and side-effect-free? | yes | usually |
| Would you say "the X's Y" or "X does Y"? | the first | the second |

The test that catches the mistake: **a getter must not have side effects.** This is the one rule that genuinely matters.

```ts
// WRONG — reading a property mutated the object
get nextId(): number {
  this._counter += 1;
  return this._counter;
}

obj.nextId;    // 1
obj.nextId;    // 2  — the same expression, a different answer. Debugging nightmare.
```

A read that changes state breaks every intuition a reader has, and it makes the object impossible to inspect (a debugger watching `obj.nextId` would mutate it). If it changes something, it is a method: `obj.takeNextId()`.

The other direction is less serious but still worth fixing: a `getArea()` method that takes no arguments and has no side effects should be a getter, so callers write `shape.area`. It costs nothing and reads better.

---

## Part 7 — Predicting the Output

Work these out first.

```ts
class Box {
  #value = 0;

  get value(): number {
    return this.#value;
  }

  set value(v: number) {
    this.#value = v < 0 ? 0 : v;
  }
}

const b = new Box();
b.value = -5;
console.log(b.value);

b.value = 7;
b.value = b.value - 10;
console.log(b.value);
```

And this one, which is the trap:

```ts
class Sneaky {
  private _count = 0;

  get count(): number {
    this._count += 1;
    return this._count;
  }
}

const s = new Sneaky();
console.log(s.count, s.count, s.count);
```

<details>
<summary>Answers</summary>

**First:** `0`, then `0`.
- `b.value = -5` runs the setter, which clamps to `0`. `b.value` reads `0`.
- `b.value = 7` sets `_value` to `7`.
- `b.value - 10` **reads first** — the getter returns `7` — so the setter receives `-3`, which clamps to `0`.
- `b.value` reads `0`.

The lesson: the clamping happens on every write, so the invariant holds at every moment the object is observable. There is no way to get a negative value in.

**Second:** `1 2 3`.

A getter with a side effect. Reading the same property three times in one expression produces three different values, and the object changed just by being looked at. Each read also invalidates any assumption a reader or a debugger made. This is the mistake the previous section warns about, and running it once is the fastest way to believe the warning.

</details>

---

## Part 8 — Cheat Sheet Summary

```ts
class Temperature {
  #celsius = 0;                                    // private backing field

  get celsius(): number { return this.#celsius; }  // read

  set celsius(value: number) {                     // write, with validation
    if (value < -273.15) throw new RangeError("below absolute zero");
    this.#celsius = value;
  }

  get fahrenheit(): number {                       // computed, get-only
    return this.#celsius * 9 / 5 + 32;
  }

  set fahrenheit(value: number) {                  // delegates to the other setter
    this.celsius = (value - 32) * 5 / 9;
  }
}

const t = new Temperature();
t.celsius;          // 0          — no parentheses
t.celsius = 100;    // validated
t.fahrenheit;       // 212        — computed on read
```

| Idea | One-line version |
|---|---|
| `get name()` | A property that runs code when read — no parentheses at the call site |
| `set name(v)` | A property that runs code when written — exactly one parameter |
| Backing field | Needs a different name (`_x` or `#x`) or the accessor recurses forever |
| Getter only | A read-only property, and stronger than `readonly` |
| Setter only | A write-only property — usually a sign you wanted a method |
| Validation | Belongs in the setter, **and the constructor must assign through it** |
| `#field` | Runtime-private. Not in `Object.keys`, not reachable at all |
| `private field` | Compile-time private. Easier to debug, and usually the right choice |
| Caching in a getter | Needs invalidation on every write. Prefer an immutable `readonly` field |
| Side effects in a getter | **Never.** A read must not change the object |

---

## Self-Check

- [ ] Why must the backing field be named differently from the accessor?
- [ ] What does a getter without a setter express, and why is it stronger than `readonly`?
- [ ] Why should the constructor assign through the setter rather than the backing field?
- [ ] What are the three visibility mechanisms, and what does `#` do that `private` does not?
- [ ] What is wrong with caching inside a getter?
- [ ] Give the test for "should this be a getter or a method", and the one rule that matters more than the test.

---

## 📚 Resources

- **Reference:** [MDN — `get`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
- **Reference:** [MDN — `set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)
- **Docs:** [TypeScript Handbook — Getters and Setters](https://www.typescriptlang.org/docs/handbook/2/classes.html#getters--setters)
- **Reference:** [MDN — Private class features (`#`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- **Reference:** [MDN — `Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) — what `get`/`set` desugar to
- **Python parallel:** [Python `@property`](https://docs.python.org/3/library/functions.html#property)

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write a `Circle` with a `_radius` backing field and a validating setter. Confirm `-3` throws.
2. Delete the setter and confirm the property becomes read-only.
3. Provoke the infinite-recursion bug: make the getter return `this.radius`.
4. Write a get-only `area` accessor and call it without parentheses.
5. Write a `Temperature` with two units and validate absolute zero through both.
6. Make the constructor assign directly to the backing field, and prove `-300` gets in.
7. Switch the backing field to `#` and try to reach it from outside.
8. Write a getter with a side effect and watch three reads produce three values.
