# Sort_list_insert

Source: sort_list_insert

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that inserts an integer into a sorted linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function sort_list_insert(head: ListNode | null, value: number): ListNode | null {
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

const linked_list: ListNode | null = { data: 1, next: { data: 3, next: null } };
console.log(toArray(sort_list_insert(linked_list, 2)));
```

And its output :
```text
[ 1, 2, 3 ]
```
