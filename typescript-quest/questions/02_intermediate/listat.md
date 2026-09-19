# Listat

Source: listat

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that returns the node at a given position in a linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_at(head: ListNode | null, position: number): ListNode | null {
  return null;
}
```


Here is a possible program to test your function :
```ts
type ListNode = { data: number; next: ListNode | null };

const linked_list: ListNode | null = { data: 1, next: { data: 2, next: { data: 3, next: null } } };
console.log(list_at(linked_list, 1)?.data);
```

And its output :
```text
2
```
