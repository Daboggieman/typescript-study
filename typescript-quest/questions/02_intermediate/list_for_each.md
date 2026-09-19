# List_for_each

Source: list_for_each

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that applies a function to every node in a linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_for_each(head: ListNode | null, action: (value: number) => number): ListNode | null {
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
console.log(toArray(list_for_each(linked_list, (x) => x * 2)));
```

And its output :
```text
[ 2, 4, 6 ]
```
