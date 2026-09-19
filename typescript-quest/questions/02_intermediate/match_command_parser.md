# Match_command_parser

Source: match_command_parser

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Using a `switch` statement with array destructuring, write a function that interprets simple text-adventure commands given as arrays of strings: `["go", direction]` -> `"Moving {direction}"`, `["take", item]` -> `"Taking {item}"`, `["look"]` -> `"Looking around"`, anything else -> `"I don't understand"`.

Expected function
```ts
function handle_command(command: string[]): string {
  return "";
}
```


Here is a possible program to test your function :
```ts
console.log(handle_command(["go", "north"]));
console.log(handle_command(["take", "sword"]));
console.log(handle_command(["look"]));
console.log(handle_command(["dance"]));
```

And its output :
```text
Moving north
Taking sword
Looking around
I don't understand
```
