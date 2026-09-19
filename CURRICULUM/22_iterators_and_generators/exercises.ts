// Exercise 22: Iterators & Generators
// Run this file with: npm run ex CURRICULUM/22_iterators_and_generators/exercises.ts
// Typecheck with:    npm run check


// TODO: Exercise 1
// Walk an array MANUALLY with the iteration protocol. No `for...of`.
// Print each { value, done } until it reports done.
const items = ["a", "b", "c"];

const manual = items[Symbol.iterator]();
console.log("manual:", manual.next(), manual.next(), manual.next(), manual.next());


// TODO: Exercise 2
// Run the same array through `for...of`, spread, and destructuring.
// All three use the same protocol.
console.log("spread:", [...items]);
const [firstItem] = items;
console.log("destructured:", firstItem);


// TODO: Exercise 3
// Make `Countdown` iterable by implementing `[Symbol.iterator]`.
// Then `for...of` it, spread it, and destructure it — all should work.
export class Countdown {
  constructor(private start: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;

    return {
      next(): IteratorResult<number> {
        // TODO: return { value: current--, done: false } until current < 0
        return { value: undefined, done: true };
      },
    };
  }
}

const countdown = new Countdown(3);
console.log("countdown:", [...countdown]);
console.log("countdown again:", [...countdown]);   // must give the same answer


// TODO: Exercise 4
// `range(start, end)` as a generator.
export function* range(start: number, end: number): Generator<number> {
  // TODO: yield each number from start up to (not including) end
}


// TODO: Exercise 5
// An INFINITE generator. It never terminates — and that is fine, because
// nothing consumes more than `take` asks for.
export function* naturalNumbers(): Generator<number> {
  // TODO: yield 0, 1, 2, 3, ... forever
}


// TODO: Exercise 6
// `take` is what stops an infinite generator. Note the `return` — it ends
// the generator, it does not yield one more value.
export function* take<T>(source: Iterable<T>, n: number): Generator<T> {
  // TODO: count to n, yielding each item, then return
}


// TODO: Exercise 7
// Fibonacci, as an infinite generator. A generator keeps its loop state
// between yields, which is what makes this work.
export function* fibonacci(): Generator<number> {
  // TODO
}


// TODO: Exercise 8
// `yield*` delegates to another iterable. Flatten these two arrays into
// one sequence without a nested loop.
export function* flattened(): Generator<number> {
  // TODO: yield* the first array, then yield* the second
}

const odds = [1, 3, 5];
const evens = [2, 4, 6];


// TODO: Exercise 9
// The accumulator is implemented for you — the exercise is to DRIVE it.
// Call `next()` four times, passing a value each time after the first.
// Note that the first `next()` argument is always discarded.
export function* accumulator(): Generator<number, void, number> {
  let total = 0;
  while (true) {
    const amount = yield total;
    total += amount;
  }
}

const acc = accumulator();
console.log("acc:", acc.next(), acc.next(10), acc.next(5), acc.next(100));


// TODO: Exercise 10
// A generator as a state machine. Cycle red → green → yellow forever.
export function* trafficLight(): Generator<"red" | "green" | "yellow"> {
  // TODO
}


// TODO: Exercise 11
// An ASYNC generator. Values arrive over time, so it must be consumed with
// `for await...of`, not `for...of`.
export async function* withDelay<T>(itemsIn: T[], ms: number): AsyncGenerator<T> {
  // TODO: await a setTimeout promise, then yield each item
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });


// TODO: Exercise 12
// Prove a generator can only be consumed ONCE — the second spread is empty.
// Explain why in a comment (hint: the generator object is its own iterator).
export function* three(): Generator<number> {
  yield 1;
  yield 2;
  yield 3;
}

const gen = three();
console.log("first pass:", [...gen]);
console.log("second pass:", [...gen]);


// ---------------------------------------------------------------------------
// Everything above is a stub until you fill it in, so the calls below are
// intentionally commented out. Uncomment each line as you finish the
// exercise it belongs to.
// ---------------------------------------------------------------------------

// console.log("range:", [...range(1, 5)]);
// console.log("take naturals:", [...take(naturalNumbers(), 5)]);
// console.log("take fibonacci:", [...take(fibonacci(), 10)]);
// console.log("flattened:", [...flattened()]);

// const light = trafficLight();
// console.log("light:", light.next().value, light.next().value, light.next().value, light.next().value);

// void (async () => {
//   for await (const value of withDelay(["a", "b", "c"], 100)) {
//     console.log("async:", value);
//   }
// })();
