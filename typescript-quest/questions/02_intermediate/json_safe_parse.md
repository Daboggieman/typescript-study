# Json_safe_parse

Source: json_safe_parse

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that attempts to parse a JSON string with `JSON.parse`, catching the error and returning the string `"INVALID JSON"` instead of crashing if parsing fails.

Expected function
```ts
function safe_parse(json_string: string): unknown {
  return null;
}
```


Here is a possible program to test your function :
```ts
console.log(safe_parse('{"valid": true}'));
console.log(safe_parse("{not valid json}"));
```

And its output :
```text
{ valid: true }
INVALID JSON
```
