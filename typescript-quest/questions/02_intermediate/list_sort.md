# List_sort

Source: list_sort

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that sorts a linked list of integers.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_sort(head: ListNode | null): ListNode | null {
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

const linked_list: ListNode | null = { data: 3, next: { data: 1, next: { data: 2, next: null } } };
console.log(toArray(list_sort(linked_list)));
```

And its output :
```text
[ 1, 2, 3 ]
```
