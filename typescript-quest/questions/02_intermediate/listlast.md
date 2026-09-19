# Listlast

Source: listlast

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that returns the last value stored in a linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_last(head: ListNode | null): number | null {
  return null;
}
```


Here is a possible program to test your function :
```ts
type ListNode = { data: number; next: ListNode | null };

const linked_list: ListNode | null = { data: 1, next: { data: 2, next: { data: 3, next: null } } };
console.log(list_last(linked_list));
```

And its output :
```text
3
```
