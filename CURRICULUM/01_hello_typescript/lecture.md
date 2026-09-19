# Lecture 01: Hello, TypeScript!

Welcome to your first TypeScript lesson! TypeScript is a language built on top of JavaScript that adds a **type system** — a way of describing what kind of data your program is allowed to work with, so mistakes get caught *before* you run anything.

It is used for Angular, React and Vue apps, Node.js backends, VS Code itself, and most large JavaScript codebases in the world.

---

## 1. What TypeScript Actually Is

One sentence: **TypeScript is JavaScript with types, and it compiles to plain JavaScript.**

```text
hello.ts   ──[ tsc ]──>   hello.js   ──[ node ]──>  runs
(your code)              (what the
                          computer runs)
```

Every browser and every Node.js install on earth runs JavaScript, not TypeScript. Nothing executes `.ts` directly in production. The TypeScript compiler (`tsc`) checks your types and then *erases* them, emitting ordinary JavaScript.

This matters for one big reason:

> **Types exist only while you are developing. They cost nothing at runtime, and they cannot check data that arrives while the program is running.**

So `"hello"` being a string is a fact TypeScript tracks for you at your desk — but if a user types `"hello"` into a form, the type tells you nothing about whether it was *supposed* to be a number. That gap is the source of every "but it typechecked!" bug, and we will come back to it in [18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md).

---

## 2. Writing Your First TypeScript Program

Every programmer starts with "Hello, World!". Create a file named `hello.ts` and write:

```ts
console.log("Hello, World!");
```

To run it:

```bash
npm run ex hello.ts
```

### Explanation:
- `console.log()` is the function that prints to the terminal. It is JavaScript's `print()`, and it lives on a global `console` object provided by Node.js and by browsers.
- `"Hello, World!"` is a **string** (text data). Strings use double quotes (`"`), single quotes (`'`), or backticks (`` ` ``).
- **The line ends with a semicolon.** In JavaScript and TypeScript, semicolons mark the end of a statement. They are technically optional — JavaScript inserts them for you — but TypeScript is stricter about when it will guess, so write them. Your formatter will handle the details.

---

## 3. Comments

Comments are notes in your code written for humans. The compiler ignores them completely.

TypeScript has the same two comment styles as JavaScript:

```ts
// This is a single-line comment.
console.log("Hello, TypeScript!"); // This one is inline.

/*
  This is a multi-line comment.
  It uses a slash-star ... star-slash pair.
*/
```

### The third style, which is special

TypeScript adds a *third* kind of comment — one the compiler **does not** ignore:

```ts
// @ts-expect-error — the next line is deliberately wrong, and I want to be told if it stops being wrong
const broken: number = "not a number";
```

That is a **directive comment**, and it is your escape hatch when you know better than the compiler. A close cousin is `// @ts-ignore`, which silences the error but will *not* complain if the error disappears. Prefer `@ts-expect-error`: it is self-cleaning, because the day the bug is fixed, the directive itself becomes an error.

You will meet the full family of directive comments in [24_declaration_files](../24_declaration_files/lecture.md) and [21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md). For now, know they exist — and that reaching for one is a decision worth a comment explaining *why*.

---

## 4. The Node REPL (Interactive Shell)

You do not always need to write a file. Open your terminal and type `node` and press Enter. You should see a prompt:

```text
>
```

Now you can run JavaScript line by line:

```text
> 3 + 5
8
> console.log("Interactive mode!")
Interactive mode!
> .exit
```

Two things to notice, because they will surprise you:

1. **There are no types in the REPL.** This is plain JavaScript — no `: number`, no checking. A REPL exists to try things quickly, not to check them. To typecheck, put the code in a `.ts` file and run `npm run check`.
2. **`.exit` quits.** It is a REPL command, not JavaScript, which is why it has no parentheses.

> **Note:** `npm run ex` is *not* the REPL — it runs a file. The equivalent of live feedback for a file is `npm run ex -- --watch your_file.ts` if you want it, but most of the time you will write the file, run it, and look at the output.

---

## 5. Basic Arithmetic

TypeScript uses the same arithmetic operators as Python, with one significant difference. Try these in the REPL:

| Operation | Operator | Example | Result |
|-----------|----------|---------|--------|
| Addition | `+` | `5 + 3` | `8` |
| Subtraction | `-` | `10 - 4` | `6` |
| Multiplication| `*` | `4 * 3` | `12` |
| Division | `/` | `7 / 2` | `3.5` |
| Exponentiation| `**` | `2 ** 3` | `8` (2 cubed) |
| Remainder | `%` | `7 % 2` | `1` |

That looks identical to Python. Here is the difference, and it is the single most important arithmetic fact in this language:

```ts
console.log(10 / 3);    // 3.3333333333333335
console.log(10 / 0);    // Infinity   <-- NOT an error
console.log(0 / 0);     // NaN        <-- "Not a Number"
```

**JavaScript has one number type, `number`, and it is a 64-bit float.** There is no separate integer type. `10 / 3` does not truncate the way Python's `//` would, and dividing by zero produces `Infinity` rather than raising an exception.

Two consequences you should internalise now:

- **Integer division is `Math.floor(a / b)`**, or `Math.trunc(a / b)` if negatives should round toward zero. There is no `//`.
- **The integer type is `bigint`**, written with an `n` suffix (`9007199254740993n`), needed only when you exceed `Number.MAX_SAFE_INTEGER`. It is a separate type and does not mix with `number` in arithmetic.

The full story of numbers, `NaN`, and floating-point surprises is in [02_variables_types](../02_variables_types/lecture.md) and [RESOURCES/common_mistakes.md](../../RESOURCES/common_mistakes.md).

---

## 6. A First Taste of Types

You cannot get through this lecture honestly without writing one. Compare:

```ts
let message = "Hello, World!";   // TypeScript infers: string
let count = 42;                  // TypeScript infers: number
let count2: number = 42;         // ...or you say it out loud
```

Hover over `message` in your editor and it will tell you `let message: string`. You never wrote `string` — TypeScript worked it out from the value. That is **inference**, and it is why most TypeScript code has fewer type annotations than you would expect.

Now try to break it:

```ts
let count: number = 42;
count = "forty-two";
```

```text
error TS2322: Type 'string' is not assignable to type 'number'.
```

That is the entire promise of the language in one error message. See it as a service, not an obstacle: it is the mistake being caught on your machine, in your editor, instead of in production at 3am.

We will do this properly in [16_type_annotations](../16_type_annotations/lecture.md). For now, the shape of it is enough:

> **A type is a claim about what a value is. TypeScript's job is to check that your claims are consistent — and to tell you the exact line where they are not.**

---

## 🧠 Try It Yourself
1. Run `node` and calculate `12345 * 67890` in the REPL.
2. Write a file `hello.ts` that prints three lines: your name, your favourite programming language, and your goal for this study path.
3. In that same file, write `let goal: number = "learn TypeScript";` and run `npm run check`. Read the error. Then run `npm run ex hello.ts` and observe what happens — the answer is important, and it is surprising.
4. Fix the file by giving `goal` the right type, and confirm `npm run check` is silent again.

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- **Docs:** [TypeScript Playground](https://www.typescriptlang.org/play) — type and see the emitted JavaScript side by side, with no install
- **MDN:** [JavaScript First Steps](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps) — the JavaScript foundation TypeScript sits on
- **YouTube:** [Net Ninja — TypeScript Tutorial Playlist](https://www.youtube.com/playlist?list=PL4cUxeGkcC9gUgr39Q_yD6v-bSyMwKPUI)
