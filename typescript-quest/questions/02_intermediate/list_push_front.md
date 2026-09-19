# List_push_front

Source: list_push_front

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that adds a node to the beginning of a linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_push_front(head: ListNode | null, data: number): ListNode {
  return { data, next: null };
}
```


Here is a possible program to test your function :
```ts
type ListNode = { data: number; next: ListNode | null };

function toArray(head: ListNode | null): number[] {
  const values: number[] = [];
  for (let node = head; node !== null; node = node.next) {
    values.push(node.data);
  }
  return values;
}

let linked_list: ListNode | null = { data: 1, next: { data: 2, next: null } };
linked_list = list_push_front(linked_list, 0);
console.log(toArray(linked_list));
```

And its output :
```text
[ 0, 1, 2 ]
```
