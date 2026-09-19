# Map

Source: map

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that applies a predicate to each item and returns a list of booleans.

Expected function
```ts
function map_values(predicate: (value: number) => boolean, values: number[]): boolean[] {
  return [];
}
```


Here is a possible program to test your function :
```ts
console.log(map_values((x) => x > 2, [1, 2, 3]));
```

And its output :
```text
[ false, false, true ]
```
