# Math_gcd_lcm

Source: math_gcd_lcm

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that returns both the greatest common divisor and least common multiple of two positive integers as a tuple `[gcd, lcm]`. Recall that `lcm(a, b) = (a * b) / gcd(a, b)`.

Expected function
```ts
function gcd_lcm(a: number, b: number): [number, number] {
  return [0, 0];
}
```


Here is a possible program to test your function :
```ts
console.log(gcd_lcm(48, 18));
console.log(gcd_lcm(7, 5));
```

And its output :
```text
[ 6, 144 ]
[ 1, 35 ]
```
