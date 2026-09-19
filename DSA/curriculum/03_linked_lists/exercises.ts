// DSA Exercise 03: Linked Lists
// Run this file with: npm run ex DSA/curriculum/03_linked_lists/exercises.ts
// Typecheck with:    npm run check

// Define the Node and DNode classes as in the lecture
class Node<T> {
  data: T;
  next: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

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

// Singly Linked List class with basic operations
class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  pushFront(data: T): void {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    if (!this.tail) this.tail = this.head;
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

  // Exercise 1: add popFront method
  popFront(): T | null {
    if (!this.head) return null;
    const data = this.head.data;
    this.head = this.head.next;
    if (!this.head) this.tail = null; // list became empty
    return data;
  }

  // Helper to get the head for exercises (without removing)
  getHead(): Node<T> | null {
    return this.head;
  }
}

// Doubly Linked List class
class DoublyLinkedList<T> {
  private head: DNode<T> | null = null;
  private tail: DNode<T> | null = null;

  pushBack(data: T): void {
    const newNode = new DNode(data);
    if (!this.head) {
      this.head = this.tail = newNode;
      return;
    }
    newNode.prev = this.tail;
    this.tail!.next = newNode;
    this.tail = newNode;
  }

  displayForward(): void {
    const values: string[] = [];
    let current = this.head;
    while (current) {
      values.push(String(current.data));
      current = current.next;
    }
    console.log(values.length ? values.join(" -> ") : "EMPTY");
  }

  // Exercise 4: displayBackwards method
  displayBackwards(): void {
    const values: string[] = [];
    let current = this.tail;
    while (current) {
      values.push(String(current.data));
      current = current.prev;
    }
    console.log(values.length ? values.join(" <- ") : "EMPTY");
  }
}

// Helper functions for exercises
function reverse<T>(head: Node<T> | null): Node<T> | null {
  let prev: Node<T> | null = null;
  let current: Node<T> | null = head;
  while (current) {
    const nextNode = current.next;
    current.next = prev;
    prev = current;
    current = nextNode;
  }
  return prev;
}

function findMiddle<T>(head: Node<T> | null): Node<T> | null {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}

// Now the exercises
console.log("--- Exercise 1: Basic Linked List with popFront ---");
const ll = new LinkedList<number>();
ll.pushBack(10);
ll.pushBack(20);
ll.pushBack(30);
ll.display(); // 10 -> 20 -> 30
console.log(`Popped front: ${ll.popFront()}`); // 10
ll.display(); // 20 -> 30

console.log("\n--- Exercise 2: Reverse a Linked List ---");
const ll2 = new LinkedList<number>();
ll2.pushBack(1);
ll2.pushBack(2);
ll2.pushBack(3);
ll2.pushBack(4);
ll2.pushBack(5);
console.log("Original list:");
ll2.display(); // 1 -> 2 -> 3 -> 4 -> 5
const reversedHead = reverse(ll2.getHead());
// We need to create a temporary list to display the reversed list
const reversedList = new LinkedList<number>();
let current = reversedHead;
while (current) {
  reversedList.pushBack(current.data);
  current = current.next;
}
console.log("Reversed list:");
reversedList.display(); // 5 -> 4 -> 3 -> 2 -> 1

console.log("\n--- Exercise 3: Find Middle of a Linked List ---");
const ll3 = new LinkedList<number>();
for (let i = 1; i <= 5; i++) {
  ll3.pushBack(i);
}
ll3.display(); // 1 -> 2 -> 3 -> 4 -> 5
const middle = findMiddle(ll3.getHead());
console.log(`Middle node data: ${middle?.data}`); // 3

const ll4 = new LinkedList<number>();
for (let i = 1; i <= 6; i++) {
  ll4.pushBack(i);
}
ll4.display(); // 1 -> 2 -> 3 -> 4 -> 5 -> 6
const middle2 = findMiddle(ll4.getHead());
console.log(`Middle node data (for even length): ${middle2?.data}`); // 4 (second middle)

console.log("\n--- Exercise 4: Doubly Linked List displayBackwards ---");
const dll = new DoublyLinkedList<string>();
dll.pushBack("apple");
dll.pushBack("banana");
dll.pushBack("cherry");
console.log("Doubly linked list forward:");
dll.displayForward(); // apple -> banana -> cherry
console.log("Doubly linked list backward:");
dll.displayBackwards(); // cherry <- banana <- apple

console.log("\n--- Exercise 5: Circular Linked List Concept ---");
// We'll just demonstrate the concept by setting tail.next to head
class CircularNode<T> {
  data: T;
  next: CircularNode<T> | null;
  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}
const c1 = new CircularNode(1);
const c2 = new CircularNode(2);
const c3 = new CircularNode(3);
c1.next = c2;
c2.next = c3;
c3.next = c1; // make it circular
// We can traverse until we come back to the head
let currentCircular = c1;
let steps = 0;
const values: number[] = [];
do {
  values.push(currentCircular.data);
  currentCircular = currentCircular.next!;
  steps++;
  if (steps > 10) break; // safety
} while (currentCircular !== c1);
console.log(`Circular list values: ${values.join(" -> ")}`); // 1 -> 2 -> 3 -> 1 -> 2 -> 3 -> 1 ...

console.log("\n--- Exercise 6: Insert at Front vs Back Performance (conceptual) ---");
// We'll just note that pushFront is O(1) and pushBack is O(1) with tail
const llPerf = new LinkedList<number>();
console.log("Inserting 10000 elements at front:");
const startFront = Date.now();
for (let i = 0; i < 10000; i++) {
  llPerf.pushFront(i);
}
const endFront = Date.now();
console.log(`Time taken: ${endFront - startFront} ms`);

const llPerf2 = new LinkedList<number>();
console.log("Inserting 10000 elements at back:");
const startBack = Date.now();
for (let i = 0; i < 10000; i++) {
  llPerf2.pushBack(i);
}
const endBack = Date.now();
console.log(`Time taken: ${endBack - startBack} ms`);

console.log("\n--- Exercise 7: Search by Value ---");
// Add a search method to LinkedList for demonstration
class SearchableLinkedList<T> extends LinkedList<T> {
  search(data: T): Node<T> | null {
    let current = this.head;
    while (current) {
      if (current.data === data) {
        return current;
      }
      current = current.next;
    }
    return null;
  }
}
const searchLL = new SearchableLinkedList<number>();
searchLL.pushBack(5);
searchLL.pushBack(10);
searchLL.pushBack(15);
const found = searchLL.search(10);
console.log(`Search for 10: ${found ? "Found" : "Not found"}`);
const notFound = searchLL.search(99);
console.log(`Search for 99: ${notFound ? "Found" : "Not found"}`);

console.log("\n=== All exercises completed ===");