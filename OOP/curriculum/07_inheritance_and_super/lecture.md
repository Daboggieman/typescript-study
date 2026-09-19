# OOP 07: Inheritance and `super`

Inheritance is the most over-used tool in object-oriented programming, and the one most likely to be taught first. This lesson teaches it properly — including the parts that bite — and then [lesson 10](../10_composition_and_patterns/lecture.md) argues for using it less than you think.

Here is what you are actually doing when you write `extends`:

> **`extends` sets up a prototype chain.** The subclass's instances get their own fields, and everything the subclass does not define is looked up on the parent's prototype. There is no copying — it is a *lookup*.

---

## Part 0 — The Chain

```ts
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak(): string {
    return `${this.name} makes a sound`;
  }

  describe(): string {
    return `${this.name} says: ${this.speak()}`;
  }
}

class Dog extends Animal {
  fetch(): string {
    return `${this.name} fetches the ball`;
  }
}

const rex = new Dog("Rex");

rex.fetch();        // "Rex fetches the ball"   — on Dog.prototype
rex.speak();        // "Rex makes a sound"      — found on Animal.prototype
rex.describe();     // "Rex says: Rex makes a sound"
rex.name;           // "Rex"                    — an own field
```

Three lookups, three different places:

| Expression | Where it was found |
|---|---|
| `rex.name` | an **own** field on the object |
| `rex.fetch` | `Dog.prototype` |
| `rex.speak`, `rex.describe` | `Animal.prototype`, one hop up |

And the fact that matters more than any of them:

```ts
rex instanceof Dog;       // true
rex instanceof Animal;    // true  — a Dog IS an Animal
```

**A subclass instance is a member of both types.** That is the substitutability guarantee, and it is what makes polymorphism ([lesson 09](../09_polymorphism/lecture.md)) work: anywhere an `Animal` is expected, a `Dog` is acceptable.

Nothing about the parent is copied. `rex` is one object with a short chain of prototypes behind it. Removing a method from `Animal.prototype` removes it from every dog at once.

---

## Part 1 — `super` and the Constructor Rule

This is the part that differs most from Python, and the part that causes the most confusing errors.

```ts
class Animal {
  constructor(public name: string) {
    console.log("Animal constructor");
  }
}

class Dog extends Animal {
  breed: string;

  constructor(name: string, breed: string) {
    super(name);            // MUST come first
    this.breed = breed;     // only legal after super()
    console.log("Dog constructor");
  }
}

new Dog("Rex", "corgi");
// Animal constructor
// Dog constructor
```

> ### The rule: you cannot touch `this` before `super()`.
>
> ```ts
> class Dog extends Animal {
>   constructor(name: string) {
>     console.log(this.name);   // ERROR TS17009 / TS2339:
>                               // 'super' must be called before accessing
>                               // 'this' or 'super' in a derived constructor
>     super(name);
>   }
> }
> ```

This is not TypeScript being fussy — it is a real JavaScript runtime rule, and the reason is structural. Before `super()` runs, **the object does not exist yet**. The base constructor is what creates it. TypeScript reports the mistake at compile time because the runtime error (`ReferenceError: Must call super constructor … before accessing 'this'`) is a confusing one to hit.

In Python, `super().__init__()` is a *convention* you can skip. In JavaScript, `super()` in a derived constructor is **mandatory if you write a constructor at all** — and if you *omit* the constructor entirely, the compiler inserts one that forwards all arguments to `super`:

```ts
class Dog extends Animal {
  fetch(): string { return "…"; }     // no constructor written
}

new Dog("Rex");                       // Animal's constructor ran with "Rex"
```

### When you must write the constructor

Only when the subclass has its own fields to set, or needs to do something before/after the base construction:

```ts
class Dog extends Animal {
  breed: string;

  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
}
```

### Parameter properties work too

```ts
class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);
  }
}
```

