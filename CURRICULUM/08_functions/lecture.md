# Lecture 08: Functions

Functions are the unit of reuse. JavaScript's function syntax has accumulated several forms over thirty years, and TypeScript adds a type layer on top. This lecture covers the forms, the parameter features, and the one thing about functions in this language that has no Python equivalent at all: **`this`**.

---

## 1. Three Ways to Declare a Function

```ts
// 1. Function declaration — hoisted, can be called before its definition line
function add(a: number, b: number): number {
  return a + b;
}

// 2. Function expression — assigned to a variable, NOT hoisted
const subtract = function (a: number, b: number): number {
  return a - b;
};

// 3. Arrow function — the modern default
const multiply = (a: number, b: number): number => a * b;
```

### Which to use

| Form | Hoisted? | Has its own `this`? | Use when |
|---|---|---|---|
| `function` declaration | **Yes** | Yes | Top-level named utilities; when you need hoisting |
| Function expression | No | Yes | Rarely — arrow supersedes it |
| **Arrow** | No | **No** | **The default.** Callbacks especially |

Arrow functions are shorter, and their missing `this` is usually exactly what you want (section 6).

### Arrow syntax at a glance

```ts
const double = (n: number): number => n * 2;          // one expression, implicit return
const doubleBlock = (n: number): number => {          // braces need an explicit return
  return n * 2;
};
const noArgs = (): string => "hello";                 // no parameters
const oneArgUntyped = n => "x".repeat(n);             // parentheses optional for ONE untyped arg
const oneArgTyped = (n: number): number => n * 2;     // ...but required the moment you annotate

// Returning an object literal needs parentheses, or `{` reads as a block
const makePoint = (x: number, y: number) => ({ x, y });   // correct
const broken = (x: number, y: number) => { x, y };        // returns undefined!
```

That last one is a real trap: `=> { x, y }` parses as a function *body* containing the expression statement `x, y`, so it returns `undefined`. Wrap the object in parentheses.

---

## 2. Parameters

### Optional and default parameters

```ts
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

greet("Ada");                    // "Hello, Ada!"
greet("Ada", "Hi");              // "Hi, Ada!"
greet("Ada", undefined);         // "Hello, Ada!" — undefined triggers the default
greet();                         // error — `name` has no default
```

Optional parameters use `?` and must come **after** required ones:

```ts
function createUser(name: string, age?: number): string {
  return age === undefined ? name : `${name} (${age})`;
}
```

The difference between `age?: number` and `age: number | undefined`:

| Declaration | May be omitted | May be passed as `undefined` |
|---|---|---|
| `age?: number` | Yes | Yes |
| `age: number \| undefined` | **No** — must be supplied | Yes |

> **Default parameters in JavaScript are evaluated per call** — left to right, at call time. This is the exact opposite of Python's mutable-default trap, and it means the bug you had to learn to avoid in Python does not exist here:
>
> ```ts
> function addItem(item: string, list: string[] = []): string[] {   // SAFE. A new array each call.
>   list.push(item);
>   return list;
> }
> ```
> Every call gets a fresh array. Do not carry the `None`-default workaround over from Python; it is unnecessary and makes the signature worse.

### Rest parameters — Python's `*args`

```ts
function sum(...values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

sum(1, 2, 3);        // 6
sum();               // 0
sum(...[1, 2, 3]);   // 6 — spread a real array into the call
```

Rest must be **last**, there can be only one, and it collects everything into a real array. Python's `**kwargs` has no direct equivalent; for named optional arguments, take an options object (section 3).

### Destructured parameters

```ts
function drawRect({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return `rect at ${x},${y} sized ${width}x${height}`;
}

drawRect({ x: 0, y: 0, width: 10, height: 20 });
```

The type is written inline and it is long, which is exactly why interfaces exist — [17_interfaces_and_aliases](../17_interfaces_and_aliases/lecture.md) replaces that mouthful with a named type.

---

## 3. The Options Object Pattern

Python has keyword arguments, so a function with eight optional parameters is easy to call. JavaScript has no keyword arguments at all — position is the only thing that matters. The idiom that fills the gap is a single object parameter:

```ts
type RequestOptions = {
  method?: "GET" | "POST";
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
};

function request(url: string, options: RequestOptions = {}): string {
  const {
    method = "GET",
    timeout = 5000,
    retries = 3,
    headers = {},
  } = options;

  return `${method} ${url} (timeout ${timeout}, retries ${retries})`;
}

request("/api/users");                              // every default applies
request("/api/users", { method: "POST" });          // skip straight to what you need
request("/api/users", { retries: 0, timeout: 100 }); // order does not matter
```

Compare that last call with the positional alternative — `request(url, undefined, 100, 0)` — and the value of the pattern is obvious. **When a function takes more than about three parameters, or any of them are optional, use an options object.** You will see this everywhere in real code and in Node's own APIs.

---

## 4. Return Values

```ts
function divide(a: number, b: number): number { return a / b; }
function log(msg: string): void { console.log(msg); }        // returns nothing
function fail(msg: string): never { throw new Error(msg); }  // never returns
```

| Return type | Means |
|---|---|
| `number`, `string`, … | Returns that type |
| `void` | Returns nothing; you may ignore the result |
| `never` | **Cannot** return — always throws or loops forever |

`never` is more useful than it sounds. A function typed `never` tells the compiler that any code after the call is unreachable, which makes exhaustive switches and assertion helpers work ([23_advanced_types](../23_advanced_types/lecture.md)).

A function with no `return` statement returns `undefined`, and TypeScript infers `void`:

```ts
function log(msg: string) { console.log(msg); }    // inferred: void
```

Return type inference is generally reliable, but **annotating the return type of exported or non-trivial functions is worth the keystrokes**: it documents the contract and confines mistakes to the function body instead of leaking a wrong inferred type to every caller.

---

## 5. Functions Are Values

```ts
const add = (a: number, b: number) => a + b;

const operate = (fn: (a: number, b: number) => number, x: number, y: number) => fn(x, y);

operate(add, 2, 3);                        // 5
operate((a, b) => a * b, 2, 3);            // 6 — an inline callback
```

A function type is written `(param: T) => R`. That syntax — with the arrow — is how you type a callback parameter:

```ts
function applyTwice(fn: (n: number) => number, value: number): number {
  return fn(fn(value));
}

applyTwice(n => n + 1, 5);      // 7
```

This is what makes `map`, `filter`, and `reduce` work, and `fn: (n: number) => number` is the shape you will write constantly.

### TypeScript infers callback parameters for you

```ts
[1, 2, 3].map(n => n * 2);           // `n` is inferred as number — no annotation needed
[1, 2, 3].map((n: string) => n);     // error — the callback promised the wrong thing
```

That second line is worth pausing on: `Array<number>.map` expects `(n: number) => ...`, so annotating `n` as `string` is rejected. **Let TypeScript infer callback parameters** — explicit annotations there are usually noise, and they fight the surrounding types.

---

## 6. `this` — The Thing Python Does Not Have

This is the biggest conceptual gap. Python's methods take `self` as an explicit first parameter. JavaScript has an implicit `this` whose value depends on **how the function was called**, not where it was written.

```ts
const counter = {
  count: 0,
  increment() {
    this.count += 1;             // `this` is `counter` — because we called counter.increment()
    return this.count;
  },
};

counter.increment();             // 1  — works
```

Now break the call site and watch it fall apart:

```ts
const inc = counter.increment;   // the method, detached from its object

inc();                           // TypeError: Cannot read properties of undefined
```

`this` is `undefined` because the call had no receiver. This is the single most common JavaScript bug, and it is why arrow functions matter.

### Arrow functions capture `this` from the enclosing scope

```ts
const counter = {
  count: 0,
  start() {
    setInterval(() => {
      this.count += 1;           // ARROW — `this` is `counter`, inherited from start()
      console.log(this.count);
    }, 1000);

    setInterval(function () {
      this.count += 1;           // REGULAR — `this` is the timer object, NOT counter. Broken.
    }, 1000);
  },
};
```

> **The rule that covers 95% of cases: use arrow functions for callbacks, always.** An arrow function has no `this` of its own; it uses whatever `this` was in force where it was *defined*. For a callback inside a method, that is exactly what you want.

### The three ways to pin `this`

```ts
const inc = counter.increment.bind(counter);      // 1. bind — returns a new, pinned function
inc();                                             // 1

const counter2 = {
  count: 0,
  increment: () => { /* ... */ },                  // 2. define the method as an arrow — `this` is the MODULE, not counter2
};

class Counter {
  count = 0;
  increment = () => {                              // 3. a class property arrow — bound per instance
    this.count += 1;
    return this.count;
  };
}
```

Option 3 is the standard fix inside classes and it comes up again in [OOP/curriculum/03_this_and_binding](../../OOP/curriculum/03_this_and_binding/lecture.md). Option 1 is the escape hatch when you are handed a method you cannot redefine.

> **Note for the type layer:** `this` is typed in TypeScript too. In a method, `this` is the class or object the method is declared on. You can also declare a **fake** first parameter named `this` to state a requirement:
> ```ts
> function getName(this: { name: string }): string { return this.name; }
> ```
> That parameter does not exist at runtime — it is erased — and it makes calling `getName()` without a proper receiver a *compile* error rather than a runtime crash. `OOP/curriculum/03_this_and_binding` covers it properly.

---

## 7. No Keyword Arguments, No Overloading

Two Python features that simply do not exist, so you do not go looking:

**1. Keyword arguments.** `f(x: 1, y: 2)` is not valid syntax anywhere in JavaScript. Destructured options objects (section 3) are the substitute.

**2. Real function overloading.** You cannot declare the same function name twice with different signatures. TypeScript supports **overload signatures** — a list of allowed call shapes above one implementation — but there is still a single runtime function:

```ts
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {     // the one real implementation
  return typeof value === "string" ? value.trim() : value.toFixed(2);
}

format("  hi  ");      // "hi"
format(3.14159);       // "3.14"
format(true);          // error — no overload matches
```

Use overloads sparingly. A union parameter plus a narrow inside is usually clearer:

```ts
function format(value: string | number): string {
  return typeof value === "string" ? value.trim() : value.toFixed(2);
}
```

---

## 8. Pure Functions and Side Effects

A **pure** function returns a value determined only by its arguments, and changes nothing outside itself. It is the same idea as in Python, and it is worth stating because it pays off more in TypeScript: pure functions are easier to type, easier to test, and impossible to break by reordering calls.

```ts
// Pure — same input, same output, no outside effects
const addTax = (price: number, rate: number): number => price * (1 + rate);

// Impure — mutates its argument
function addTaxInPlace(items: { price: number }[], rate: number): void {
  for (const item of items) item.price *= 1 + rate;    // caller's data changed
}

// Impure — depends on and changes the outside world
let total = 0;
function accumulate(n: number): number {
  total += n;
  return total;
}
```

The mutating version is a particular hazard in JavaScript because **objects and arrays are passed by reference**, exactly as in Python. A function that mutates its parameter surprises the caller:

```ts
const items = [{ price: 100 }];
addTaxInPlace(items, 0.2);
console.log(items[0].price);      // 120 — the caller's array was modified
```

`readonly` parameters make this a compile-time guarantee:

```ts
function total(items: readonly { price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
// items.push(...) inside would now be a compile error
```

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write `multiply` three ways — declaration, expression, arrow — and call each.
2. Write `describeCity(city, country = "USA")` and call it with one, two, and an explicit `undefined` argument.
3. Write `sumAll(...values: number[])` and call it with five numbers and with a spread array.
4. Write a `request(url, options)` function using the options-object pattern with three defaults, and call it three ways.
5. Write an arrow returning an object literal — first without parentheses to see it fail, then with them.
6. Show the `this` bug: detach a method from its object and call it. Then fix it with `bind`, and again with an arrow.
7. Write `applyTwice(fn, value)` and call it with an inline arrow.
8. Write an overloaded `format` for `string | number`, then rewrite it as a single union-typed function.

---

## 📚 Resources

- **MDN:** [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- **MDN:** [Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- **MDN:** [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) — the definitive explanation of the call-site rule
- **Docs:** [TypeScript Handbook — More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- **Article:** [You Don't Know JS Yet — `this` & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/this-object-prototypes/README.md)
