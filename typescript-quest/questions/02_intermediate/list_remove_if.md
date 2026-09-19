# List_remove_if

Source: list_remove_if

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that removes all nodes matching a given value.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_remove_if(head: ListNode | null, value: number): ListNode | null {
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

let linked_list: ListNode | null = { data: 1, next: { data: 2, next: { data: 2, next: { data: 3, next: null } } } };
linked_list = list_remove_if(linked_list, 2);
console.log(toArray(linked_list));
```

And its output :
```text
[ 1, 3 ]
```
