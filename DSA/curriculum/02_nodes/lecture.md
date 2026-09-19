# DSA 02: Nodes and Linked Lists

Before we build linked lists, we need to understand the **node** — the basic building block. A node is simply an object that holds data and a reference (or pointer) to the next node (and sometimes the previous one). In TypeScript, we model nodes as classes or interfaces.

This lesson covers:
- Singly linked lists (SLL)
- Doubly linked lists (DLL)
- Common operations and their time complexities
- When to choose a linked list over a dynamic array

---

## 1. What Is a Node?

A **node** contains:
- `data`: the value stored (can be any type)
- `next`: a reference to the next node in the sequence (for singly linked lists)
- `prev`: a reference to the previous node (for doubly linked lists)

In TypeScript, we can define a node interface:

```ts
interface Node<T> {
  data: T;
  next: Node<T> | null;
}
```

For a doubly linked list:

```ts
interface DNode<T> {
  data: T;
  next: DNode<T> | null;
  prev: DNode<T> | null;
}
```

We often wrap these in a class to manage the list head/tail.

---

## 2. Singly Linked List (SLL)

A singly linked list consists of nodes where each node points to the next one, and the last node points to `null`. We keep a reference to the **head** (first node) and sometimes the **tail** (last node) for fast appends.

### Basic Operations

- **Access by index**: O(n) — must traverse from the head.
- **Search**: O(n) — may need to check every node.
- **Insert at head**: O(1) — create new node, point it to current head, update head.
- **Insert at tail**: O(1) if we have a tail reference, otherwise O(n).
- **Insert in middle**: O(n) to find the spot, then O(1) to link.
- **Delete head**: O(1) — update head to head.next.
- **Delete tail**: O(n) without tail reference (need to find previous), O(1) with tail and doubly linked.
- **Delete in middle**: O(n) to find, then O(1) to unlink.

### Why Use a Singly Linked List?

- Constant-time insertions/deletions at the head (useful for stacks and front-loaded queues).
- No need to pre-allocate or resize — memory grows exactly as needed.
- Insertions/deletions anywhere (once you have the node) are O(1) — just update pointers.

### Drawbacks

- No random access — must traverse from the head.
- Extra memory for pointers (typically one or two extra words per node).
- Poor cache locality — nodes are scattered in memory.

---

## 3. Doubly Linked List (DLL)

A doubly linked list adds a `prev` pointer to each node, allowing traversal both forward and backward. We usually maintain both head and tail references.

### Advantages Over SLL

