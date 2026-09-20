# Lecture 03: Strings

Strings are sequences of characters. TypeScript has one string type, `string`, and it behaves more like a Python string than you might expect — with a few sharp differences around immutability, indexing, and what happens when you try to change one.

---

## 1. Creating Strings

Three quote styles, and they are not equivalent:

```ts
const a = "double quotes";
const b = 'single quotes';
const c = `backticks — a template literal`;
```

`"` and `'` are interchangeable; pick one and be consistent. Backticks enable `${}` interpolation and multi-line text, which the other two cannot do:

```ts
const name = "Ada";

const one = "Hello, " + name + "!";     // concatenation — works, but noisy
const two = `Hello, ${name}!`;          // template literal — preferred

const multi = `first line
second line`;                            // real newlines, no \n needed
```

Escapes work as in Python, with `\n`, `\t`, `\\`, `\"`, and `\'`:

```ts
const quoted = "She said \"hello\"";
const backslash = "C:\\Users\\ada";
const newline = "line one\nline two";
```

---

## 2. Strings Are Immutable

This is the fact that explains almost every "why didn't my string change?" bug:

```ts
let greeting = "hello";
greeting.toUpperCase();

console.log(greeting);      // "hello"  <-- unchanged!
```

`toUpperCase()` returns a **new** string. It does not modify the original, ever. Every string method in this lecture works the same way:

```ts
greeting = greeting.toUpperCase();   // this is how you "change" it
console.log(greeting);               // "HELLO"
```

> **In Python you also cannot mutate a string**, but the error modes differ. In JavaScript, forgetting to capture the return value fails *silently* — no error, just an unchanged value. Python at least makes you write `s = s.upper()`. Watch for it.

---

## 3. Length and Indexing

```ts
const s = "hello";

s.length            // 5     <-- a PROPERTY, not s.length()
s[0]                // "h"
s[1]                // "e"
s[s.length - 1]     // "o"   — the last character
s.charAt(0)         // "h"   — older method, same result
s[-1]               // undefined  <-- NOT "o". No negative indexing!
s.at(-1)            // "o"   — THIS is how you count from the end
```

Two Python habits to break:

1. **`s.length`** has no parentheses. Python's `len(s)` is a function; JavaScript's `length` is a property. `s.length()` is a runtime error.
2. **`s[-1]` is `undefined`, not the last character.** JavaScript has no negative indexing. Use `s.at(-1)`, which does support negative positions.

Out-of-range access does not raise — it returns `undefined`:

```ts
"hi"[10]         // undefined   (Python raises IndexError)
"hi".at(10)      // undefined
```

---

## 4. Extracting Substrings

Three methods, and the differences are a genuine trap:

```ts
const s = "JavaScript";

s.slice(0, 4)        // "Java"     end index EXCLUDED — like Python's s[0:4]
s.slice(4)           // "Script"   to the end
s.slice(-6)          // "Script"   negative counts from the end
s.slice(-6, -3)      // "Scr"
s.slice(8, 2)        // ""         start > end  → empty

s.substring(0, 4)    // "Java"
s.substring(8, 2)    // "JavaScri" — SWAPS the arguments instead of returning ""

s.substr(4, 6)       // "Script"   second arg is a LENGTH, not an end index. Deprecated.
```

> **Use `slice`.** It matches Python's slicing most closely, supports negatives, and behaves predictably. `substring` silently reorders arguments, and `substr` is deprecated.

Python's step syntax (`s[::-1]`) has **no equivalent** — to reverse a string you must split, reverse, and join:

```ts
const reversed = [...s].reverse().join("");
```

`[...s]` spreads the string into an array of characters, which returns the rest of this lecture's tools to you.

---

## 5. Searching

```ts
const s = "The quick brown fox";

s.includes("quick")        // true        — the boolean you usually want
s.includes("Quick")        // false       — case sensitive
s.indexOf("quick")         // 4           — first index, or -1
s.lastIndexOf("o")         // 17          — last occurrence, or -1
s.startsWith("The")        // true
s.endsWith("fox")          // true
s.search(/brown/)          // 10          — accepts a regex
```

`indexOf` returns **-1** when not found, not an exception and not `None`:

```ts
if (s.indexOf("cat") !== -1) { }     // works, but ...
if (s.includes("cat")) { }           // ... this says what you mean
```

Because `-1` is truthy, `if (s.indexOf("cat"))` is **always true** — a classic bug. Use `includes` for the boolean case.

---

## 6. Transforming

```ts
const s = "  Hello, World  ";

s.trim()                  // "Hello, World"     both ends
s.trimStart()             // "Hello, World  "
s.trimEnd()               // "  Hello, World"
s.toLowerCase()           // "  hello, world  "
s.toUpperCase()           // "  HELLO, WORLD  "

s.replace("World", "TS")  // replaces the FIRST match only
"a-b-c".replace("-", "+")     // "a+b-c"      <-- only the first!
"a-b-c".replaceAll("-", "+")  // "a+b+c"      <-- all of them
"a-b-c".split("-").join("+")  // "a+b+c"      <-- the pre-replaceAll idiom

s.repeat(2)               // repeats the whole string
"5".padStart(3, "0")      // "005"
"5".padEnd(3, ".")        // "5.."
```

> **`replace` replacing only the first occurrence** is one of the most common JavaScript bugs. Python's `str.replace` replaces all of them by default, so this is a direct trap for Python developers. Use `replaceAll` (or a regex with the `g` flag) when you want every match.

---

