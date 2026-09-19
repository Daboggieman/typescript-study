# Lecture 14: Fetch & APIs

Python's `requests` makes HTTP look simple: `requests.get(url).json()`. JavaScript's `fetch` is the built-in equivalent — it is now a global in Node as well as browsers — but it has **two traps that `requests` does not have**, and this lecture is largely about those.

---

## 1. Your First Request

```ts
const response = await fetch("https://api.github.com/users/octocat");
const data = await response.json();

console.log(data.name);
```

Two `await`s, and both are necessary. They do different things:

| | The first `await fetch(...)` | The second `await response.json()` |
|---|---|---|
| Waits for | the **status line and headers** | the **body** |
| Gives you | a `Response` object | the parsed data |
| Cost | fast — server answered | slow — the whole body arrives and is parsed |

The body is a **stream**. `fetch` resolves as soon as the headers arrive, which means you can check the status and abort before downloading a 500 MB body. `response.json()` reads the stream to completion and parses it.

---

## 2. Trap One: `fetch` Does Not Reject on HTTP Errors

```ts
const response = await fetch("https://api.github.com/users/does-not-exist");
// NO exception. NO rejection. We are here, and everything looks fine.

console.log(response.status);      // 404
console.log(response.ok);          // false
```

`fetch` rejects only on **network-level** failure — DNS failure, no connection, TLS error, or an aborted request. A `404` or `500` is a *successful* HTTP exchange, so `fetch` resolves normally. Coming from `requests` (where `raise_for_status()` is one line and often forgotten) or from most other languages, this is the single biggest surprise.

> **`fetch` resolves when the server answered, not when it answered well.** Every single call site must check `response.ok`.

```ts
async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }

  return (await response.json()) as T;
}
```

Write that helper once and use it everywhere. It converts the silent 404 into a thrown error, which is what you actually want and what every other HTTP client does by default.

### Status codes

| Range | Meaning | In a `try`/`catch` |
|---|---|---|
| `200`–`299` | success | resolves |
| `3xx` | redirect | **`fetch` follows them automatically** |
| `400`–`499` | client error — your fault | resolves, `ok` is false |
| `500`–`599` | server error — their fault | resolves, `ok` is false |

```ts
switch (response.status) {
  case 200: break;
  case 401: throw new Error("not authenticated");
  case 403: throw new Error("not allowed");
  case 404: throw new Error("not found");
  case 429: throw new Error("rate limited — slow down");
  default:
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
```

---

## 3. Trap Two: There Are No Types in an HTTP Response

```ts
const response = await fetch(url);
const data = await response.json();      // data is `any`

data.user.nmae.toUpperCase();            // compiles fine. Explodes at runtime.
```

`response.json()` returns `Promise<any>` — the same hole as `JSON.parse` from [10_files_json](../10_files_json/lecture.md), and for the same reason: the bytes arrived from outside your program and no type system can know their shape.

Worse, the generic form is a *lie you tell the compiler*:

```ts
const data = (await response.json()) as User;    // this ASSERTS, it does not CHECK
data.age;                                        // typed as number, could be anything
```

`as User` is an assertion, not a validation. It silences the compiler without verifying anything. If the API changes a field name, your code compiles and then breaks in production.

The honest pattern:

```ts
const raw: unknown = await response.json();

if (!isUser(raw)) {
  throw new Error(`unexpected response shape: ${JSON.stringify(raw).slice(0, 200)}`);
}
// `raw` is now a User, and something actually checked
```

The `isUser` predicate is the one from [10_files_json](../10_files_json/lecture.md) section 6. Real projects use a schema library — `zod`, `valibot` — which generates the validator and the type from one declaration:

```ts
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().nonnegative(),
});

const user = UserSchema.parse(await response.json());   // throws on a bad shape
type User = z.infer<typeof UserSchema>;                 // the type comes free
```

This repo stays dependency-free, so the exercises use hand-written predicates. Know that the library route exists and is what you should reach for on real work.

---

## 4. Sending Data

```ts
// POST with a JSON body
const response = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Ada", age: 30 }),
});

if (!response.ok) throw new Error(`HTTP ${response.status}`);
const created = await response.json();
```

Three details that are easy to get wrong:

1. **`Content-Type: application/json`** is required, or most servers will not parse the body. `JSON.stringify` does not set it for you.
2. **`body` must be a string, `FormData`, or a stream** — not an object. Passing an object directly sends `[object Object]`.
3. **`GET` and `HEAD` cannot have a body.** Sending one is silently ignored or rejected.

### Authentication

```ts
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
});
```

**Never hardcode a key.** Put it in an environment variable, and keep `.env` in `.gitignore`:

```ts
const token = process.env.API_TOKEN;
if (!token) throw new Error("API_TOKEN is not set");
```

```bash
API_TOKEN=abc123 npm run ex script.ts              # inline, for one run
echo "API_TOKEN=abc123" >> .env                    # a file, gitignored
```

Node 20.6+ can load a `.env` file natively:

```ts
process.loadEnvFile();       // Node 21.7+ / 20.12+
```

> **A key that reaches GitHub is compromised.** Even if you delete the commit, it stays in the history and in every clone and fork. Rotate the key immediately, then remove it. Git history is not a place secrets can be hidden.

---

## 5. Timeouts and Cancellation

