# OOP 01: Classes and Objects — A Manual Walkthrough

**Prerequisite:** functions, arrays, objects, and types from the root `CURRICULUM/`.
**By the end you will be able to:** explain what a class and an object actually *are*, create objects, give them data and behaviour, and say precisely what `this` means at the call site — no loose ends left for later lessons.

> **How to read this lesson.** Every code block is runnable. When you see a **State** table, it shows what actually exists in memory at that moment. When you see a **Predict** box, cover the output with your hand and guess before reading on. That guessing step is where the learning happens.

---

## Part 0 — The One Problem OOP Exists To Solve

Don't start with the definition. Start with the pain, because the definition only makes sense once you've felt it.

### 0.1 One dog is easy

```ts
let dogName = "Rex";
let dogAge = 3;
```

Fine. Nothing wrong here.

### 0.2 Three dogs start to hurt

```ts
const dog1Name = "Rex";
const dog1Age = 3;
const dog2Name = "Fido";
const dog2Age = 5;
const dog3Name = "Buddy";
const dog3Age = 2;
```

Six variables for three dogs. For thirty dogs you would need sixty. And notice the real damage: **nothing in the code says `dog1Name` and `dog1Age` belong together.** That pairing exists only in your head and in the naming convention. The computer sees six unrelated variables.

Now write a function that describes a dog:

```ts
function describe(name: string, age: number): void {
  console.log(`${name} is ${age} years old`);
}

describe(dog1Name, dog1Age);    // Rex is 3 years old
describe(dog2Age, dog2Name);    // 5 is Fido years old   <-- oops
```

The second call is a real bug, and *unlike Python* TypeScript catches it:

```text
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

That is a genuine win, and it is worth appreciating before moving on. But it only works because both parameters happen to have different types. Make them both `string` and the mistake goes straight through:

```ts
function label(first: string, second: string): void {
  console.log(`${first} / ${second}`);
}
label(dog2Age.toString(), dog2Name);     // "5 / Fido" — compiles, and is nonsense
```

**Even with a type system, the data has no glue.**

### 0.3 The object-literal attempt gets you halfway

You already know a fix for the glue problem:

```ts
const dog1 = { name: "Rex", age: 3 };

function describe(dog: { name: string; age: number }): void {
  console.log(`${dog.name} is ${dog.age} years old`);
}

describe(dog1);           // Rex is 3 years old
```

This is genuinely better, and for small scripts it is often the right answer. Name and age now travel together as one value, and `describe` takes one argument instead of two-in-the-right-order.

### 0.4 Where the object literal still fails

Three cracks show up as the program grows.

**Crack 1 — the shape is repeated at every use.** That `{ name: string; age: number }` annotation is now written in `describe`, in `feed`, in `vaccinate`, and in every function that touches a dog. Change the shape and you change it in fifteen places. (This is the crack TypeScript lets you patch with an `interface` — [CURRICULUM/17](../../CURRICULUM/17_interfaces_and_aliases/lecture.md) — and it is a real improvement. It is not the whole answer.)

**Crack 2 — the behaviour lives somewhere else.** `describe` is a loose function at module level. Six months later, `describe`, `feed`, `bark`, and `vaccinate` are scattered across three files, and nothing connects them to the thing they operate on. To find everything a dog can *do*, you have to grep.

**Crack 3 — nothing validates on creation.** An object literal is checked where it is *written*. A `dog` that arrives from `JSON.parse` is `any` and is checked nowhere. Nothing guarantees a dog that exists is a complete dog.

### 0.5 The insight

> **The core insight:** you want to say *once* what a dog is — what data it holds and what it can do — and then stamp out as many dogs as you like from that single description.

That single description is a **class**. Each stamped-out dog is an **object**. That is the whole idea. Everything else in this module is mechanics.

---

## Part 1 — Class = The Description, Object = The Thing

### 1.1 The two words, precisely

| Term | What it is | How many exist |
|---|---|---|
| **Class** | The description: what data this kind of thing holds, what it can do | One, written once |
| **Object** (or **instance**) | One actual thing built from that description, with its own data | As many as you create |

The cookie analogy: the class is the **cookie cutter**, each object is a **cookie**. You own one cutter and it makes any number of cookies. Crucially, the cutter is not a cookie — you can't eat it. In the same way, the class `Dog` is not a dog; it's the description of what dogs are.

### 1.2 Your first class

```ts
class Dog {}                 // an empty description for now

