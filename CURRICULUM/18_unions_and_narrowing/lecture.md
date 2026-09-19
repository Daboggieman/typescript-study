# Lecture 18: Unions & Narrowing

A union says "this value is one of several things". **Narrowing** is how TypeScript figures out *which* one, at each point in your code, by reading your control flow. This lecture is the single highest-leverage idea in the language: it is what turns a type system from a straitjacket into a tool that helps you write correct code.

---

## 1. Union Types

```ts
let id: string | number = "abc";
id = 42;                  // fine

function format(value: string | number): string {
  return String(value);
}
```

A union means **exactly one** of the listed types. The value is not both, and it is not a merged type — it is one of them, and at any moment the compiler may not know which.

That is why this fails:

```ts
function length(value: string | number): number {
  return value.length;    // ERROR — Property 'length' does not exist on type 'number'
}
```

The compiler is being helpful. It is saying: *you have only handled the `string` case.* You must prove which one you have before using it. Proving it is narrowing.

---

## 2. Narrowing with `typeof`

```ts
function length(value: string | number): number {
  if (typeof value === "string") {
    return value.length;    // here, value is string
  }
  return String(value).length;   // here, value is number
}
```

Inside the `if`, TypeScript has *narrowed* `value` to `string`. After the block, it knows the other branch is `number`. You did not annotate anything — the compiler read your code.

`typeof` returns one of these strings, and each narrows differently:

| `typeof x` | Type |
|---|---|
| `"string"` | `string` |
| `"number"` | `number` |
| `"bigint"` | `bigint` |
| `"boolean"` | `boolean` |
| `"symbol"` | `symbol` |
| `"undefined"` | `undefined` |
| `"object"` | `object \| null` — **note the null** |
| `"function"` | `Function` |

> **The trap:** `typeof null === "object"`. This is a bug from 1995, preserved forever because fixing it would break the web. So `typeof value === "object"` does **not** exclude `null`. You need `value !== null && typeof value === "object"`, or `value != null` (loose `==`) to rule out both `null` and `undefined` at once.

```ts
function describe(value: string | number | boolean | null): string {
  if (value === null) return "null";
  if (typeof value === "string") return `string: ${value.toUpperCase()}`;
  if (typeof value === "number") return `number: ${value.toFixed(2)}`;
  return `boolean: ${value}`;      // narrowed to boolean
}
```

---

## 3. Narrowing with `instanceof`

For classes, `instanceof` narrows to the class:

```ts
class Cat {
  meow(): string { return "meow"; }
}

class Dog {
  bark(): string { return "woof"; }
}

function speak(animal: Cat | Dog): string {
  if (animal instanceof Cat) {
    return animal.meow();      // narrowed to Cat
  }
  return animal.bark();        // narrowed to Dog
}
```

Unlike `typeof`, this one is not a lie: `instanceof` really does check the prototype chain at runtime.

`instanceof` also narrows built-ins:

```ts
function stringify(value: string | Date | Error): string {
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return value.message;
  return value;
}
```

But be careful with `instanceof Error` across module boundaries and realms — subclassing `Error` in TypeScript has its own pitfalls ([12_modules_and_errors](../12_modules_and_errors/lecture.md) section 9).

---

## 4. Narrowing by Truthiness

```ts
function greet(name: string | undefined): string {
  if (name) {
    return `Hello, ${name}`;    // narrowed to string
  }
  return "Hello, stranger";
}
```

Any value used in a condition narrows. The falsy set is the one from [06_control_flow](../06_control_flow/lecture.md):

```
false, 0, -0, 0n, "", null, undefined, NaN
```

> **This is where Python instincts misfire.** In Python, `[]` and `{}` are falsy, so `if items:` means "if not empty". In JavaScript that is **also** true — but `if (name)` where `name` is `"0"` or `0` is *not* the check you meant. Empty-string and zero checks look identical to undefined checks, and they are not. Prefer `if (name !== undefined)` when you mean "was it provided".

Narrowing on truthiness narrows the *union*, so it is only useful when the union contains a falsy member:

```ts
function first(list: string[]): string | undefined {
  return list[0];
}

const f = first(["a"]);
if (f !== undefined) {
  f.toUpperCase();     // narrowed
}
```

