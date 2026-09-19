# List_size

Source: list_size

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that returns the number of nodes in a linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_size(head: ListNode | null): number {
  return 0;
}
```


Here is a possible program to test your function :
```ts
type ListNode = { data: number; next: ListNode | null };

const linked_list: ListNode | null = { data: 1, next: { data: 2, next: { data: 3, next: null } } };
console.log(list_size(linked_list));
```

And its output :
```text
3
```
