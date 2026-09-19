# Node_exec_path_check

Source: node_exec_path_check

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that reports where the Node runtime is executing from and how module resolution finds the current file. Return a list with two strings: the absolute path of the Node executable, read from `process.execPath`, and the absolute path of the current module, derived from `import.meta.url` with the `node:path` helpers `path.dirname` and `path.join`.

Expected function
```ts
function node_exec_path(): string[] {
  return [];
}
```


Here is a possible program to test your function :
```ts
const [execPath, modulePath] = node_exec_path();
console.log(typeof execPath === "string" && execPath.length > 0);
console.log(typeof modulePath === "string" && modulePath.length > 0);
```

And its output :
```text
true
true
```