Note the asymmetry: `public breed` is declared in the parameter list (a parameter property, [lesson 02](../02_constructors/lecture.md)), but `name` is just a parameter that gets handed to `super`.

---

## Part 2 — Field Initialisation Order, and the Classic Bug

This is the most valuable section in the lesson. Read it twice.

```ts
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
    this.introduce();          // ⚠️ calling an OVERRIDABLE method from a constructor
  }

  introduce(): void {
    console.log(`I am ${this.name}`);
  }
}

class Dog extends Animal {
  breed = "unknown";           // a field INITIALISER

  constructor(name: string, breed: string) {
    super(name);               // <- Animal's constructor runs HERE, and calls introduce()
    // ...only NOW does `this.breed = "unknown"` run, and then...
    this.breed = breed;
  }

  override introduce(): void {
    console.log(`I am ${this.name}, a ${this.breed}`);
  }
}

new Dog("Rex", "corgi");
// I am Rex, a undefined      ← NOT "corgi", and not even "unknown"
```

Trace the order carefully, because this is the whole lesson:

1. `new Dog("Rex", "corgi")` allocates the object.
2. `super(name)` runs `Animal`'s constructor, which assigns `this.name = "Rex"` and **calls `this.introduce()`**.
3. `this.introduce` resolves to `Dog.prototype.introduce` — the *override*, because that is what is on the chain — even though we are only partway through constructing a `Dog`.
4. That override reads `this.breed` — and **the derived-class field initialisers have not run yet**. It is `undefined`.
5. `super()` returns. Now `breed = "unknown"` runs (the field initialiser), then `this.breed = breed` sets it to `"corgi"`.

The output is `I am Rex, a undefined`. No error. Nothing crashes. Just a wrong value, once, at construction time.

**The rule this teaches:**

> ### Never call an overridable method from a constructor.

It applies to every language with inheritance — Python has the identical bug — and JavaScript makes it worse because derived field initialisers run *after* `super()` returns, so there is a window where the object is half-built and the compiler cannot tell you.

The same trap in a simpler form, without a subclass at all:

```ts
class Config {
  settings = this.loadDefaults();     // runs before the constructor body
  // ...
}
```

A field initialiser cannot see any field declared *after* it, and cannot see anything the constructor assigns. When initialisers get complicated, move the work into the constructor body where the order is explicit.

### The fix

Make `introduce` a plain method that takes what it needs, or do not call it from the constructor:

```ts
class Animal {
  constructor(public name: string) {}     // no method call

  introduce(): void {
    console.log(`I am ${this.name}`);
  }
}

const rex = new Dog("Rex", "corgi");
rex.introduce();      // now everything is initialised
```

**If you find yourself wanting to call a method from a constructor, that is a signal the object should be built in two steps: a constructor that only assigns, and a separate `init()` or `setup()` the caller runs.**

---

## Part 3 — Overriding Methods and `override`

```ts
class Animal {
  speak(): string {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  override speak(): string {
    return `${this.name} barks`;
  }
}
```

The `override` keyword is **required in this repo** (`noImplicitOverride`, [CURRICULUM/21](../../CURRICULUM/21_tsconfig_deep_dive/lecture.md)) and it is worth having. It enforces two things:

```ts
class Dog extends Animal {
  override speek(): string {           // ERROR: no member named 'speek' to override
    return "woof";
  }
}
```

If you misspell the name of a method you meant to override, you get a **compile error** instead of a new method sitting quietly next to the old one, never called. That bug is genuinely hard to find by reading, and it costs one keyword to prevent.

```ts
class Dog extends Animal {
  speak(): string {                    // ERROR under noImplicitOverride:
    return "woof";                     //   'speak' overrides a member in the base class
  }                                    //   and must be marked with 'override'
}
```

### Calling the parent's version

```ts
class Dog extends Animal {
  override speak(): string {
    return `${super.speak()} — actually, woof`;
  }
}
```

