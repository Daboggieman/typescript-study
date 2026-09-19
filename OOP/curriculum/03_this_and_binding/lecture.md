# OOP 03: `this` and Binding

This is the lesson that matters most in the whole module. If you have written Python, you have a mental model of `self` that is *almost* right for JavaScript, and the small part that is wrong will cause you more bugs than anything else on this list.

Here is the whole difference in one sentence:

> **In Python, a method's `self` is decided where the method is defined. In JavaScript, a method's `this` is decided where the method is called.**

Everything that follows is a consequence of that sentence.

---

## Part 0 — The Python Model, and Where It Breaks

In Python:

```python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print(f"{self.name} says Woof!")

rex = Dog("Rex")
rex.bark()                 # Rex says Woof!
```

`rex.bark()` and `Dog.bark(rex)` are the *same call*. The dot's job is to take the thing on its left and slide it in as the first argument. `self` is an ordinary parameter; it is named `self` only by convention. That is why the "takes 0 positional arguments but 1 was given" error makes sense — the `1` is the object.

There is no way to lose `self` in Python. Once `bark` is defined with `self` as its first parameter, it *always* has one. Even `fn = rex.bark; fn()` works.

**JavaScript is not built this way.** A function's `this` is not a parameter you declare. It is filled in by the *call expression*, and the call expression can be anything:

```ts
class Dog {
  name = "Rex";

  bark(): void {
    console.log(`${this.name} says Woof!`);
  }
}

const rex = new Dog();

rex.bark();                       // Rex says Woof!    — this = rex
const fn = rex.bark;
fn();                             // TypeError         — this = undefined
```

Same function, same object, same code. The second call fails. Nothing about the *function* changed; the *call* changed.

---

## Part 1 — How `this` Is Decided

There are exactly four rules, checked in this order. Learn the order and you can predict any call.

### Rule 1 — `new` binding

```ts
function Dog(this: any, name: string) { /* ... */ }
const rex = new (Dog as any)("Rex");     // this = the brand-new object
```

When a function is called with `new`, `this` is the freshly created object. This rule wins over everything else. It is why constructors work.

### Rule 2 — Explicit binding: `call`, `apply`, `bind`

```ts
function greet(this: { name: string }): string {
  return `Hello, ${this.name}`;
}

const ada = { name: "Ada" };

greet.call(ada);       // "Hello, Ada"           — this = ada, args given one by one
greet.apply(ada);      // "Hello, Ada"           — this = ada, args given as an array
const bound = greet.bind(ada);
bound();               // "Hello, Ada"           — this permanently fixed
```

`call` and `apply` differ only in how arguments are passed. `bind` returns a **new function** with `this` locked in, and that lock cannot be undone — not even by `.call`:

```ts
const stillAda = bound.call({ name: "Grace" });
stillAda;              // "Hello, Ada" — bind wins over call
```

> **`bind` is the pre-arrow-function fix for a lost `this`.** You will see it a lot in older code (`this.handleClick = this.handleClick.bind(this)` in a constructor). Modern code uses arrow functions instead, and section 4 explains why they are the better answer.

### Rule 3 — Implicit binding: called as a method

```ts
const obj = {
  name: "Ada",
  greet(): string {
    return `Hello, ${this.name}`;
  },
};

obj.greet();           // "Hello, Ada" — this = obj, because obj is left of the dot
```

**The object immediately left of the dot is `this`.** That is the whole rule, and it is why the following is a classic trap:

```ts
const obj = {
  name: "Ada",
  greet(): string {
    return `Hello, ${this.name}`;
  },
};

const fn = obj.greet;
fn();                  // this = undefined → TypeError

const nested = { name: "Grace", greet: obj.greet };
nested.greet();        // "Hello, Grace" — the dot decides, not where it was defined
```

Read that last line again. `obj.greet` was *defined* inside `obj`, and yet calling it as `nested.greet()` gives Grace. **`this` is not the object the function belongs to. It is the object the function was called on.** Those are different things, and confusing them is the single most common source of `this` bugs.

### Rule 4 — Default binding

