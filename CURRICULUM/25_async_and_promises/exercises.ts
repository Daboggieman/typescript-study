// Exercise 25: Async & Promises
// Run this file with: npm run ex CURRICULUM/25_async_and_promises/exercises.ts
// Typecheck with:    npm run check
//
// Everything here is offline: the "slow" operations are setTimeout calls, not
// network requests. Read the console output carefully — the ORDER is the
// lesson in half of these exercises.
//
// TypeScript note: top-level `await` is legal only in an ES module, and this
// file wraps its async work in an IIFE instead so the ordering stays obvious.


// A promise you will use throughout. Note that it resolves — it does not
// return a value. `Promise<void>`.
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// A stand-in for a slow operation that sometimes fails.
export async function risky(shouldFail: boolean): Promise<number> {
  await delay(50);
  if (shouldFail) {
    throw new Error("something went wrong");
  }
  return 42;
}


// TODO: Exercise 1
// Await a delay and print before and after. Note that a separate `console.log`
// placed after the call but outside the async function runs FIRST.
export async function ex1(): Promise<void> {
  console.log("ex1: before");
  await delay(50);
  console.log("ex1: after");
}


// TODO: Exercise 2
// The classic. Print what an async function returns WITHOUT await, then with.
// One of them is `Promise { 42 }`.
export async function getValue(): Promise<number> {
  return 42;
}

export async function ex2(): Promise<void> {
  const withoutAwait = getValue();
  const withAwait = await getValue();
  console.log("ex2 without await:", withoutAwait);
  console.log("ex2 with await:", withAwait);
}


// TODO: Exercise 3
// Sequential vs concurrent. Time both and compare — sequential should take
// about three times as long.
export async function ex3Sequential(): Promise<void> {
  const start = Date.now();
  await delay(100);
  await delay(100);
  await delay(100);
  console.log("ex3 sequential:", Date.now() - start, "ms");
}

export async function ex3Concurrent(): Promise<void> {
  const start = Date.now();
  await Promise.all([delay(100), delay(100), delay(100)]);
  console.log("ex3 concurrent:", Date.now() - start, "ms");
}


// TODO: Exercise 4
// `allSettled` never rejects. Print the status and value/reason of each.
export async function ex4(): Promise<void> {
  const results = await Promise.allSettled([risky(false), risky(true), risky(false)]);
  for (const result of results) {
    // TODO: if result.status === "fulfilled" print result.value,
    // otherwise print String(result.reason)
  }
}


// TODO: Exercise 5
// `all` versus `any` versus `race` on the same three promises.
// Uncomment the `Promise.all` line and note that it rejects on the first
// failure — discarding the successes entirely.
export async function ex5(): Promise<void> {
  // try {
  //   await Promise.all([risky(false), risky(true)]);
  // } catch (error) {
  //   console.log("ex5 all rejected:", String(error));
  // }

  const settledFirst = await Promise.race([delay(20), delay(80)]);
  console.log("ex5 race:", settledFirst);

  const firstSuccess = await Promise.any([risky(true), risky(false)]);
  console.log("ex5 any:", firstSuccess);
}


// TODO: Exercise 6
// THE `forEach` BUG. The broken version prints "done" immediately, because
// forEach discards the promises its async callback returns.
// The fixed versions actually wait. Compare all three outputs.
export const ids = [1, 2, 3];

export async function save(id: number): Promise<void> {
  await delay(30);
  console.log("  saved", id);
}

export async function ex6Broken(): Promise<void> {
  ids.forEach(async (id) => {
    await save(id);
  });
  console.log("ex6 broken: done (but nothing is saved yet)");
}

export async function ex6Sequential(): Promise<void> {
  for (const id of ids) {
    await save(id);
  }
  console.log("ex6 sequential: done");
}

export async function ex6Parallel(): Promise<void> {
  await Promise.all(ids.map((id) => save(id)));
  console.log("ex6 parallel: done");
}


// TODO: Exercise 7
// `return` vs `return await` inside a try. One of these catches the rejection
// and the other does not — the catch block only runs for one of them.
export async function ex7Bad(): Promise<number> {
  try {
    return risky(true);            // no await
  } catch (error) {
    console.log("ex7Bad catch:", error);
    return -1;
  }
}

export async function ex7Good(): Promise<number> {
  try {
    return await risky(true);      // awaited
  } catch (error) {
    console.log("ex7Good catch:", "caught");
    return -1;
  }
}


// TODO: Exercise 8
// Microtasks versus macrotasks. Predict the order BEFORE you run it.
// Correct order is: 1, 4, 3, 2.
export function ex8(): void {
  console.log("ex8: 1");
  setTimeout(() => {
    console.log("ex8: 2 (macrotask — setTimeout 0)");
  }, 0);
  Promise.resolve().then(() => {
    console.log("ex8: 3 (microtask — .then)");
  });
  console.log("ex8: 4");
}


// TODO: Exercise 9
// A timeout with AbortController. `neverResolves` never settles, so the
// timeout is the only thing that can end the wait.
export function neverResolves(): Promise<void> {
  return new Promise(() => {
    /* deliberately never calls resolve or reject */
  });
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  // TODO: race the promise against a timer that rejects with an error whose
  // `name` is "AbortError". The timer must be cleared either way.
  void promise;
  void ms;
  throw new Error("TODO: withTimeout is not implemented yet");
}

export async function ex9(): Promise<void> {
  try {
    await withTimeout(neverResolves(), 100);
  } catch (error) {
    console.log("ex9:", error instanceof Error ? error.name : error);
  }
}


// TODO: Exercise 10
// A promise settles once and every handler sees the same value.
// Attach three `.then` handlers and confirm all three fire with 42.
export function ex10(): Promise<void> {
  const settled = Promise.resolve(42);
  return settled.then((value) => {
    console.log("ex10 handler 1:", value);
  });
}


// ---------------------------------------------------------------------------
// These run in order, each awaiting the previous so the output stays readable.
// ---------------------------------------------------------------------------
void (async () => {
  console.log("--- start ---");
  console.log("main: this prints BEFORE ex1's 'after', even though ex1 is called first");

  await ex1();
  await ex2();
  await ex3Sequential();
  await ex3Concurrent();
  await ex4();
  await ex5();

  await ex6Broken();
  await ex6Sequential();
  console.log("main: note that the broken one's saves appear AFTER this line");
  await delay(150);

  await ex6Parallel();

  // ex7Bad's own catch NEVER RUNS — the rejection escapes to the caller.
  try {
    console.log("ex7Bad returned:", await ex7Bad());
  } catch (error) {
    console.log("ex7Bad rejected at the CALLER:", String(error));
  }
  console.log("ex7Good returned:", await ex7Good());

  ex8();
  await ex9();
  await ex10();

  console.log("--- end ---");
})();