`super.speak()` means "the implementation one step up the chain". It is not optional politeness: if you want the parent's behaviour *and* something extra, this is the only way to get it.

Common in `toString`, `equals`, lifecycle hooks (`componentDidMount`), and error classes:

```ts
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "ValidationError";       // otherwise it says "Error"
  }

  override toString(): string {
    return `${this.name} on '${this.field}': ${this.message}`;
  }
}

try {
  throw new ValidationError("must be positive", "amount");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.field);           // "amount" — narrowing, lesson 18
  }
}
```

> **The `Error` subclass detail:** setting `this.name` is not decoration. JavaScript's `Error.prototype.toString` uses `this.name`, and every subclass inherits `"Error"` unless you set it. Forgetting it makes your custom errors indistinguishable in logs.

---

## Part 4 — Rules for a Legal Override

A subclass member must be **compatible** with the one it replaces. TypeScript checks this, and the rules are worth knowing.

**Parameters must match.**

```ts
class Animal {
  move(distance: number): void {}
}

class Dog extends Animal {
  override move(distance: number, speed: number): void {}   // ERROR: not assignable
}
```

A `Dog` must be usable anywhere an `Animal` is, and an `Animal` caller only supplies one argument. Allowing the extra required parameter would break every existing call.

Adding an **optional** parameter is fine:

```ts
override move(distance: number, speed?: number): void {}    // OK
```

**The return type may narrow.**

```ts
class Animal {
  clone(): Animal { return new Animal(); }
}

class Dog extends Animal {
  override clone(): Dog { return new Dog(); }      // OK — a Dog IS an Animal
}
```

This is **covariance**, and it is what makes the `this` return type from [lesson 05](../05_methods_and_encapsulation/lecture.md) work. Narrowing is safe; widening is not:

```ts
override clone(): unknown { return {}; }           // ERROR — callers expect an Animal
```

**Visibility may widen, never narrow.**

```ts
class A { protected value = 1; }
class B extends A { override value = 1; }            // ERROR: must stay protected or widen
class C extends A { public override value = 1; }     // OK — wider access
```

Narrowing would let a subclass break the promise the base class made to its callers: code that was allowed to read `a.value` would fail on a `B`.

**`readonly` may be added, not removed.** A subclass cannot make a read-only member writable, because callers may be holding it as the base type.

---

## Part 5 — `super` in Static Members

`super` works in statics too, and it refers to the parent *class* rather than the parent prototype:

```ts
class Animal {
  static kingdom(): string {
    return "Animalia";
  }
}

class Dog extends Animal {
  static override kingdom(): string {
    return `${super.kingdom()} / Canis`;
  }
}

Dog.kingdom();      // "Animalia / Canis"
```

The same rules apply — `override` is required, and the signature must stay compatible.

---

## Part 6 — What `extends` Cannot Do

**No multiple inheritance.** A class extends exactly one class.

```ts
class Flying extends Bird, Swimmer {}     // SyntaxError — not a thing
```

When Python solves this with multiple inheritance, JavaScript solves it with **mixins**: functions that take a class and return a subclass.

```ts
type Constructor<T = object> = new (...args: any[]) => T;

function Swims<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    swim(): string {
      return "swimming";
    }
  };
}

function Flies<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    fly(): string {
      return "flying";
    }
  };
}

class Bird {}

class Duck extends Flies(Swims(Bird)) {}

const d = new Duck();
d.swim();      // "swimming"
d.fly();       // "flying"
```

This composes behaviours from several sources without a diamond hierarchy. It is worth knowing the pattern exists; you will see it in libraries far more often than in application code, and [lesson 10](../10_composition_and_patterns/lecture.md) covers when plain composition does the same job more simply.

**No `super` beyond one level.** `super.super.method()` does not exist. If you need it, the hierarchy is too deep.