```ts
function whoAmI(): void {
  console.log(this);
}

whoAmI();              // undefined  (in a module — "use strict" is on)
```

If none of the first three rules apply, `this` is `undefined`. In old non-strict scripts it was the global object (`window` / `globalThis`), which silently produced bugs instead of errors — one of the reasons `"use strict"` exists, and `alwaysStrict` ([CURRICULUM/21](../../CURRICULUM/21_tsconfig_deep_dive/lecture.md)) is on by default in this repo.

| Rule | Trigger | `this` is |
|---|---|---|
| 1. `new` | `new Fn()` | the new object |
| 2. explicit | `fn.call(x)`, `fn.apply(x)`, `fn.bind(x)` | `x` |
| 3. implicit | `obj.fn()` | `obj` |
| 4. default | `fn()` | `undefined` |

Arrows are a fifth case — they ignore all four.

---

## Part 2 — Losing `this`: The Four Ways

### 2.1 Passing a method as a callback

```ts
class Counter {
  count = 0;

  increment(): void {
    this.count += 1;
  }
}

const counter = new Counter();

setTimeout(counter.increment, 100);       // this = undefined → TypeError
[1, 2, 3].forEach(counter.increment);     // same problem
button.addEventListener("click", counter.increment);   // same
```

This is the bug. `counter.increment` on its own is *just a function* — the object is not attached to it. By the time `setTimeout` calls it, there is no dot and no object, so rule 4 applies and `this` is `undefined`.

It is worth being precise about why this is so easy to hit: **writing `counter.increment` looks like it carries `counter` with it. It does not.** The dot binds at the moment of the call, and passing the function somewhere else moves the call somewhere else.

### 2.2 Destructuring a method

```ts
const { increment } = counter;
increment();              // this = undefined
```

Same cause. Destructuring copies the function value, not the binding.

### 2.3 Nesting a function inside a method

```ts
const obj = {
  name: "Ada",
  greet(): void {
    function inner(): void {
      console.log(this.name);       // TypeError — `this` is NOT obj
    }
    inner();
  },
};
```

`inner()` is a plain call (rule 4), so `this` is `undefined` — even though it is written inside a method. **`this` is not inherited lexically by ordinary functions.** Only arrows change that.

### 2.4 An event handler in a class

```ts
class Toggler {
  open = false;

  toggle(): void {
    this.open = !this.open;
  }

  attach(button: { addEventListener(e: string, h: () => void): void }): void {
    button.addEventListener("click", this.toggle);    // BROKEN
  }
}
```

`this.toggle` is passed as a value; when the button fires, it calls `fn()` with no receiver. The fix is section 4.

---

## Part 3 — Arrow Functions Capture `this`

An arrow function **does not have its own `this`**. It uses the `this` of the scope where it was *written* — lexically, like a variable.

```ts
const obj = {
  name: "Ada",
  greet(): void {
    const inner = (): void => {
      console.log(this.name);       // "Ada" — the arrow inherited the method's this
    };
    inner();
  },
};

obj.greet();      // Ada
```

Compare with section 2.3, where the identical `function inner()` failed. **That is the whole difference between `function` and `() =>` regarding `this`.**

It also means an arrow is immune to rebinding:

```ts
const obj = {
  name: "Ada",
  greet: () => `Hello, ${(this as { name?: string })?.name}`,
};

obj.greet();                       // "Hello, undefined"
obj.greet.call({ name: "Grace" }); // still "Hello, undefined" — call cannot rebind an arrow
```

An arrow at the top level of an object literal has no enclosing method, so `this` is whatever surrounds the `{ }` — here, the module scope, where it is `undefined`. **Never use an arrow for a method you intend to call as `obj.method()`.**

---

## Part 4 — Arrow Class Properties: The Standard Fix

The idiomatic way to write a method that survives being passed around is a **class field holding an arrow**:

```ts
class Counter {
  count = 0;

  // A method — `this` comes from the call
  incrementMethod(): void {
    this.count += 1;
  }

  // An arrow property — `this` is captured at construction
  increment = (): void => {
    this.count += 1;
  };
}

const counter = new Counter();

setTimeout(counter.increment, 100);          // works — `this` was captured
setTimeout(counter.incrementMethod, 100);    // TypeError
```

