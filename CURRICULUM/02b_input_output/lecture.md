# Lecture 02b: Input & Output

Python gives you `print()` and `input()` and calls it a day. JavaScript grew up in two places — the terminal and the browser — so it has a different tool for each, and neither is as tidy as `input()`. This lesson covers the terminal version, plus everything you can do with output.

---

## 1. Output: `console.log` and Its Siblings

```ts
console.log("Hello");                        // Hello
console.log(1, 2, 3);                        // 1 2 3     — multiple args, space-separated
console.log(`Total: ${price * qty}`);        // Total: 42
```

`console.log` takes **any number of arguments** and prints them separated by a space. That is different from Python's `print(a, b)`, which supports a `sep=` argument you can change. JavaScript has no `sep`.

### The whole family

```ts
console.log("just text");
console.error("goes to stderr, printed in red");   // for errors
console.warn("goes to stderr");                    // for warnings
console.info("same as log, semantically different");
console.table([{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }]);  // a real table!
console.dir({ deep: { nested: { object: true } } });                // forces full depth
```

`console.error` and `console.warn` write to **stderr**, not stdout. That distinction is the whole point of them:

```bash
npm run ex script.ts > output.txt        # stdout only — console.error text still appears on screen
npm run ex script.ts 2> errors.txt       # stderr only
```

> **Why it matters:** if you pipe your program's output into another tool, `console.log` is the data and `console.error` is the commentary. Put progress messages and diagnostics in `console.error` and they will not corrupt the pipe.

### Printing objects — and the trap

```ts
console.log({ name: "Ada", scores: [95, 88] });
// { name: 'Ada', scores: [ 95, 88 ] }

const big = { a: { b: { c: { d: { e: "deep" } } } } };
console.log(big);          // { a: { b: { c: [Object] } } }   <-- truncated!
console.dir(big, { depth: null });   // shows everything
```

Node truncates deeply nested objects at two levels by default. When your object looks like `[Object]`, reach for `console.dir(..., { depth: null })`.

### The trap that will cost you an hour someday

```ts
const user = { name: "Ada", age: 30 };
console.log("user", user);     // prints the object by REFERENCE
user.age = 31;                 // ...if you mutate it before the terminal flushes
```

Node defers the actual formatting of object arguments. If you log an object and then mutate it before the process exits, you may see the *mutated* version printed. When the value matters, log a copy: `console.log({ ...user })`, or log `JSON.stringify(user)`.

---

## 2. Input, Part 1: Command-Line Arguments

The simplest input is what the user typed after the script name:

```ts
// file: greet.ts
// run:  npm run ex greet.ts -- Ada 30
const [, , ...args] = process.argv;

console.log(args);    // [ 'Ada', '30' ]
```

`process.argv` is always an array of strings with a fixed prefix:

| Index | Contains |
|---|---|
| `0` | the path to `node` |
| `1` | the path to the script |
| `2…` | **your arguments** |

Two things to notice:

1. **Everything is a string.** `"30"` is not the number `30`. You must convert it yourself with `Number()` or `parseInt(arg, 10)`.
2. **The `--` in `npm run ex greet.ts -- Ada 30`.** npm swallows arguments meant for npm, so `--` separates npm's arguments from your script's. Forget it and your arguments vanish.

```ts
const name = args[0] ?? "world";
const age = Number(args[1] ?? 0);

if (Number.isNaN(age)) {
  console.error(`Age must be a number, got: ${args[1]}`);
  process.exit(1);
}

console.log(`Hello, ${name}! You are ${age}.`);
```

### Exiting with a status code

```ts
process.exit(0);   // success — the default when the script just ends
process.exit(1);   // failure — anything non-zero means "something went wrong"
```

A shell checks this code, which is why `&&` chaining works:

```bash
npm run ex check.ts && echo "it worked"      # the echo only runs if the exit code was 0
```

> **Convention:** print errors to `console.error` and exit non-zero. That single habit makes your script a good citizen in a pipeline.

---

## 3. Input, Part 2: Prompting with `node:readline`

For interactive input — the true `input()` equivalent — you need the `readline` module. It is built in, so there is nothing to install:

```ts
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

const name = await rl.question("What is your name? ");
console.log(`Hello, ${name}!`);

rl.close();
```