**Deep hierarchies break.** Every level is a new place a method can be overridden, a new constructor that runs before yours, and a new thing to check when something behaves oddly. **Three levels is a reasonable ceiling**; beyond that, composition.

---

## Part 7 — The Liskov Trap

The formal name is the Liskov Substitution Principle: *a subclass must be usable anywhere its parent is, without surprising the caller.* The canonical violation is short and worth internalising.

```ts
class Rectangle {
  constructor(public width: number, public height: number) {}

  setWidth(w: number): void { this.width = w; }
  setHeight(h: number): void { this.height = h; }

  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  // A square must keep width === height, so both setters are overridden
  override setWidth(w: number): void {
    this.width = w;
    this.height = w;
  }

  override setHeight(h: number): void {
    this.width = h;
    this.height = h;
  }
}
```

Every signature matches. It compiles. And it breaks this caller:

```ts
function stretch(rect: Rectangle): number {
  rect.setWidth(5);
  rect.setHeight(4);
  return rect.area();      // any Rectangle: 20
}

stretch(new Rectangle(0, 0));    // 20
stretch(new Square(0, 0));       // 16  ← the surprise
```

`Square` satisfies the *types* and violates the *contract*. The lesson is not "avoid squares" — it is:

> **A subclass must honour everything its parent promised, not merely match its signatures.**
>
> The compiler checks signatures. It cannot check behaviour. That gap is where inheritance bugs live, and it is the strongest argument for keeping hierarchies shallow and using composition instead.

A related smell in the same family: a subclass whose method **throws** an error for an operation the parent supports. If `Penguin extends Bird` and `fly()` throws, then `Penguin` is not a `Bird` in any useful sense — the type says it is, and every caller that trusted the type is now broken.

---

## Part 8 — Predicting the Output

Take your time with the first one.

```ts
class Base {
  name: string;

  constructor(name: string) {
    this.name = name;        // assigned first, so this one is NOT the point
    this.greet();            // ← an overridable method called from a constructor
  }

  greet(): string {
    return `Base: ${this.name}`;
  }
}

class Derived extends Base {
  title = "Dr";              // a field initialiser — runs AFTER super() returns

  override greet(): string {
    return `${this.title} ${this.name}`;
  }
}

const d = new Derived("Ada");     // (1) what does the constructor print?
console.log(d.greet());           // (2) and what does this print?
```

And the shorter one:

```ts
class A {
  greet(): string { return "A"; }
}

class B extends A {
  override greet(): string { return `${super.greet()}B`; }
}

class C extends B {
  override greet(): string { return `${super.greet()}C`; }
}

console.log(new C().greet());
```

<details>
<summary>Answers</summary>

**First:** the constructor prints `undefined Ada`, and the later call prints `Dr Ada`.

Trace the construction:

1. `new Derived("Ada")` allocates the object. **No fields yet — `title` does not exist.**
2. `super("Ada")` runs `Base`'s constructor: `this.name = "Ada"`, then `this.greet()`.
3. `this.greet` resolves through the prototype chain to **`Derived.prototype.greet`** — the override — even though only `Base`'s half has run.
4. The override reads `this.title`. `Derived`'s field initialiser `title = "Dr"` **has not run yet**, because derived initialisers run *after* `super()` returns. So `this.title` is `undefined`.
5. `super()` returns, and now `title = "Dr"` runs.
6. `d.greet()` is a fresh call with everything in place, so it prints `Dr Ada`.

**The same method produced two different answers on the same object.** That is the whole problem: the object was observable, and overridable, while half-built. Nothing errored; one call simply saw a state that will never be visible again.

The rule: **never call an overridable method from a constructor.** If you need setup work, either do it lazily on first use, or have the caller call an explicit `init()` once construction is finished.

**Second:** `"ABC"`.

`super.greet()` is not "the base class's method" in the abstract — it is **one step up from wherever the method was found**. `C.prototype.greet` calls `super.greet()`, which finds `B.prototype.greet`; *that* one's `super.greet()` finds `A.prototype.greet`.

