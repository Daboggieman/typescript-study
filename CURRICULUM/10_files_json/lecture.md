# Lecture 10: Files & JSON

Programs that only live in memory forget everything when they exit. This lecture covers reading and writing files with Node's `node:fs`, and `JSON.parse` / `JSON.stringify` — the two halves of what Python splits across the `json` module and file I/O.

---

## 1. The Modern File API: `node:fs/promises`

Node ships two file APIs: a callback-based one from 2009 and a promise-based one. **Use the promise-based one**, imported from `node:fs/promises`:

```ts
import { readFile, writeFile } from "node:fs/promises";

const text = await readFile("data.txt", "utf8");    // the "utf8" is REQUIRED
await writeFile("out.txt", "hello", "utf8");
```

There is also a synchronous API (`node:fs`), which blocks the entire process while it runs:

```ts
import { readFileSync } from "node:fs";
const text = readFileSync("data.txt", "utf8");
```

| | `node:fs/promises` | `node:fs` (sync) |
|---|---|---|
| Blocks the event loop | No | **Yes** |
| Returns | a `Promise` | the value |
| Use in | servers, anything with I/O concurrency | a script that reads a config once at startup, or a top-level script |

For a small CLI the difference does not matter. For a server it matters enormously: a synchronous read blocks *every other request*. The rule of thumb: **`await` the promise API, and reserve the sync version for startup code that genuinely cannot continue without the value.**

### The `"utf8"` argument, and what happens without it

```ts
const buf = await readFile("data.txt");          // a Buffer — raw bytes
const text = await readFile("data.txt", "utf8"); // a string
```

Omit the encoding and you get a `Buffer`, not a string. `console.log` renders a Buffer as `<Buffer 68 65 6c 6c 6f>`, and `buf === "hello"` is `false`. It is the most common file-handling confusion in Node. **Always pass `"utf8"` unless you actually want bytes** (binary formats, images, hashing).

---

## 2. Paths

Never join paths with `+` and `"/"` — the separator differs by platform and you will produce `C:\data\/file.txt`.

```ts
import path from "node:path";

path.join("data", "users", "ada.json");     // "data/users/ada.json" (or with \ on Windows)
path.resolve("data", "ada.json");           // an absolute path, resolved from cwd
path.basename("/data/ada.json");            // "ada.json"
path.dirname("/data/ada.json");             // "/data"
path.extname("/data/ada.json");             // ".json"
path.parse("/data/ada.json");               // { dir, base, ext, name }
```

### What directory am I in?

Two directories get confused constantly, and they are different:

| | Means | Changes when |
|---|---|---|
| `process.cwd()` | where you **ran** the command | you `cd` elsewhere |
| module directory | where the **file** lives | never |

Reading a data file relative to `process.cwd()` breaks the moment someone runs the script from another folder. Resolve relative to the file instead:

```ts
import path from "node:path";

// In an ES module, import.meta gives you the file's own URL
const here = import.meta.dirname;                              // Node 20.11+
const dataPath = path.join(here, "data.json");                 // robust

// The older, still-portable form
import { fileURLToPath } from "node:url";
const here2 = path.dirname(fileURLToPath(import.meta.url));
```

> **`__dirname` does not exist in ES modules.** This repo uses `"type": "module"`, so the CommonJS globals `__dirname` and `__filename` are undefined. `import.meta.dirname` is the modern replacement. Meeting this error — `__dirname is not defined` — is a rite of passage; now you know the answer.

---

## 3. Reading and Writing Files

```ts
import { readFile, writeFile, appendFile, mkdir, rm, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";

// Write (creates or OVERWRITES the whole file)
await writeFile("notes.txt", "line one\n", "utf8");

// Append
await appendFile("notes.txt", "line two\n", "utf8");

// Read
const content = await readFile("notes.txt", "utf8");

// Check existence — the sync version is the idiomatic one here
if (existsSync("notes.txt")) {
  console.log("found it");
}

// Create a directory (recursive: true = like mkdir -p, no error if it exists)
await mkdir("tabs", { recursive: true });

// Metadata
const info = await stat("notes.txt");
info.size;              // bytes
info.isDirectory();     // false
info.mtime;             // a Date

// Move / rename
await rename("a.txt", "b.txt");

// Delete
await rm("notes.txt");                          // a file
await rm("folder", { recursive: true, force: true });   // a whole tree
```