const rex = new Dog();       // <-- `new` BUILDS an object
```

Two things to notice about that last line:

- `Dog` (no `new`) is the class itself — the cutter.
- `new Dog()` **runs** the class and hands back a brand new object — a cookie.

```ts
console.log(Dog);        // [class Dog]
console.log(rex);        // Dog {}
```

> **`new` is not optional.** In Python, `Dog()` calls the class. In JavaScript, `Dog` is a function, and calling it without `new` either throws `TypeError: Class constructor Dog cannot be invoked without 'new'` or — worse, for old-style functions — silently does something strange. **Always write `new`.** If you forget it, the error message is unusually clear, which is a mercy.

### 1.3 Each object is genuinely separate

This is the point people most often take on faith without checking. Check it.

```ts
class Dog {}

const rex = new Dog();
const fido = new Dog();

console.log(rex === fido);    // false
console.log(rex === rex);     // true
```

**Predict first, then read:** why is `rex === fido` false when both objects are completely empty and therefore look identical?

Because for objects you write yourself, the default answer to "are these equal?" is *"only if they are literally the same object."* Two separate empty dogs are two different things, the same way two blank sheets of paper are two sheets, not one.

> **`===` versus Python's `is` and `==`.** JavaScript's `===` on objects means **"same object?"** — Python's `is`. There is no built-in "equal value?" for your own classes; `===` will not do it, and `Object.is()` will not either. If you want two different objects to compare equal by content, you write an `equals(other)` method yourself (lesson 10 covers the pattern, and CURRICULUM/09 shows the trap: `{ a: 1 } === { a: 1 }` is `false`).

### 1.4 Fields must be declared

Here is the first place TypeScript diverges sharply from Python, and it is a change for the better.

**In Python you bolt attributes on as you go:**

```python
rex = Dog()
rex.name = "Rex"       # fine — the object grows a slot
```

**In TypeScript that is a compile error:**

```ts
class Dog {}

const rex = new Dog();
rex.name = "Rex";
```

```text
error TS2339: Property 'name' does not exist on type 'Dog'.
```

An object's shape is fixed by its class. You cannot add a field from outside, because the type system needs to know every property an object has *before* the program runs.

So fields are **declared** in the class body:

```ts
class Dog {
  name: string = "unnamed";
  age: number = 0;
}

const rex = new Dog();
rex.name = "Rex";          // fine — `name` is declared
console.log(rex.name);     // Rex
```

That is **Crack 1 and Crack 3 from Part 0.4, both closed.** The shape is stated once, on the class, and every object is guaranteed to have it.

| Approach | Where the shape lives | Guaranteed complete? |
|---|---|---|
| Loose variables | nowhere | no |
| Object literal + inline type | repeated at every use | only where written |
| Interface + object literal | one place | only where written |
| **Class with declared fields** | **one place** | **yes, on every instance** |

### 1.5 Default values and definite assignment

Every field needs a value, or TypeScript complains:

```ts
class Dog {
  name: string;        // ERROR: Property 'name' has no initializer and is not
}                      // definitely assigned in the constructor.
```

The reason is `strictPropertyInitialization`, part of `strict` ([CURRICULUM/21](../../CURRICULUM/21_tsconfig_deep_dive/lecture.md)). The compiler is asking a fair question: *when someone writes `new Dog()`, what is `dog.name`?*

Two legitimate answers, and one bad one:

```ts
// 1. Give it a default
class A {
  name: string = "unnamed";
}

// 2. Assign it in the constructor — lesson 02
class B {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// 3. The definite assignment assertion — "trust me, it gets set"
class C {
  name!: string;       // the `!` silences the check. Use with care.
}
```

Option 3 is a promise you are making to the compiler, and — exactly like the non-null assertion ([CURRICULUM/16](../../CURRICULUM/16_type_annotations/lecture.md) section 4) — breaking it produces `undefined` at runtime with no warning. It exists for the case where a framework assigns the field for you. Prefer 1 or 2.

---

## Part 2 — Methods: Giving an Object Behaviour

A **method** is a function defined inside a class. It is the "what it can do" half of the description.

### 2.1 Your first method

```ts
class Dog {
  name = "unnamed";

  bark(): void {
    console.log("Woof!");
  }
}

const rex = new Dog();
rex.bark();        // Woof!
```

`bark` is written once, on the class, and every `Dog` object can call it.

### 2.2 What `this` is

> **`this` is the object the method was called on.**

That's the intent. When you write `rex.bark()`, the method body sees `this` as `rex`, so `this.name` reads `"Rex"`:

```ts
class Dog {
  name = "unnamed";

