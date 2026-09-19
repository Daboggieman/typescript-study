# List_reverse

Source: list_reverse

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that reverses the order of nodes in a linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_reverse(head: ListNode | null): ListNode | null {
  return null;
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

const linked_list: ListNode | null = { data: 1, next: { data: 2, next: { data: 3, next: null } } };
console.log(toArray(list_reverse(linked_list)));
```

And its output :
```text
[ 3, 2, 1 ]
```
