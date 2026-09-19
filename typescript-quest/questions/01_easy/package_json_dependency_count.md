# Package_json_dependency_count

Source: package_json_dependency_count

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that parses a `package.json` string with `JSON.parse` and returns the number of entries in its `dependencies` object (0 when there is no `dependencies` key).

Expected function
```ts
function package_json_dependency_count(content: string): number {
  return 0;
}
```


Here is a possible program to test your function :
```ts
console.log(package_json_dependency_count('{"dependencies": {"typescript": "^5.0.0", "ts-node": "^10.0.0"}}'));
console.log(package_json_dependency_count('{}'));
```

And its output :
```text
2
0
```
