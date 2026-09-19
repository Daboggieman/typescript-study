# Match_http_status

Source: match_http_status

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Using a `switch` statement (not if/else if), write a function that returns a short description for common HTTP status codes: 200 -> "OK", 201 -> "Created", 404 -> "Not Found", 500 -> "Server Error", anything else -> "Unknown".

Expected function
```ts
function describe_status(code: number): string {
  return "";
}
```


Here is a possible program to test your function :
```ts
console.log(describe_status(200));
console.log(describe_status(404));
console.log(describe_status(999));
```

And its output :
```text
OK
Not Found
Unknown
```
