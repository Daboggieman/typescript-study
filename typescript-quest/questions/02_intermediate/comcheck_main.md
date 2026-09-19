# Comcheck_main

Source: comcheck_main

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a program that prints an alert message when one of a few specific arguments is passed.

Expected function
```ts
function main(): void {
  console.log("");
}
```


Here is a possible program to test your function :
```ts
process.argv = ["program", "-a"];
main();
```

And its output :
```text
alert

```
