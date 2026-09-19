# Collatz

Source: collatz

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that returns the number of steps needed to reach 1 using the Collatz sequence. If number is even divide by 2, if number is odd multiply number by 3 and add 1 and repeat the sequence again till the final answer is 1.

Expected function
```ts
function collatz_countdown(start: number): number {
  return 0;
}
```


Here is a possible program to test your function :
```ts
console.log(collatz_countdown(12));
```

And its output :
```text
9
```