Note `!== undefined` rather than `if (f)` — they differ for the empty string, which is a perfectly good string.

---

## 5. Narrowing by Equality

```ts
function move(dir: "north" | "south" | "east" | "west"): void {
  if (dir === "north") {
    // dir is "north"
  } else {
    // dir is "south" | "east" | "west"
  }

  switch (dir) {
    case "north":
    case "south":
      break;
    case "east":
      break;
    default:
      dir;               // narrowed to "west" — the only one left
  }
}
```

`switch` narrows per case, and `default` collects the remainder — which is what makes the exhaustiveness trick below possible.

---

## 6. Narrowing with `in`

The `in` operator checks whether a property exists, and narrows to the members that have it:

```ts
type Admin = { name: string; permissions: string[] };
type Guest = { name: string; expiresAt: Date };

function describeUser(user: Admin | Guest): string {
  if ("permissions" in user) {
    return `${user.name} has ${user.permissions.length} permissions`;    // Admin
  }
  return `${user.name} expires ${user.expiresAt.toISOString()}`;         // Guest
}
```

The property must exist on at least one member of the union, or the check is an error. And `in` only narrows *unions of object types* — on a plain object it simply returns a boolean.

---

## 7. Discriminated Unions — The Pattern That Matters

A **discriminated union** (also called a tagged union) is a union where every member has a common literal property naming the variant. TypeScript narrows on that property automatically.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;         // narrowed: radius exists
    case "square":
      return shape.side ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

Notice there is no `default`. Every case is handled, so the function always returns — and the compiler can prove it, so it does not complain about a missing return. That is the compiler *agreeing with you*, and it is the payoff for modelling data this way.

Compare it to the optional-property style it replaces:

```ts
// Worse — nothing prevents both, or neither
type Shape = {
  kind: "circle" | "square";
  radius?: number;
  side?: number;
};
```

Here `radius` is `number | undefined` in every branch, so every use needs a check, and nothing stops you constructing `{ kind: "circle", side: 5 }`. Discriminated unions make illegal states unrepresentable.

This is the same idea as Python's `@dataclass` variants or an `Enum` plus payload — except it is enforced.

---

## 8. Exhaustiveness with `never`

Combine a discriminated union with the `never` trick from [16_type_annotations](../16_type_annotations/lecture.md) section 3:

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default:
      return assertNever(shape);     // shape is never here — unless a case is missing
  }
}
```

Now add `| { kind: "triangle"; base: number; height: number }` to `Shape` and the `default` branch fails to compile: `Argument of type '{ kind: "triangle"; ... }' is not assignable to parameter of type 'never'`.

**This is the single best reason to model data as discriminated unions.** The compiler tells you every place that needs updating when the data model changes. It is the closest thing to a refactoring guarantee that exists in a dynamic language's ecosystem.

Note the `assertNever` function throws, so it is a legitimate runtime guard too — if a value somehow arrives that the types did not predict (a JSON payload, say), you get a real error at that line rather than a silent wrong answer.

---

## 9. Custom Type Predicates

When the check is more complex than `typeof`, write a predicate function:

```ts
type User = { name: string; age: number };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name: unknown }).name === "string" &&
    "age" in value &&
    typeof (value as { age: unknown }).age === "number"
  );
}

