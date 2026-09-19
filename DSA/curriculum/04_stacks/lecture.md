# DSA 04: Stacks

A **stack** is a linear data structure that follows **LIFO**: Last In, First Out. Think of a stack of plates — you can only add or remove from the top.

---

## 1. The Core Operations

| Operation | Description | Complexity |
|---|---|---|
| `push(x)` | add `x` to the top | O(1) |
| `pop()` | remove and return the top item | O(1) |
| `peek()` / `top()` | look at the top item without removing it | O(1) |
| `isEmpty()` | check if the stack has no items | O(1) |

All of these are O(1) — that's the entire point of a stack. It intentionally gives up flexibility (no random access!) in exchange for guaranteed-fast operations at one end.

---

## 2. Implementing a Stack with a TypeScript Array

TypeScript arrays already support O(1) push/pop *from the end*, so they make a perfectly good stack — just never use `unshift(...)` or `shift()` if you want O(1) (those are O(n)). Actually, for a stack we want to add and remove from the same end, and we can choose the end that gives O(1) for both: the end of the array (using `push` and `pop`).

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item); // add to the "top" (end of array)
  }

  pop(): T {
    if (this.isEmpty()) {
      throw new Error("pop from an empty stack");
    }
    return this.items.pop()!; // remove from the "top"
  }

  peek(): T {
    if (this.isEmpty()) {
      throw new Error("peek from an empty stack");
    }
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
```

---

## 3. Implementing a Stack with a Linked List

You can also build a stack from nodes — push/pop just add/remove at the `head` (so that both operations are O(1)):

```ts
class Node<T> {
  data: T;
  next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

class LinkedStack<T> {
  private top: Node<T> | null = null;

  push(data: T): void {
    const node = new Node(data);
    node.next = this.top;
    this.top = node;
  }

  pop(): T {
    if (this.top === null) {
      throw new Error("pop from an empty stack");
    }
    const data = this.top.data;
    this.top = this.top.next;
    return data;
  }

  peek(): T {
    if (this.top === null) {
      throw new Error("peek from an empty stack");
    }
    return this.top.data;
  }

  isEmpty(): boolean {
    return this.top === null;
  }

  size(): number {
    let count = 0;
    let current = this.top;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }
}
```

---

## 4. Where Stacks Show Up

- **Function call stack** — every language runtime uses a stack to track function calls and local variables. This is literally why deep recursion causes a "stack overflow."
- **Undo/redo** in editors.
- **Balanced brackets / parentheses matching.**
- **Depth-First Search (DFS)** on trees and graphs.
- **Expression evaluation** (converting infix to postfix, evaluating postfix).
- Browser **back button** history.

---

## 5. Classic Problem: Balanced Brackets

```ts
function isBalanced(expression: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  for (const char of expression) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}

console.log(isBalanced("{[()()]}"));  // true
console.log(isBalanced("{[(])}"));    // false
```

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays)
- **Reference:** [MDN — Stack concept](https://developer.mozilla.org/en-US/docs/Glossary/Stack)
- **Article:** [Stack (abstract data type)](https://en.wikipedia.org/wiki/Stack_(abstract_data_type))
- **Video:** [Stack Data Structure](https://www.youtube.com/watch?v=F1F2imiOJfk) — introduction
- **Python parallel:** [Python list as stack](https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-stacks) — same push/pop from end

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Implement `Stack` (array-based) fully, then implement `LinkedStack` and confirm they behave identically for the same sequence of pushes/pops.
2. Implement `isBalanced` and test it against `"([)]"`, `"{[]}"`, and `"((("`.
3. Use a stack to reverse a string without using slicing (`s.split('').reverse().join('')` is cheating — use a stack).
4. Use a stack to check if a string is a palindrome (compare against your two-pointer solution from a previous lesson — which approach uses more memory?).