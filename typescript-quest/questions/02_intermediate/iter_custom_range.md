# Iter_custom_range

Source: iter_custom_range

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Implement a `CustomRange` class that mimics the built-in `range(start, stop, step)` by implementing the iterator protocol (`[Symbol.iterator]` and `next`), without relying on a built-in range helper internally.

Expected function
```ts
class CustomRange implements Iterable<number> {
  constructor(start: number, stop: number, step: number = 1) {}

  [Symbol.iterator](): Iterator<number> {
    return {
      next(): IteratorResult<number> {
        return { value: 0, done: true };
      },
    };
  }
}
```


Here is a possible program to test your function :
```ts
console.log([...new CustomRange(0, 10, 2)]);
```

And its output :
```text
[ 0, 2, 4, 6, 8 ]
```