The arrow is created inside the constructor, so its `this` is that instance, permanently. Hand it to `setTimeout`, `forEach`, an event listener, or a `Promise` — it keeps working.

### The cost, stated honestly

```ts
class A {
  method(): void {}              // lives ONCE, on A.prototype
  arrow = (): void => {};        // created for EVERY instance
}

const a1 = new A();
const a2 = new A();

a1.method === a2.method;    // true  — the same function object
a1.arrow === a2.arrow;      // false — two different functions
```

`method` exists once in memory and is shared by every instance through the prototype. `arrow` is created fresh each time. For a hundred instances with three arrow properties, that is three hundred extra functions.

In practice this is almost never the thing that makes your program slow, and correctness beats it every time. **The rule that holds up: use a plain method by default, and reach for an arrow property when the method is going to be passed somewhere as a callback.**

---

## Part 5 — The `this` Parameter (TypeScript Only)

TypeScript lets you declare `this` as a *fake first parameter*. It is erased at runtime and never passed, but it tells the compiler what `this` must be:

```ts
function greet(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}`;
}

const ada = { name: "Ada", greet };

ada.greet("Hello");            // "Hello, Ada"
greet.call(ada, "Hello");      // fine
greet("Hello");                // ERROR: The 'this' context of type 'void' is not
                               // assignable to method's 'this' of type '{ name: string; }'
```

That error is a **compile-time** version of a runtime crash. Without the annotation, `greet("Hello")` would compile and throw `TypeError: Cannot read properties of undefined (reading 'name')` when it ran. With it, your editor tells you before you run anything.

Every method in a class already has an implicit `this` of the class type, which is why you rarely write this annotation yourself. It earns its place in three situations:

```ts
// 1. A standalone helper that expects a particular shape of `this`
function describe(this: { name: string; age: number }): string {
  return `${this.name} (${this.age})`;
}

// 2. A callback whose `this` the caller controls
function handler(this: HTMLElement, event: Event): void {
  this.classList.add("clicked");
}

// 3. Pinning down `this` in a fluent/chainable API
```

You can also use it to **forbid** being called with a receiver:

```ts
function pure(this: void, n: number): number {
  return n * 2;
}

pure(2);            // fine
pure.call({}, 2);   // ERROR — `this: void` means it must never have one
```

`noImplicitThis` (part of `strict`) is what makes all of this enforceable; it reports any `this` the compiler cannot infer a type for.

---

## Part 6 — Fixing a Lost `this`: The Four Options

```ts
class Counter {
  count = 0;

  increment(): void {
    this.count += 1;
  }
}

const counter = new Counter();
```

**Option 1 — an arrow property (preferred).**

```ts
increment = (): void => {
  this.count += 1;
};
```

**Option 2 — `bind` in the constructor or at the call site.**

```ts
setTimeout(counter.increment.bind(counter), 100);
```

Works, and it is the only option when the method is defined outside your control. Noisy if you have to do it in several places.

**Option 3 — wrap it in an arrow at the call site.**

```ts
setTimeout(() => counter.increment(), 100);
```

Perfectly good, and often the clearest. The arrow is written where `counter` is in scope, so nothing can be lost. This is what you reach for when you cannot change the class.

**Option 4 — `call`/`apply` when you are invoking immediately.**

```ts
counter.increment.call(counter);
```

Verbose, and only useful when you must invoke now rather than pass a function along.

> **The choice, in one line:** an arrow property if you own the class; an arrow at the call site if you do not.

---

## Part 7 — Predicting the Output

Work these out before reading the answers. Each one is a rule from Part 1 or Part 3.

```ts
const obj = {
  name: "obj",
  arrow: () => this,
  method() {
    return this;
  },
};

console.log(obj.arrow());          // (1)
console.log(obj.method() === obj); // (2)
console.log(obj.method === obj.method); // (3)

