# Listfind

Source: listfind

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that finds a value in a linked list using a custom comparison function.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_find(
  head: ListNode | null,
  value: number,
  compare: (a: number, b: number) => boolean,
): boolean {
  return false;
}
```


Here is a possible program to test your function :
```ts
type ListNode = { data: number; next: ListNode | null };

const linked_list: ListNode | null = { data: 1, next: { data: 2, next: { data: 3, next: null } } };
console.log(list_find(linked_list, 2, (a, b) => a === b));
```

And its output :
```text
true
```