Four things to know:

1. **`await`.** `rl.question` returns a Promise, so it needs `await`. That is why this file must be a module (`"type": "module"` is already set in `package.json`) — top-level `await` only works in modules.
2. **Always `rl.close()`.** Without it, Node keeps the stdin stream open and the process hangs forever after your last line.
3. **It always returns a `string`.** There is no parsing. `"30"`, not `30`.
4. **The prompt text is optional.** `rl.question()` with no argument works, it just feels unresponsive.

### A loop, the way a CLI actually reads input

```ts
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

let total = 0;
while (true) {
  const line = await rl.question("Add a number (or 'done'): ");
  if (line.trim().toLowerCase() === "done") break;

  const value = Number(line);
  if (Number.isNaN(value)) {
    console.error(`"${line}" is not a number, try again`);
    continue;
  }
  total += value;
  console.log(`Running total: ${total}`);
}

rl.close();
console.log(`Final total: ${total}`);
```

Ctrl-D (end of input) makes `question` resolve with an empty string and then keep resolving empty — so a loop that only breaks on `"done"` will spin. Either `break` when the line is empty, or listen for the `'close'` event. This is a real papercut, not a hypothetical.

---

## 4. Output, Part 2: Formatting

Python has f-strings with a format spec language: `f"{price:.2f}"`. JavaScript's `toFixed` does the common cases:

```ts
const price = 3.14159;

price.toFixed(2)          // "3.14"      — a STRING
price.toFixed(0)          // "3"
(1234.5678).toFixed(2)    // "1234.57"   — no thousands separator

price.toFixed(2) + 1      // "3.141"     <-- string + number concatenates!
Number(price.toFixed(2))  // 3.14        — convert back if you need a number
```

For anything beyond decimals — padding, alignment, currency symbols, thousands separators — use `Intl`:

```ts
const n = 1234567.891;

new Intl.NumberFormat("en-US").format(n);              // "1,234,567.891"
new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(n);                                           // "$1,234,567.89"
new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2, maximumFractionDigits: 2
}).format(n);                                           // "1,234,567.89"
new Intl.DateTimeFormat("en-GB").format(new Date());    // "19/09/2026"
```

### Padding and aligning columns

`padStart` and `padEnd` are what you want for a table:

```ts
const rows = [
  ["Apple", 1.5],
  ["Banana", 12.25],
  ["Cherry", 100],
] as const;

for (const [name, price] of rows) {
  console.log(`${name.padEnd(10)}${String(price).padStart(8)}`);
}
```

```text
Apple          1.5
Banana       12.25
Cherry         100
```

`"5".padStart(3, "0")` gives `"005"` — the standard way to zero-pad.

> **No `printf`.** If you are looking for Python's `%` or `str.format`, there is no equivalent. It is template literals for interpolation, `toFixed` for decimals, `padStart`/`padEnd` for alignment, and `Intl` for anything locale-aware.

---

## 5. Reading a Whole File vs Reading Input

Worth filing away now, since [10_files_json](../10_files_json/lecture.md) covers it properly:

```ts
import { readFile } from "node:fs/promises";

const text = await readFile("data.txt", "utf8");   // the "utf8" is required
```

Without the `"utf8"` argument you get a `Buffer` — raw bytes — not a string. That is the single most common file-reading confusion, and the reason Python's `open()` with default text mode feels easier.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Print three lines using a single `console.log` call.
2. Read `process.argv` and print how many user arguments were passed. Remember `npm run ex <file> -- a b c`.
3. Take a name and an age from `process.argv` and print a greeting. Guard against a non-numeric age using `console.error` and `process.exit(1)`.
4. Use `node:readline/promises` to ask for two numbers and print their sum. Forgetting `rl.close()` is the classic hang — try it once on purpose.
5. Format `1234.5678` four ways: `toFixed(2)`, `Intl.NumberFormat`, as USD currency, and zero-padded to width 12.

---

## 📚 Resources

- **Docs:** [Node.js — `console`](https://nodejs.org/api/console.html)
- **Docs:** [Node.js — `readline/promises`](https://nodejs.org/api/readline.html)
- **Docs:** [Node.js — `process.argv`](https://nodejs.org/api/process.html#processargv)
- **MDN:** [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- **MDN:** [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
