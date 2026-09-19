# Sorted_list_merge

Source: sorted_list_merge

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Write a function that merges two sorted linked lists into one sorted linked list.

Expected function
```ts
type ListNode = { data: number; next: ListNode | null };

function sorted_list_merge(list1: ListNode | null, list2: ListNode | null): ListNode | null {
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

const list1: ListNode | null = { data: 1, next: { data: 3, next: null } };
const list2: ListNode | null = { data: 2, next: { data: 4, next: null } };
console.log(toArray(sorted_list_merge(list1, list2)));
```

And its output :
```text
[ 1, 2, 3, 4 ]
```
