# Lecture 25: Async & Promises

JavaScript runs your code on a single thread, and yet a `fetch` call does not freeze the program. The mechanism is the **event loop**, and the abstraction over it is the **Promise**. If you have used Python's `asyncio`, the shape of the problem is familiar; the syntax and the failure modes are not.

This is the last core module, and it is the one with the most traps. Nearly every one of them comes from the same root cause: **`async` functions return promises, and it is very easy to forget which line you are on.**

---

## 1. Why Asynchrony Exists

```ts
// The blocking version — if this existed, the whole program would stop
const data = readFileSync("big.json");     // nothing else can happen until it finishes
console.log("this waits");
```

Node gives you the synchronous version of many operations (`readFileSync`, `execSync`) and they are almost always the wrong choice in a server: while one request reads a file, every other request waits.

The asynchronous version returns immediately with a **promise** — a placeholder for a value that does not exist yet:

```ts
const promise = readFile("big.json");
console.log("this runs FIRST");                          // the read is still in flight
const data = await promise;                              // ...and now we wait for it
console.log("this runs when the read finishes");
```

The event loop is what makes this work: your function is suspended, other work is processed, and when the I/O completes the continuation is scheduled to resume.

> **Python comparison.** Python's `asyncio` also has an event loop and coroutines, and `await` means roughly the same thing in both. The key difference in practice: in JavaScript the event loop is always running and `async` is viral through the whole ecosystem, whereas Python has a synchronous default that `asyncio` is layered onto. You will use `await` far more in JS than in Python.

---

## 2. Callbacks, and Why Promises Replaced Them

Before promises, the pattern was a callback:

```ts
readFile("a.json", (err, dataA) => {
  if (err) return handle(err);
  readFile("b.json", (err, dataB) => {
    if (err) return handle(err);
    writeFile("out.json", combine(dataA, dataB), (err) => {
      if (err) return handle(err);
      console.log("done");           // four levels deep, and error handling at every one
    });
  });
});
```

This is **callback hell**: the control flow is inverted, error handling is repeated at every level, and a `return` inside a callback does not return from the outer function. Promises flatten it:

```ts
try {
  const dataA = await readFile("a.json");
  const dataB = await readFile("b.json");
  await writeFile("out.json", combine(dataA, dataB));
  console.log("done");
} catch (err) {
  handle(err);                          // one place
}
```

The whole point of promises is that async code reads like sync code, including its error handling.

---

## 3. What a Promise Actually Is

A promise is an object in one of three states:

| State | Meaning |
|---|---|
| **pending** | the operation is still running |
| **fulfilled** | it succeeded, and has a value |
| **rejected** | it failed, and has a reason |

It settles **once**. A promise that has fulfilled cannot later reject, and attaching ten `.then` handlers to the same promise calls all ten with the same value.

```ts
const p = Promise.resolve(42);        // already fulfilled
const q = Promise.reject(new Error("nope"));   // already rejected

p.then((value) => console.log(value));         // 42
```

### Creating one

```ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readConfig(path: string): Promise<Config> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}
```

Use `resolve` for success and `reject` for failure. In practice you write `new Promise` rarely — most modern APIs return promises already — and this is the shape of the exception: wrapping a callback-based API, or a `setTimeout`.

> **You do not need `new Promise` to call an async function.** This is the most common piece of cargo-cult code in JavaScript:
>
> ```ts
> // ANTIPATTERN — wrapping a promise in another promise
> function getUser(id: string): Promise<User> {
>   return new Promise((resolve, reject) => {
>     fetchUser(id).then(resolve).catch(reject);
>   });
> }
>
> // Just return it
> function getUser(id: string): Promise<User> {
>   return fetchUser(id);
> }
> ```
>
> The wrapper adds a stack frame, swallows stack traces, and buys nothing.

---

## 4. `async` / `await`

`async` does two things: it makes the function return a promise automatically, and it enables `await` inside.

```ts
async function loadUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data as User;              // becomes the fulfilled value of the promise
}

// Equivalent with .then
function loadUserThen(id: string): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then((response) => response.json())
    .then((data) => data as User);
}
```

The two are the same thing. `await` is not a special runtime feature — it is `.then` with syntax that reads better.

**The number one rule: `await` pauses *this* function, and nothing else.** The rest of the program keeps running.

```ts
async function main(): Promise<void> {
  console.log("A");
  await delay(1000);
  console.log("C");                // one second later
}

main();
console.log("B");                  // runs immediately, before C
// A, B, ... C
```

### Async functions always return a promise

```ts
async function getValue(): Promise<number> {
  return 42;                       // NOT number — Promise<number>
}

const v1 = getValue();             // Promise<number>
const v2 = await getValue();       // number
```

This is the mistake that produces `Promise { 42 }` in a console log and `[object Promise]` in a string. If you see either, you forgot an `await`.

---

## 5. Errors

A rejected promise is an exception, and `try`/`catch` works — but only around an `await`:

```ts
async function loadUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as User;
  } catch (error) {
    console.error("failed to load user:", error);
    return null;
  }
}
```

Three things to internalise here.

**`fetch` does not reject on a 404 or a 500.** It rejects only on a network failure — DNS, connection refused, no route. An HTTP error status is a *successful* fetch of an error page. You must check `response.ok` yourself ([14_fetch_apis](../14_fetch_apis/lecture.md)). Almost everyone gets this wrong once.

**`error` is `unknown`, not `any`.** `useUnknownInCatchVariables` is part of `strict` ([21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) section 2), so you must narrow before using it:

```ts
catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("unknown error:", error);
  }
}
```

That is a good thing — the thrown value can be anything, including a string or `undefined`.

**A rejected promise with no handler crashes the process.** In Node, an unhandled rejection terminates the program by default:

```ts
async function boom(): Promise<void> {
  throw new Error("unhandled");
}

boom();                    // nothing catches this — the process exits with an error
```

Either `await` it, or attach a `.catch`:

```ts
boom().catch((err) => console.error(err));
```

This is why `void` before a floating promise is a smell — it *documents* that you are ignoring the result:

```ts
void boom();               // "I know this is unhandled" — acceptable for fire-and-forget,
                           // provided something inside handles its own errors
```

### The `return await` question

Inside a `try`, `return await` and `return` are **not** the same:

```ts
async function bad(): Promise<number> {
  try {
    return risky();          // no await — a rejection escapes the try
  } catch (error) {
    return -1;               // NEVER RUNS
  }
}

async function good(): Promise<number> {
  try {
    return await risky();    // awaited — a rejection is caught here
  } catch (error) {
    return -1;               // runs
  }
}
```

Outside a `try`, `return await` is redundant and linters flag it. Inside one, it is required. The rule: **`return await` when you want the `catch` to see the failure.**

---

## 6. Running Things in Parallel

`await` in sequence is a common accidental performance bug:

```ts
// SLOW — 3 seconds if each takes 1
const user = await fetchUser(id);
const posts = await fetchPosts(id);
const comments = await fetchComments(id);
```

Each waits for the previous, even though they do not depend on each other. Run them concurrently:

```ts
// FAST — about 1 second
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
]);

console.log(user, posts, comments);      // all three are typed individually
```

`Promise.all` preserves the order of the input array regardless of which finishes first, and TypeScript infers a **tuple** type when the argument is an array literal — so `user` is `User`, `posts` is `Post[]`, not a union.

### The four combinators

```ts
// all — wait for every one; reject as soon as ANY rejects
const results = await Promise.all([a(), b(), c()]);

// allSettled — wait for every one; never rejects. Use when partial failure is OK
const settled = await Promise.allSettled([a(), b(), c()]);
for (const result of settled) {
  if (result.status === "fulfilled") console.log(result.value);
  else console.error(result.reason);
}

// race — settle with the FIRST to settle, success or failure
const fastest = await Promise.race([a(), b()]);

// any — settle with the first to SUCCEED; rejects only if all fail
const firstOk = await Promise.any([a(), b()]);
```

| Method | Resolves when | Rejects when |
|---|---|---|
| `all` | all succeed | any rejects — immediately |
| `allSettled` | all settle | never |
| `race` | first settles | first settles as a rejection |
| `any` | first succeeds | all reject |

The practical one to know is `allSettled`, because it is how you avoid one failing request destroying the whole batch:

```ts
const users = await Promise.all(
  ids.map(async (id) => {
    try {
      return await fetchUser(id);
    } catch {
      return null;                     // or use allSettled instead
    }
  }),
);
```

### `await` inside `forEach` does nothing

The single most common async bug in JavaScript:

```ts
// BROKEN — forEach ignores the returned promises
ids.forEach(async (id) => {
  await save(id);                      // the loop does not wait
});
console.log("all saved");              // prints immediately

// Correct — a for...of loop awaits each in turn
for (const id of ids) {
  await save(id);
}
console.log("all saved");              // prints after the last one

// Or concurrently, when order does not matter
await Promise.all(ids.map((id) => save(id)));
```

`forEach` calls the callback and discards its return value. Since the callback is `async`, that return value is a promise nobody awaits. **`async` callbacks are only meaningful to `map`, `for...of`, and `Promise.all`** — never to `forEach`. The same trap exists for `await` inside a plain `function` that was not marked `async`.

---

## 7. Timeouts and Cancellation

`fetch` has no built-in timeout, and a hanging request hangs forever. The modern answer is `AbortController`:

```ts
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, ms);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);               // always clear it, success or failure
  }
}
```

The `finally` matters: without it a successful request leaves a timer pending, which keeps the Node process alive. The `signal` can also be triggered by anything else — a user pressing cancel, a route handler being torn down — which is why `AbortController` is the general answer rather than a timeout helper.

`AbortError` is what you catch:

