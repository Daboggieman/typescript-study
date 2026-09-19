# List_for_eachif

Source: list_for_eachif

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that applies an action only to nodes that satisfy a condition.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function list_for_each_if(
  head: ListNode | null,
  action: (value: number) => number,
  condition: (value: number) => boolean,
): ListNode | null {
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
console.log(toArray(list_for_each_if(linked_list, (x) => x * 2, (x) => x > 1)));
```

And its output :
```text
[ 4, 6 ]
```
