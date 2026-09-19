# Node_version_check

Source: node_version_check

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that returns true if the running Node runtime is at least the given major version, and false otherwise. Read the runtime version from `process.versions.node` (a dotted string such as "20.11.1") and the V8 engine version from `process.versions.v8`.

Expected function
```ts
function node_version_check(minimum_major: number): boolean {
  return false;
}
```


Here is a possible program to test your function :
```ts
console.log(typeof node_version_check(1) === "boolean");
console.log(node_version_check(1));
```

And its output :
```text
true
true
```