function process(value: unknown): string {
  if (isUser(value)) {
    return `${value.name} (${value.age})`;      // narrowed to User
  }
  return "not a user";
}
```

Two things to notice:

1. **The return type is `value is User`, not `boolean`.** That syntax is what does the narrowing. A plain `boolean` return gives you no narrowing at all.
2. **The body is a lie the compiler cannot check**. TypeScript trusts that `isUser` really returns `true` only for users. It verifies the *syntax*, not the *logic*. A predicate that returns `true` unconditionally compiles fine and breaks everything downstream. So: predicates get tested ([11_testing](../11_testing/lecture.md)).

The `as { name: unknown }` casts inside are the boilerplate cost of checking a value typed `unknown`. `typeof` on `unknown` narrows fine, but property access does not, so the first check establishes the shape a step at a time.

This is the function you write for loading JSON ([10_files_json](../10_files_json/lecture.md) section 6) and for any `unknown` at a boundary.

---

## 10. Narrowing Does Not Survive a Function Call

The rule that trips people up, and the reason this lecture comes after [08_functions](../08_functions/lecture.md):

```ts
function process(value: string | null): void {
  if (value === null) return;

  // value is string here
  setTimeout(() => {
    value.toUpperCase();       // still fine — arrows capture the narrowed type
  });

  // But a REASSIGNMENT undoes it
  let other: string | null = value;
  other = null;
  other.toUpperCase();         // ERROR — narrowed back to string | null
}
```

More importantly:

```ts
function process(value: string | null): void {
  if (value === null) return;

  // value is string here — but this does NOT carry into a callback
  // the compiler cannot see through
  [1, 2, 3].forEach(() => {
    console.log(value.length);   // OK for `const`-like params; a `let` may have changed
  });
}
```

The compiler keeps narrowing for parameters that are never reassigned. If you reassign one, the narrowing is discarded after the assignment — because the compiler is honest about the fact that it can no longer be sure.

**Practical rule:** treat parameters as read-only. If you need a different value, use a new `const`. That keeps narrowing intact and removes a whole class of bug.

---

## 11. Nullish Coalescing and Optional Chaining

Two operators that pair with unions containing `null`/`undefined`.

```ts
const value: string | null = getValue();

// Optional chaining — short-circuit to undefined instead of throwing
const upper = value?.toUpperCase();            // string | undefined
const len = value?.length ?? 0;                // number

// Nullish coalescing — fallback ONLY for null / undefined
const name = value ?? "anonymous";
```

`??` versus `||` is the trap:

```ts
const count: number | null = 0;

count ?? 10;      // 0    — 0 is not null or undefined
count || 10;      // 10   — 0 is falsy. Probably not what you wanted.
```

`??` only fires on `null` and `undefined`; `||` fires on every falsy value. For defaults on numbers and strings, `??` is almost always the correct one.

```ts
const port = Number(process.env.PORT ?? 3000);
```

And optional chaining composes with calls and indexes:

```ts
user?.address?.city;              // string | undefined
users?.[0]?.name;                 // string | undefined
callback?.();                     // only calls if defined
```

Deep chains like `a?.b?.c?.d?.e` are usually a sign the data model is wrong — a shape where everything is optional is a shape that has not been designed. Real nesting is fine; five levels of `?.` is a smell.

---

## 12. Narrowing `unknown`

The `unknown` from [16_type_annotations](../16_type_annotations/lecture.md) section 3 is narrowed by exactly the same tools:

```ts
function parse(input: unknown): string {
  if (typeof input === "string") return input;
  if (typeof input === "number") return input.toFixed(2);
  if (Array.isArray(input)) return input.join(", ");
  if (input instanceof Date) return input.toISOString();
  if (typeof input === "object" && input !== null) {
    return Object.keys(input).join(", ");
  }
  return String(input);
}
```

`Array.isArray` is worth remembering — `typeof []` is `"object"`, so it is the only reliable array check, and TypeScript knows to narrow on it.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write `format(value: string | number)` and narrow with `typeof`.
2. Show that `typeof null === "object"` by narrowing a `string | null` incorrectly, then fix it.
3. Narrow a `Cat | Dog` with `instanceof`.
4. Build a discriminated union of three shapes and a `switch` that computes area for each with no `default`.
5. Add a fourth variant and watch the `switch` fail before you add its case.
6. Add an `assertNever` default branch and prove it catches the new variant.
7. Narrow with `in` on `Admin | Guest`.
8. Write an `isUser(value: unknown): value is User` predicate and use it to narrow.
9. Provoke the "narrowing does not survive reassignment" error and fix it with `const`.
10. Show the difference between `??` and `||` with a value of `0`.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — the best chapter in the handbook
- **Docs:** [TypeScript Handbook — Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
- **Docs:** [TypeScript — `typeof` type operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)
- **Reference:** [MDN — Nullish coalescing operator (`??`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- **Reference:** [MDN — Optional chaining (`?.`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- **Article:** [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) — the pattern, from the source