- Insertions and deletions at both ends are O(1) with head and tail.
- Deleting a node given direct access to it is O(1) (update neighbors' pointers).
- Can traverse backward — useful for certain algorithms (e.g., palindrome check).

### Drawbacks

- Each node uses extra memory for the `prev` pointer.
- Slightly more complex implementation (need to maintain two pointers per node).

---

## 4. Common Operations and Time Complexities

| Operation               | SLL (no tail) | SLL (with tail) | DLL (with head/tail) |
|-------------------------|---------------|-----------------|----------------------|
| Access by index         | O(n)          | O(n)            | O(n)                 |
| Search                  | O(n)          | O(n)            | O(n)                 |
| Insert at head          | O(1)          | O(1)            | O(1)                 |
| Insert at tail          | O(n)          | O(1)            | O(1)                 |
| Insert after given node | O(1)          | O(1)            | O(1)                 |
| Delete head             | O(1)          | O(1)            | O(1)                 |
| Delete tail             | O(n)          | O(1)            | O(1)                 |
| Delete given node       | O(n) *        | O(n) *          | O(1)                 |
| \* requires finding previous node (O(n)) unless we have a reference to it |

---

## 5. Implementing a Singly Linked List in TypeScript

Here’s a minimal singly linked list with head and tail:

```ts
class SLL<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private size: number = 0;

  push(data: T): void {
    const node: Node<T> = { data, next: null };
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }
    this.size++;
  }

  pop(): T | null {
    if (!this.head) return null;
    if (this.head === this.tail) {
      const data = this.head.data;
      this.head = this.tail = null;
      this.size--;
      return data;
    }
    // O(n) traversal to find the new tail
    let current = this.head;
    while (current.next !== this.tail) {
      current = current.next!;
    }
    const data = this.tail!.data;
    current.next = null;
    this.tail = current;
    this.size--;
    return data;
  }

  // ... other methods like shift, unshift, etc.
}
```

Note: `pop` is O(n) because we need to find the previous tail. With a doubly linked list, `pop` becomes O(1).

---

## 6. When to Use a Linked List

Choose a linked list when you need:
- Constant-time insertions/deletions at the head (or head/tail for DLL).
- Frequent insertions/deletions in the middle **and** you already have a reference to the node.
- A data structure that never needs to resize or waste space on over-allocation.
- Sequential access patterns (e.g., iterating through all elements).

Avoid linked lists when you need:
- Fast random access (use dynamic array).
- Good cache performance (arrays win due to locality).
- Minimal memory overhead (pointers add overhead).

---

## 7. Time Complexity Summary

| Operation       | Singly Linked List | Doubly Linked List | Dynamic Array (TS array) |
|-----------------|--------------------|--------------------|--------------------------|
| Access          | O(n)               | O(n)               | O(1)                     |
| Search          | O(n)               | O(n)               | O(n)                     |
| Insert at head  | O(1)               | O(1)               | O(n) *                   |
| Insert at tail  | O(n)               | O(1)               | O(1) amortized           |
| Insert middle   | O(n)               | O(n)               | O(n)                     |
| Delete head     | O(1)               | O(1)               | O(n) *                   |
| Delete tail     | O(n)               | O(1)               | O(1)                     |
| Delete middle   | O(n)               | O(1) **            | O(n)                     |
| \* requires shifting elements |
| \** requires direct reference to node |

---

## 8. Cheat Sheet Summary

```ts
interface Node<T> {
  data: T;
  next: Node<T> | null;
}

class SLL<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private size: number = 0;

  push(data: T): void { /* O(1) */ }
  pop(): T | null { /* O(n) without tail, O(1) with DLL */ }
  shift(): T | null { /* O(1) */ }
  unshift(data: T): void { /* O(1) */ }
  // ... etc.
}
```

| Idea | One-line version |
|---|---|
| Node | Object with data and next/prev pointers |
| Singly linked list | Each node points to next; head/tail references |
| Doubly linked list | Each node points to next and prev |
| Insert at head | O(1) — just update head |
| Insert at tail | O(1) with tail pointer |
| Access by index | O(n) — must traverse |
| Search | O(n) — may need to check all nodes |
| Space overhead | O(n) extra for pointers (1 or 2 words per node) |
| When to use | Head/tail operations, frequent mid-list insertions with node reference |
| When to avoid | Random access, cache-sensitive tasks |

---

## Self-Check

- [ ] Why is inserting at the head O(1) in a singly linked list?
- [ ] Why is deleting the tail O(n) in a singly linked list without a tail reference?
- [ ] How does a doubly linked list improve deletion time?
- [ ] What is the main disadvantage of linked lists compared to dynamic arrays?
- [ ] When would you prefer a linked list over TypeScript’s built-in array?

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Interfaces](https://www.typescriptlang.org/docs/handbook/2/interfaces.html) (for typing nodes)
- **Reference:** [MDN — Linked List concept](https://developer.mozilla.org/en-US/docs/Glossary/Linked_list)
- **Article:** [Linked List](https://en.wikipedia.org/wiki/Linked_list) — types and operations
- **Video:** [Singly Linked List](https://www.youtube.com/watch?v=ZBd8fIZpv3g) — visual explanation
- **Python parallel:** [Python collections.deque](https://docs.python.org/3/library/collections.html#collections.deque) — doubly linked list implementation

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Implement a singly linked list class with `push`, `pop`, `shift`, `unshift`, and `get` methods.
2. Implement a doubly linked list class with `push`, `pop`, `shift`, `unshift`, and `get` methods.
3. Time inserting 10,000 elements at the head vs. tail of your SLL (with and without tail reference).
4. Show that deleting a node given direct reference is O(1) in a DLL.
5. Explain why linked lists have poor cache locality and how that affects performance.