  bark(): void {
    console.log(`${this.name} says Woof!`);
  }
}

const rex = new Dog();
rex.name = "Rex";
const fido = new Dog();
fido.name = "Fido";

rex.bark();      // Rex says Woof!
fido.bark();     // Fido says Woof!
```

One method definition, two different outputs. The difference is entirely *which object arrived as `this`*:

| Call | `this` is bound to | `this.name` reads |
|---|---|---|
| `rex.bark()` | the `rex` object | `"Rex"` |
| `fido.bark()` | the `fido` object | `"Fido"` |

### 2.3 The equivalence that makes it click

In Python, `rex.bark()` and `Dog.bark(rex)` are the same thing, and that equivalence explains `self` completely.

In JavaScript they are **not the same thing**, and that difference is the whole subject of lesson 03:

```ts
rex.bark();               // this = rex          → "Rex says Woof!"
Dog.prototype.bark.call(rex);   // this = rex     → same result
Dog.prototype.bark();           // this = undefined → TypeError
```

There is no implicit "first argument becomes the receiver". The receiver is decided by the *call*, and `rex.bark()` is the syntax that sets it.

> **Note there is no `self` here at all.** You do not declare `this` as a parameter — it is provided by the language. Lesson 03 covers what happens when it is *not* provided, which is the trap.

### 2.4 Methods and arrow functions are different

```ts
class Dog {
  name = "Rex";

  // A method — `this` is decided by the call
  barkMethod(): string {
    return `${this.name} says Woof!`;
  }

  // An arrow property — `this` is captured where it is defined
  barkArrow = (): string => `${this.name} says Woof!`;
}
```

Both work when called as `rex.barkMethod()` and `rex.barkArrow()`. Only the arrow survives being handed to someone else:

```ts
const fn = rex.barkMethod;
fn();                    // TypeError: Cannot read properties of undefined

const fn2 = rex.barkArrow;
fn2();                   // Rex says Woof!   — the arrow kept its object
```

The cost: an arrow property is created fresh for every instance and lives on the instance, where a method lives once on the prototype. For a callback, that is a trade worth making. **Lesson 03 is entirely about when.**

---

## Part 3 — The Payoff, Demonstrated Rather Than Asserted

Let's be honest about the trade-off instead of just claiming OOP wins.

**At this size, the object literal is genuinely fine:**

```ts
const dog = { name: "Rex" };
const bark = (d: { name: string }) => console.log(`${d.name} says Woof!`);
```

Nobody should feel bad about that code. So what actually changes as things grow? Three concrete things.

**1. The description lives in one place.** Everything a dog is and does sits inside `class Dog { }`. To learn the full capability of a dog you read one block, rather than grepping for functions that happen to take a dog-shaped argument.

**2. Behaviour is attached to the data, so it can't be mismatched.** `rex.bark()` cannot possibly run against the wrong thing — you got `bark` *from* `rex`. Compare with `bark(someObject)`, which will cheerfully accept an object describing a *cat*, provided it happens to have a `name`.

**3. The shape is stated once and enforced everywhere.** Every `new Dog()` produces a complete dog. Compare with an object literal, where each one is checked only at the line it is written, and a `JSON.parse` result is checked nowhere at all.

Those are the real wins. Not "OOP is better," but: *one home for the description, behaviour welded to its data, and fewer ways to hold it wrong.*

---

## Part 4 — You've Been Using Objects All Along

This isn't a paradigm you opt into. JavaScript is already built this way:

```ts
console.log(typeof "hi");        // "string"    — but…
console.log("hi".toUpperCase()); // HI          — …it has methods
console.log([3, 1, 2].sort());   // [1, 2, 3]
console.log((5).toFixed(2));     // "5.00"
```

Strings, numbers, and arrays are all objects with methods — which is why `"hi".toUpperCase()` works. That is the same mechanism as `rex.bark()`: a method defined once on a class, called through a value.

One difference worth naming. In Python, `type(x)` returns the class, and `int`, `str`, and `list` are classes you can subclass. In JavaScript, primitives are **not** objects and `typeof` reports `"string"` rather than `"object"` — the methods you call on a string are borrowed from the `String` wrapper on the fly. It works identically at the call site and behaves differently in the corner cases, which is why `new String("hi")` is a trap you should never step in.

```ts
typeof "hi";             // "string"
typeof new String("hi"); // "object"  — a wrapper object, and it is not equal to "hi"
"hi" === new String("hi");   // false
```

Never write `new String(...)`, `new Number(...)`, or `new Boolean(...)`. Use the primitive.

---

## Part 5 — Predict, Then Run

Write your predicted output next to each one *before* running it. Getting a prediction wrong is the fastest way to find the gap in your model.

1. ```ts
   class Cat {}
   const a = new Cat();
   const b = a;              // note: no second `new Cat()`
   console.log(a === b);
   ```
   *(Think carefully — this one is not `false`. Why not?)*

2. ```ts
   class Cat {}
   const a = new Cat();
   a.name = "Tom";
   ```
   *(What error, and does it happen at compile time or at runtime?)*

3. ```ts
   class Cat {
     name = "Tom";
     speak(): void {
       console.log(`${this.name} says Meow`);
     }
   }
   const c = new Cat();
   c.speak();
   ```

4. ```ts
   class Cat {
     name = "Tom";
     speak(): void {
       console.log(`${this.name} says Meow`);
     }
   }
   const c = new Cat();
   const fn = c.speak;
   fn();
   ```
   *(Which line does the error blame — the call, or the `this.name` inside the method? And why here, when call 3 worked?)*

<details>
<summary>Answers (open only after committing to a prediction)</summary>

1. `true`. `const b = a` copies the *reference*, not the object — both names point at one single cat. Only `new Cat()` creates a new object.
2. `error TS2339: Property 'name' does not exist on type 'Cat'` — at **compile time**, in your editor, before anything runs. This is the difference from Python's `AttributeError`, which would only appear when the line executed.
3. `Tom says Meow`. `this` is `c`, supplied by the dot.
4. `TypeError: Cannot read properties of undefined (reading 'name')`, and the traceback blames the line **inside** `speak` — because `fn()` was called with no receiver, so `this` is `undefined`. Call 3 worked because `c.speak()` supplied the receiver. **This is the whole subject of lesson 03.**

</details>

---

## Part 6 — Cheat Sheet Summary

```ts
class Dog {
  name = "unnamed";              // a field: declared, with a default