`fetch` has **no timeout option** and no default timeout — a hanging request hangs your program indefinitely. You need `AbortController`:

```ts
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);        // always clear, or the timer keeps the process alive
  }
}

try {
  const response = await fetchWithTimeout("https://example.com", 5000);
} catch (error) {
  if (error instanceof Error && error.name === "AbortError") {
    console.error("request timed out");
  } else {
    throw error;
  }
}
```

The same mechanism cancels a request in flight, which matters for a search-as-you-type box: abort the previous request when a new keystroke arrives.

> **Remember `clearTimeout` in a `finally`.** Without it, a pending timer holds the event loop open and your script refuses to exit — a confusing hang with no error.

---

## 6. What Actually Fails

Everything a network call can do to you:

| Failure | What `fetch` does |
|---|---|
| DNS lookup fails | **rejects** with `TypeError: fetch failed` |
| Connection refused | **rejects** with `TypeError: fetch failed` |
| TLS certificate invalid | **rejects** |
| Request timed out (with a signal) | **rejects** with `AbortError` |
| 404, 500, 429 | **resolves** with `ok: false` |
| Body is not valid JSON | `response.json()` **rejects** with a `SyntaxError` |
| Body is valid JSON but the wrong shape | **nothing** — you must validate |
| Slow response | waits forever, unless you set a timeout |

Note the second-to-last row: `response.json()` throwing is a *different* failure from `fetch` throwing, and they happen at different points. A `try`/`catch` around both is usually what you want:

```ts
try {
  const response = await fetchWithTimeout(url, 5000);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const raw: unknown = await response.json();
  if (!isUser(raw)) throw new Error("unexpected shape");
  return raw;
} catch (error) {
  // network failure, HTTP failure, JSON failure and shape failure all land here
  throw new Error(`Could not load user from ${url}`, { cause: error });
}
```

The `{ cause: error }` preserves the original reason — [12_modules_and_errors](../12_modules_and_errors/lecture.md) section 9.

---

## 7. Async, Briefly

This lecture uses `async`/`await` throughout. The full treatment is [25_async_and_promises](../25_async_and_promises/lecture.md), but the minimum to read this code:

```ts
async function load(): Promise<string> {
  const r = await fetch(url);         // `await` pauses until the promise settles
  return r.statusText;                // returning from an async fn wraps it in a Promise
}

load().then(console.log);             // or await it from another async context
load().catch(console.error);          // a rejected promise needs a .catch or a try/catch
```

Two rules that prevent most async bugs:

- **`await` every promise you care about.** An un-awaited rejected promise becomes an unhandled rejection, which in Node crashes the process.
- **Never `await` inside `forEach`.** It does not wait. Use `for...of` for sequential work, or `Promise.all` for concurrent work ([07_loops](../07_loops/lecture.md) section 7).

---

## 8. Rate Limits and Being a Good Citizen

Public APIs limit requests, and they tell you the rules in the response headers:

```ts
const remaining = response.headers.get("x-ratelimit-remaining");
const resetAt = response.headers.get("x-ratelimit-reset");    // a Unix timestamp in seconds

if (remaining !== null && Number(remaining) < 5) {
  console.warn(`only ${remaining} requests left`);
}
```

`429 Too Many Requests` means you exceeded the limit. The correct response is to back off — wait, then retry, with increasing delays — not to retry immediately. A retry loop with no delay turns a temporary block into a permanent one.

```ts
async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(url);
    if (response.ok) return response;
    if (response.status === 429 || response.status >= 500) {
      const delay = 2 ** i * 200;                   // 200ms, 400ms, 800ms
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return response;                                 // a 404 will not improve by retrying
  }
  throw new Error(`gave up after ${attempts} attempts`);
}
```

Note the distinction: retry `429` and `5xx` (transient), never retry `404` or `400` (permanent). Retrying a permanent failure is how a small bug becomes a traffic spike.

---

## 🧠 Try It Yourself

These exercises need network access. Every fetch will fail gracefully in a sandbox — write the code anyway, and the error handling is the exercise.

Open `exercises.ts` in this folder:

1. Fetch `https://api.github.com/users/octocat` and print the `name` and `public_repos` fields.
2. Fetch a user that does not exist. Confirm **no exception is thrown**, then print `response.status` and `response.ok`.
3. Write `fetchJSON<T>(url)` that throws on `!response.ok`, and use it for both URLs above.
4. Fetch and print the JSON **without** validating, then write an `isRepo` predicate and validate the same response.
5. Send a POST to `https://httpbin.org/post` with a JSON body and print what comes back. Try it once without the `Content-Type` header and compare.
6. Write `fetchWithTimeout` with `AbortController`. Point it at `https://httpbin.org/delay/10` with a 2-second timeout and catch the abort.
7. Fetch the GitHub rate-limit endpoint and print the remaining requests from the headers.
8. Wrap a failure so the original error survives as `cause`, and prove it by printing `err.cause`.

---

## 📚 Resources

- **MDN:** [Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) — the canonical guide
- **MDN:** [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) — every property and method
- **Docs:** [Node.js — Global `fetch`](https://nodejs.org/api/globals.html#fetch)
- **MDN:** [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — timeouts and cancellation
- **Article:** [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — the full list, worth one read-through
- **Docs:** [zod](https://zod.dev/) — the schema library recommended in section 3