So the calls nest: `A` returns `"A"`, `B` appends `"B"`, `C` appends `"C"`. `super` is relative to the class the method is written in, and it follows the chain one level at a time.

This is how template-method hierarchies work — a base method that calls hooks subclasses fill in — and it is also how they become hard to follow, which is the case for keeping them short.

</details>

---

## Part 9 — Cheat Sheet Summary

```ts
class Animal {
  constructor(public name: string) {}

  speak(): string { return `${this.name} makes a sound`; }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);                     // FIRST — before any `this`
    // this.breed is assigned here for you, by the parameter property
  }

  override speak(): string {         // `override` is REQUIRED here
    return `${super.speak()} — woof`;
  }
}

const rex = new Dog("Rex", "corgi");
rex instanceof Dog;        // true
rex instanceof Animal;     // true
```

| Idea | One-line version |
|---|---|
| `extends` | Sets up a **prototype chain** — a lookup, not a copy |
| `super(args)` | Runs the parent constructor. **Mandatory** in a derived constructor, and must come first |
| No constructor written | The compiler inserts one forwarding all arguments to `super` |
| Touching `this` before `super()` | A compile error, because the object does not exist yet |
| `super.method()` | The implementation one step up — the class the method is written in, not the root |
| `override` | Required. Catches misspelled method names, which are otherwise silent |
| Parameters | Must stay compatible — optional additions only |
| Return type | May **narrow** (a `Dog` for an `Animal`) |
| Visibility | May **widen**, never narrow |
| `readonly` | May be added, not removed |
| Constructor + overridable method | **Never.** Derived field initialisers have not run yet |
| Multiple inheritance | Doesn't exist. Use mixins, or composition |
| Depth | Three levels is a reasonable ceiling |
| Liskov | A subclass must honour the parent's *behaviour*, not just its signatures |

---

## Self-Check

- [ ] Where do `rex.speak` and `rex.name` actually live?
- [ ] Why is `this.name` before `super(name)` an error rather than a warning?
- [ ] Walk through the Part 2 example and say exactly when `this.breed` is assigned.
- [ ] What does `override` protect you from?
- [ ] Can an override widen its return type? Narrow it? Widen a parameter? Narrow one?
- [ ] Write the Rectangle/Square example's bug in one sentence.
- [ ] Why is "the subclass throws where the parent succeeded" a design smell?

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Classes (`extends`, `super`, `override`)](https://www.typescriptlang.org/docs/handbook/2/classes.html#extends-clause)
- **Reference:** [MDN — `super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super)
- **Reference:** [MDN — Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) — the model behind `extends`
- **Reference:** [TSConfig — `noImplicitOverride`](https://www.typescriptlang.org/tsconfig#noImplicitOverride)
- **Article:** [Composition over Inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance)
- **Article:** [The Liskov Substitution Principle](https://web.archive.org/web/20151128004108/http://www.objectmentor.com/resources/articles/lsp.pdf) — the original, by Barbara Liskov and Jeannette Wing's formulation via Robert Martin
- **Python parallel:** [Python `super()`](https://docs.python.org/3/library/functions.html#super) — note MRO; JavaScript has a single chain with none of that complexity

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Build an `Animal`/`Dog` pair and show a `Dog` is `instanceof` both.
2. Write a derived constructor and prove `this` before `super()` is a compile error (uncomment the line).
3. Reproduce the field-initialisation trap from Part 2 and read the `undefined`.
4. Fix it by moving the method call out of the constructor.
5. Misspell an override and confirm the compile error names the attempt.
6. Chain `super.speak()` through three levels.
7. Add a required parameter to an override and read the error.
8. Give a subclass a `ValidationError`-style class and check `this.name`.
9. Write the Rectangle/Square pair and watch `stretch` return different answers.