  bark(): void {                 // a method; `this` = the object it's called on
    console.log(`${this.name} says Woof!`);
  }

  barkArrow = (): string => `${this.name} says Woof!`;   // keeps its `this`
}

const rex = new Dog();           // `new` builds an object   <- not optional
rex.name = "Rex";                // fine — `name` is declared on the class
rex.bark();                      // the dot sets `this` to rex
```

| Idea | One-line version |
|---|---|
| **Class** | The single description of what a kind of thing holds and does |
| **Object / instance** | One actual thing built from that description, with its own data |
| `Dog` vs `new Dog()` | The description vs a new thing built from it |
| **Field** | Data declared on the class; reach it with a dot |
| **Method** | A function defined in the class, called on an object |
| `this` | The object the method was called on — decided by the **call**, not the definition |
| `===` on objects | "same object?" — Python's `is`. There is no built-in value equality |
| Fields must be | **declared**, or `strictPropertyInitialization` complains |
| `!` on a field | "trust me, it gets assigned" — a compile-time promise, unchecked |

**Still open after this lesson:** nothing about `this` at the call site, and one real gap — a field with a default is fine, but a field that *must* be supplied per object has no way to demand it yet. That is precisely what lesson 02 (constructors) solves.

---

## Self-Check

You've got this lesson if you can answer these without scrolling up:

- [ ] What's the difference between `Dog` and `new Dog()`, and what happens if you forget `new`?
- [ ] Why is `rex === fido` false for two empty objects?
- [ ] Why can't you write `rex.name = "Rex"` on a class that doesn't declare `name`?
- [ ] What are the two legitimate ways to satisfy `strictPropertyInitialization`?
- [ ] What exactly is `this`, and who supplies it?
- [ ] Why does `const fn = rex.bark; fn();` fail when `rex.bark()` works?

---

## 📚 Resources

- **Docs:** [MDN — Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- **Docs:** [TypeScript Handbook — Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- **Reference:** [MDN — `new` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)
- **Article:** [MDN — Object prototypes](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes) — what a method actually lives on
- **Python parallel:** [Python Classes/Objects](https://www.w3schools.com/python/python_classes.asp)

---

## 🧠 Try It Yourself

Now open `exercises.ts` in this folder and work through it. It follows the parts above in order:

1. Define an empty `Car` class, create two `Car` objects, and confirm `car1 === car2` is `false` (Part 1.3).
2. Try to attach a `make` property to a car from outside the class and read the compile error — this is the biggest difference from Python (Part 1.4).
3. Add declared fields with defaults, then set them and print a description (Part 1.4).
4. Add a `honk` method that prints `"Beep beep!"`, and call it (Part 2.1).
5. Add a `describe` method that uses `this`, and call it on two different cars (Part 2.2).
6. Write both a method and an arrow property, then hand each to a variable and call it — watch one work and one throw (Part 2.4).
7. Run `typeof` on a primitive and on `new String(...)`, and confirm they are not equal (Part 4).
