# Package_json_dependency_count

Source: package_json_dependency_count

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that parses the contents of a `package.json`-style JSON string into an object and returns the number of entries in its `dependencies` field.

Expected function
```ts
function package_json_dependency_count(text: string): number {
  return 0;
}
```


Here is a possible program to test your function :
```ts
const pkg = '{"name": "app", "dependencies": {"express": "^4.18.2", "zod": "^3.22.4", "vitest": "^2.1.8"}}';
console.log(package_json_dependency_count(pkg));
```

And its output :
```text
3
```