```ts
try {
  await fetchWithTimeout(url, 5000);
} catch (error) {
  if (error instanceof Error && error.name === "AbortError") {
    console.error("request timed out");
  }
}
```

`Promise.race` with a timer is the older technique, and it is worse: the request keeps running in the background even after you have given up on it.

---

## 8. Top-Level Await

In an ES module you can `await` at the top level:

```ts
// main.ts
import { loadConfig } from "./config.js";

const config = await loadConfig();        // legal at module top level
console.log(config.port);
```

This requires `"type": "module"` in `package.json` and a `module` setting of `ES2022` or later ([21_tsconfig_deep_dive](../21_tsconfig_deep_dive/lecture.md) section 4). In CommonJS it is a syntax error.

Use it sparingly. Top-level await makes the module's own evaluation asynchronous, which changes the order in which importing modules initialise and can produce confusing startup bugs. For a small script it is convenient and fine; for a library, export an `async function init()` instead.

---

## 9. Ordering: Microtasks and Macrotasks

Not required to write working code, but it explains why the output order surprises you:

```ts
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// 1, 4, 3, 2
```

The rule: **all synchronous code runs first, then all microtasks (promises), then macrotasks (timers, I/O).**

- `console.log("1")` and `"4"` — synchronous, run immediately
- `"3"` — a `.then` callback, queued as a microtask, runs after the current synchronous block
- `"2"` — a `setTimeout` with 0ms, queued as a macrotask, runs after all microtasks drain

So `setTimeout(fn, 0)` does **not** mean "run this now". It means "run this after everything currently queued, including every promise callback". If you have ever seen a promise resolve "before" a zero-delay timer, this is why.

---

## 10. Putting It Together

An async function with all the pieces — error handling, a timeout, concurrency, and cleanup:

```ts
interface Result<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

async function loadAll(urls: string[]): Promise<Result<unknown>[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 10_000);

  try {
    const settled = await Promise.allSettled(
      urls.map(async (url) => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }
        return response.json();
      }),
    );

    return settled.map((outcome) =>
      outcome.status === "fulfilled"
        ? { ok: true, value: outcome.value }
        : { ok: false, error: String(outcome.reason) },
    );
  } finally {
    clearTimeout(timer);          // runs whether we returned or threw
  }
}
```

Every element from this lecture is in there: `allSettled` so one failure does not kill the batch, `response.ok` because `fetch` will not reject, `AbortController` for the timeout, `finally` for the cleanup, and a `Result` type so the caller gets data rather than an exception.

---

## 11. The Mistakes, in One List

| Mistake | Symptom |
|---|---|
| Forgetting `await` | `Promise { <pending> }` or `[object Promise]` in the output |
| `await` in `forEach` | the loop finishes before the work does |
| Not checking `response.ok` | a 404 body is parsed as if it were data |
| `return` without `await` inside `try` | the `catch` never runs |
| No handler on a promise | the process exits with an unhandled rejection |
| Sequential `await`s that could be concurrent | needlessly slow |
| `Promise.all` where partial failure is expected | one failure discards the successes |
| Not clearing a `setTimeout` | the process hangs after the work is done |
| `new Promise` around an existing promise | lost stack traces, no benefit |
| `async` in a `constructor` | a constructor cannot return a promise — use a static factory |

That last one is worth spelling out:

```ts
class Client {
  private constructor(private data: Config) {}

  // A static async factory, because `new` cannot await
  static async create(url: string): Promise<Client> {
    const response = await fetch(url);
    const data = (await response.json()) as Config;
    return new Client(data);
  }
}

const client = await Client.create("/api/config");
```

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder. It uses only what is built into Node, so everything runs offline — the "delays" are `setTimeout`.

1. Write `delay(ms)` and `await` it, printing before and after.
2. Write an `async` function; log what it returns without `await`, then with.
3. Compare sequential `await` against `Promise.all` and time both.
4. Use `Promise.allSettled` on one success and one failure, and print each status.
5. Use `Promise.race` and `Promise.any` on the same delays and compare.
6. Break the `forEach` loop, fix it with `for...of`, then fix it with `Promise.all`.
7. Show `return` vs `return await` inside a `try`, and observe which `catch` runs.
8. Show the microtask/macrotask ordering: `console.log`, `setTimeout(0)`, and `.then`.
9. Write a `withTimeout` using `AbortController` and a function that always hangs.
10. Attach two `.then` handlers to one resolved promise and show both receive the same value.

---

## 📚 Resources

- **Reference:** [MDN — Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- **Reference:** [MDN — `async function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- **Reference:** [MDN — `Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- **Reference:** [MDN — `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- **Docs:** [Node.js — The Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — the definitive explanation
- **Article:** [JavaScript Visualized: Promises & Async/Await](https://lydiahallie.com/blog/2020/09/21/async-await) — Lydia Hallie; the clearest diagrams anywhere
- **Talk:** [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ) — Philip Roberts; still the best introduction, ten years on