const detached = obj.method;
try {
  console.log(detached());         // (4)
} catch (e) {
  console.log("threw");            // (4, other branch)
}

const rebound = { name: "other", method: obj.method };
console.log(rebound.method().name); // (5)
```

<details>
<summary>Answers</summary>

1. `undefined` — the arrow captured the enclosing module scope's `this`, which is `undefined`.
2. `true` — `obj.method()` applies implicit binding, so `this` is `obj`.
3. `true` — the method lives once on the prototype; both reads produce the same function object. (Contrast with an arrow property, where this would be `false`.)
4. **threw** — `detached()` has no receiver, so `this` is `undefined` under strict mode and `console.log(undefined)` would actually print `undefined`... but the property *access* inside is the problem only if you access one. Since `method` just returns `this`, it prints `undefined` rather than throwing. **This is the subtle one:** the call does not throw, it returns `undefined`, and the bug surfaces later when something reads a property off it. That delay is why lost-`this` bugs are so annoying.
5. `"other"` — implicit binding reads the object left of the dot, not the object the function was defined inside.

</details>

---

## Part 8 — Cheat Sheet Summary

```ts
class Counter {
  count = 0;

  incrementMethod(): void { this.count += 1; }      // this ← the call site
  increment = (): void => { this.count += 1; };     // this ← captured here
}

const c = new Counter();

c.incrementMethod();                    // fine
setTimeout(c.incrementMethod, 100);     // TypeError — `this` is undefined
setTimeout(c.increment, 100);           // fine
setTimeout(() => c.incrementMethod(), 100);  // fine
```

| Idea | One-line version |
|---|---|
| `this` | Decided by the **call**, not the definition |
| Rule 1 | `new Fn()` → the new object |
| Rule 2 | `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)` → `x` |
| Rule 3 | `obj.fn()` → `obj` (the object left of the dot) |
| Rule 4 | `fn()` → `undefined` under strict mode |
| Arrow functions | No `this` of their own — they inherit the enclosing one |
| `bind` | Returns a new function with `this` locked, and it cannot be overridden |
| Losing `this` | Passing a method as a callback, destructuring it, or nesting a `function` inside a method |
| The fix | An arrow class property (own the class), or an arrow at the call site |
| `this: T` parameter | TypeScript-only; makes a wrong `this` a compile error |
| Cost of arrows | One function per instance, instead of one per class |

---

## Self-Check

- [ ] State the four binding rules and their order.
- [ ] Why does `const f = obj.method; f();` fail when `obj.method()` works?
- [ ] Why does `{ method: obj.method }` produce an object where `this` is the *new* object?
- [ ] What is the difference between `function inner()` and `() => {}` inside a method, with respect to `this`?
- [ ] What does a `this: T` parameter buy you, given that it is erased at runtime?
- [ ] Give the four ways to fix a lost `this`, and say which you would pick for someone else's class.

---

## 📚 Resources

- **Reference:** [MDN — `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) — the canonical explanation, with every rule
- **Docs:** [TypeScript Handbook — `this` parameters](https://www.typescriptlang.org/docs/handbook/2/functions.html#this-parameters)
- **Reference:** [MDN — `Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
- **Article:** [MDN — Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#no_separate_this) — the "no separate this" section
- **Article:** [Gentle Explanation of `this` in JavaScript](https://dmitripavlutin.com/gentle-explanation-of-this-in-javascript/) — Dmitri Pavlutin; the best long-form treatment
- **Python parallel:** [Python `self` vs JavaScript `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#this_in_methods)

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Prove rule 3: one function, two different objects, two different results.
2. Lose `this` by copying a method to a variable, and catch the error.
3. Lose `this` again by passing a method to `setTimeout` and to `forEach`.
4. Lose `this` a third time with a nested `function` inside a method, then fix it with an arrow.
5. Write an arrow class property and show it survives all three of the above.
6. Prove `bind` cannot be overridden by a later `.call`.
7. Add a `this: { name: string }` parameter to a standalone function and read the compile error when it is called without a receiver.
8. Use `this: void` to forbid a receiver entirely.