`writeFile` **replaces the entire file**. There is no partial edit at the API level — to change one line you read the whole file, modify the string or the parsed data, and write it back.

### Reading line by line

```ts
const text = await readFile("notes.txt", "utf8");
const lines = text.split("\n").filter(line => line.trim() !== "");

// Or, for a big file, stream it so it is never all in memory at once
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const rl = createInterface({ input: createReadStream("huge.log"), crlfDelay: Infinity });
for await (const line of rl) {
  console.log(line);
}
```

For a file small enough to hold in memory, `readFile` + `split("\n")` is fine and much simpler. Note the last line: a file ending in a newline produces a final empty string when split.

---

## 4. Handling the Errors

File operations fail for a dozen ordinary reasons: the file is missing, the path is a directory, permissions, the disk is full. Node does not return an error value — it **throws**:

```ts
import { readFile } from "node:fs/promises";

try {
  const text = await readFile("missing.txt", "utf8");
} catch (error) {
  if (error instanceof Error && "code" in error) {
    switch (error.code) {
      case "ENOENT": console.error("no such file"); break;
      case "EACCES": console.error("permission denied"); break;
      case "EISDIR": console.error("that is a directory"); break;
      default: throw error;         // re-throw what you do not understand
    }
  }
  // Re-throw the un-narrowed case too, rather than swallowing it
}
```

Node attaches a `code` property to filesystem errors with a stable value. `ENOENT` ("Error NO ENTry") is the one you will handle most.

> **Re-throw what you did not expect.** A `catch` that logs and continues turns a hard failure into a corrupt state that surfaces much later. Only handle what you can actually recover from.

### A safe-read helper

```ts
import { readFile } from "node:fs/promises";

async function readTextFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;                     // absent is a normal outcome, not a failure
    }
    throw error;                       // everything else is a real problem
  }
}
```

Returning `null` for "absent" and throwing for "broken" is what makes the caller's code simple, because `null` is a value the type system tracks. `[12_modules_and_errors](../12_modules_and_errors/lecture.md)` builds custom error classes on this foundation.

---

## 5. JSON

`JSON.parse` and `JSON.stringify` are built into the language. There is nothing to import.

```ts
const obj = { name: "Ada", age: 30, tags: ["math", "code"] };

const text = JSON.stringify(obj);
// '{"name":"Ada","age":30,"tags":["math","code"]}'

const back = JSON.parse(text);
// { name: 'Ada', age: 30, tags: [ 'math', 'code' ] }
```

### Pretty-printing

```ts
JSON.stringify(obj, null, 2);      // indented with 2 spaces — for files humans read
JSON.stringify(obj);               // compact — for transport
```

That third argument is why JSON files in this repo are readable.

### What JSON cannot represent

The format is deliberately small, and it silently drops things:

```ts
JSON.stringify({ a: undefined });            // '{}'          — the key vanishes
JSON.stringify([1, undefined, 3]);           // '[1,null,3]'  — in an ARRAY it becomes null
JSON.stringify({ d: new Date() });           // '{"d":"2026-09-19T..."}'  — becomes a string
JSON.stringify({ n: NaN });                  // '{"n":null}'
JSON.stringify({ n: Infinity });             // '{"n":null}'
JSON.stringify({ f: () => {} });             // '{}'          — functions vanish
JSON.stringify({ m: new Map([["a",1]]) });   // '{"m":{}}'    — Map serialises as empty!
JSON.stringify({ s: new Set([1,2]) });       // '{"s":{}}'    — so does Set
JSON.stringify({ big: 1n });                 // TypeError: Do not know how to serialize a BigInt
JSON.stringify({ r: /\d+/ });                // '{"r":{}}'
```

> **`Map` and `Set` do not survive a round trip.** `JSON.stringify(new Map([["a", 1]]))` is `{}` — an empty object, with no error. Convert to an array or a plain object first:
> ```ts
> const m = new Map([["a", 1]]);
> JSON.stringify([...m]);                    // '[["a",1]]'
> JSON.stringify(Object.fromEntries(m));     // '{"a":1}'
> ```

And `Date` is the reverse trap: it serialises to a string, so `JSON.parse` gives you back a **string**, not a `Date`. Nothing tells you; `parsed.created.getTime()` fails with "not a function".

