# DSA 03: Linked Lists

A **linked list** is a chain of nodes where each node points to the next. Unlike a TypeScript array, there's no contiguous memory and no index-based jump — you always start at the `head` and walk forward.

---

## 1. Singly Linked List

Each node has `data` and `next` only. The list itself just needs to remember the `head` (and optionally a `tail` for fast appends).

```ts
class Node<T> {
  data: T;
  next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  pushFront(data: T): void {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    if (!this.tail) this.tail = this.head; // first node
  }

  pushBack(data: T): void {
    const newNode = new Node(data);
    if (!this.head) {
      this.head = this.tail = newNode;
      return;
    }
    this.tail!.next = newNode;
    this.tail = newNode;
  }

  display(): void {
    const values: string[] = [];
    let current = this.head;
    while (current) {
      values.push(String(current.data));
      current = current.next;
    }
    console.log(values.length ? values.join(" -> ") : "EMPTY");
  }
}
```

---

## 2. Complexity Table

| Operation | Singly Linked List | TypeScript Array |
|---|---|---|
| Access by index | O(n) | O(1) |
| Insert at front | O(1) | O(n) |
| Insert at back (no tail pointer) | O(n) | O(1) amortized |
| Insert at back (with tail pointer) | O(1) | O(1) amortized |
| Delete at front | O(1) | O(n) |
| Search by value | O(n) | O(n) |

**Rule of thumb:** if your program does lots of insert/delete at the *front*, use a linked list. If it does lots of random-access reads, use an array.

---

## 3. Doubly Linked List (each node also has `prev`)

```ts
class DNode<T> {
  data: T;
  next: DNode<T> | null;
  prev: DNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}
```

Doubly linked lists allow O(1) deletion of a node *you already have a reference to* (no need to find its predecessor), and can be walked in both directions. This is useful for implementing advanced data structures like LRU caches.

---

## 4. Circular Linked List

The last node's `next` points back to the `head` instead of `null`. Useful for round-robin scheduling, buffering, and things like the Josephus problem.

```ts
// tail.next = head;   // this one line turns a list circular
```

---

## 5. Reversing a Linked List (a DSA classic)

```ts
function reverse<T>(head: Node<T> | null): Node<T> | null {
  let prev: Node<T> | null = null;
  let current: Node<T> | null = head;
  while (current) {
    const nextNode = current.next;   // save it before we overwrite
    current.next = prev;             // reverse the pointer
    prev = current;
    current = nextNode;
  }
  return prev;   // new head
}
```

---

## 6. Finding the Middle (Slow/Fast Pointer)

```ts
function findMiddle<T>(head: Node<T> | null): Node<T> | null {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}
```

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- **Reference:** [MDN — Linked List concept](https://developer.mozilla.org/en-US/docs/Glossary/Linked_list)
- **Article:** [Linked List](https://en.wikipedia.org/wiki/Linked_list) — types and operations
- **Video:** [Singly Linked List](https://www.youtube.com/watch?v=ZBd8fIZpv3g) — visual explanation
- **Python parallel:** [Python collections.deque](https://docs.python.org/3/library/collections.html#collections.deque) — doubly linked list implementation

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Implement `pushFront`, `pushBack`, and `display` from scratch, then add a `popFront()` method.
2. Implement `reverse(head)` and verify it on a 5-element list by printing before and after.
3. Implement a `findMiddle(head)` function using the classic **slow/fast pointer** technique (fast moves 2 steps for every 1 step of slow) — this finds the middle node in a single pass.
4. Convert your singly linked list into a doubly linked list by adding `prev` pointers, then write a `displayBackwards()` method.