## 7. Splitting and Joining

```ts
const csv = "apple,banana,cherry";

const parts = csv.split(",");        // ["apple", "banana", "cherry"]
parts.join(" | ");                    // "apple | banana | cherry"
csv.split("")                         // every character
csv.split(",", 2)                     // ["apple", "banana"] — a max LENGTH
"a b  c".split(/\s+/)                 // ["a", "b", "c"] — regex, like Python's str.split()

[..."abc"]                            // ["a", "b", "c"] — spread, cleaner than split("")
Array.from("abc")                     // ["a", "b", "c"]
```

The Python pattern `" ".join(words)` maps to `words.join(" ")` — the method lives on the **array**, not on the string. That reversal catches people for a while.

---

## 8. Comparing Strings

```ts
"a" < "b"            // true    — lexicographic, by UTF-16 code unit
"Z" < "a"            // true    — uppercase sorts BEFORE lowercase (unlike a human dictionary)
"apple" === "apple"  // true    — content comparison works for strings
"10" < "9"           // true    — "1" < "9", because these are STRINGS
```

Because comparison is by code unit, `"Z" < "a"`. For case-insensitive or locale-aware comparison, use `localeCompare`:

```ts
"Z".localeCompare("a")                    // 1  (Z after a, human order)
"apple".localeCompare("Banana", "en", { sensitivity: "base" })  // -1

["banana", "Apple", "cherry"].sort()                  // ["Apple", "banana", "cherry"] — code units
["banana", "Apple", "cherry"].sort((a, b) => a.localeCompare(b))  // ["Apple", "banana", "cherry"] — human
```

---

## 9. The Unicode Caveat

`length` and indexing count **UTF-16 code units**, not human-perceived characters:

```ts
"café".length            // 4   — fine here
"🙂".length              // 2   — one emoji, two code units!
"👍🏽".length             // 4   — emoji + skin tone modifier
"é".length               // 1, but "e" + combining accent is 2
```

For anything user-facing, count with `Intl.Segmenter` or `[...s].length`:

```ts
[...("🙂")].length           // 1
[...("👍🏽")].length          // 2 — still not 1; grapheme clusters need Intl.Segmenter
```

> **Practical rule:** for ASCII and normal European text you will never notice. The moment emoji or accents enter the picture — usernames, tweet lengths, password rules — assume `length` is lying to you and reach for `Intl.Segmenter`.

### TypeScript String Features

TypeScript enhances JavaScript strings with additional type safety and features:

#### Template Literal Types
TypeScript can infer specific string literal types from template literals:

```ts
type Color = "red" | "blue" | "green";
type Size = "small" | "medium" | "large";

type CSSClass = `bg-${Color}-${Size}`;
// CSSClass is "bg-red-small" | "bg-red-medium" | ... | "bg-green-large"

const className: CSSClass = `bg-${color}-${size}`;
// TypeScript validates that color and size produce a valid combination
```

#### String Manipulation with Type Safety
When working with string manipulation functions, TypeScript helps ensure type safety:

```ts
// Function that extracts a filename from a path
function getFileName(path: string): string {
    return path.split("/").pop() || "";
}

// With TypeScript, you know the return value is definitely a string
const fileName = getFileName("/home/user/document.pdf");
// fileName is inferred as string, not string | null
```

#### String Enums
TypeScript allows string-based enums for better readability:

```ts
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

// Usage
function move(dir: Direction) {
    console.log(`Moving ${dir}`); // Prints the string value
}

move(Direction.Up); // "Moving Up"
```

#### String Literal Types in Practice
Using string literal types for state management:

```ts
type LoadingState = "idle" | "loading" | "success" | "error";

interface AppState {
    status: LoadingState;
    data?: unknown;
    error?: string;
}

const state: AppState = {
    status: "loading"
};

// TypeScript prevents invalid states:
// state.status = "completed"; // Error: Type '"completed"' is not assignable to type 'LoadingState'.
```

---

## 10. Regex, Briefly

Strings and regexes interlock constantly. Just enough to read the rest of this repo:

```ts
const re = /\d+/g;                     // one or more digits, global
"a1b22c333".match(/\d+/g)              // ["1", "22", "333"]
"a1b22c333".replace(/\d+/g, "#")       // "a#b#c#"
"hello".test                          // (this is wrong — test lives on the regex)
/\d+/.test("hello")                    // false
"2026-09-19".match(/(\d{4})-(\d{2})-(\d{2})/)   // ["2026-09-19", "2026", "09", "19"]
```

The **`g` flag** matters: `match` returns only the first match without it, and `replace` replaces only the first. This is the same "first occurrence only" trap from section 6, and it has the same cause.

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Build a greeting with both concatenation and a template literal. Confirm the output is identical.
2. Show that `toUpperCase()` did not change the original string.
3. Print the first and last character of a word. Use `at(-1)` for the last, then try `[-1]` and explain the result in a comment.
4. Extract `"Script"` from `"JavaScript"` using `slice`, `substring`, and `substr`. Note where the third one's arguments differ.
5. Replace every `-` in `"a-b-c-d"` with `+` three ways: `replace`, `replaceAll`, and `split`/`join`.
6. Reverse a string using spread, `reverse`, and `join`.
7. Demonstrate the `replace`-first-only trap with `"aaa"`, then fix it.

---

## 📚 Resources

- **MDN:** [String (full method reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- **MDN:** [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- **MDN:** [Regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
- **Article:** [JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode) — the definitive piece on `length` and emoji