### Cycles throw

```ts
const a: Record<string, unknown> = {};
a.self = a;
JSON.stringify(a);          // TypeError: Converting circular structure to JSON
```

Real object graphs contain cycles (a parent pointing to its children, which point back). Serialise an explicit, acyclic shape instead of the live object.

---

## 6. The Typing Gap — Read This Twice

```ts
const raw = await readFile("user.json", "utf8");
const user = JSON.parse(raw);

user.name.toUpperCase();       // no error at compile time
```

`JSON.parse` returns **`any`**. Not `unknown` — `any`. Every property access on it compiles without complaint, and a typo or a missing field explodes at runtime. TypeScript is switched off for that value and everything downstream of it.

The fix is to parse into `unknown`, then validate:

```ts
type User = { name: string; age: number };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value && typeof (value as User).name === "string" &&
    "age" in value && typeof (value as User).age === "number"
  );
}

const raw = await readFile("user.json", "utf8");
const parsed: unknown = JSON.parse(raw);

if (!isUser(parsed)) throw new Error("user.json is not a valid User");
// From here on, `parsed` is a User, and the compiler knows it.
console.log(parsed.name.toUpperCase());
```

That `value is User` return type is called a **type predicate**, and it is the standard way to bring untrusted data into a typed program. It is written out properly in [18_unions_and_narrowing](../18_unions_and_narrowing/lecture.md).

> **The core lesson of this lecture.** Types are erased at runtime. A file, a network response, `localStorage`, or a user's keyboard input arrive as untyped data, and *no amount of TypeScript changes that*. `.json` files are the most common place this bites, which is why "validate at the boundary" is the rule. Everything inside your program can be trusted; everything entering it must be checked.

For real projects, use a schema library (`zod`, `valibot`) rather than hand-written predicates — they generate the validator *and* the type from one definition. This repo stays dependency-free, so hand-written predicates are used throughout, but know that the library route exists.

---

## 7. Reading and Writing JSON Files

The complete round trip:

```ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

type Tab = { tableName: string; items: { name: string; price: number }[] };

async function saveTab(tab: Tab, dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });

  const file = path.join(dir, `${tab.tableName}.json`);
  await writeFile(file, JSON.stringify(tab, null, 2), "utf8");
}

async function loadTab(name: string, dir: string): Promise<Tab | null> {
  const file = path.join(dir, `${name}.json`);

  try {
    const raw = await readFile(file, "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error(`${file} does not contain an object`);
    }
    return parsed as Tab;         // trust it here — see the note below
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
```

> **A note on `as Tab` in that function.** This is a deliberate simplification: if you wrote the file, you have grounds to trust its shape. When the file might have been edited by hand or written by an older version of your program, add a real validator. The honest rule is *validate at every boundary you do not control*, and a file you wrote earlier is a boundary you only partly control — schema drift is real.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Write a string to a file and read it back. Then read it *without* `"utf8"` and print both — note the Buffer.
2. Append a second line, read the file, and print it line by line after splitting on `"\n"`.
3. Use `path.join` with `import.meta.dirname` to build a path to a file next to the script, and write there. Explain in a comment why this beats a relative path.
4. Read a file that does not exist and handle `ENOENT` by returning `null`. Distinguish it from a genuine error in the catch.
5. Serialise an object to JSON, then parse it back and print it. Then serialise a `Map` and a `Set` and note what you get.
6. Add `undefined`, a function, a `NaN`, and a `Date` to an object and `JSON.stringify` it. Print the result and explain each disappearance.
7. Build a cyclic object and try to stringify it. Catch the error.
8. Write a `loadJSON` function that returns `unknown` and a `isUser` type predicate, then use it to safely read a JSON file.

---

## 📚 Resources

- **Docs:** [Node.js — File system (`fs/promises`)](https://nodejs.org/api/fs.html#promises-api)
- **Docs:** [Node.js — Path](https://nodejs.org/api/path.html)
- **Docs:** [Node.js — `import.meta.dirname`](https://nodejs.org/api/esm.html#importmetadirname)
- **MDN:** [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- **MDN:** [`JSON.stringify` — description of what is dropped](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description)
- **Docs:** [TypeScript — Type predicates and `unknown`](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
