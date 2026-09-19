# DSA 01: Lists (Dynamic Arrays)

Before we build our own data structures, we need to understand the one TypeScript gives us for free: the **array**. In most other languages this concept is called a **dynamic array**, and almost every custom data structure we build later (stacks, queues, hash tables) will be built on top of it.

This lesson looks at TypeScript's `array` through a *data structures* lens: not "how do I use it" (you already know that), but "what is actually happening underneath, and how fast is it?"

---

## 1. What Is an Array, Really?

A plain **array** (the kind you'd find in C or Java) is a fixed-size, contiguous block of memory. Because every element is the same size and sits right next to the next one, the computer can jump straight to index `i` using simple arithmetic: `address = base_address + (i * element_size)`. This is why indexing an array is **O(1)** — constant time, regardless of how big the array is.

A **dynamic array** (TypeScript's `array`, Java's `ArrayList`, C++'s `std::vector`) is an array that can grow. Under the hood, TypeScript's array keeps a contiguous block of memory that's usually a bit *bigger* than it needs, so it has "spare room" to grow into without immediately needing to resize.

```ts
const nums = [10, 20, 30];
console.log(nums[0]);   // O(1) — jumps straight to the memory slot
```

---

## 2. Why Appending Is (Usually) O(1)

When you call `nums.push(x)`, if there's spare capacity, TypeScript just writes into the next free slot — O(1).

When the array is completely full, the runtime has to:
1. Allocate a new, larger block of memory (typically grows by roughly 1.125x plus a bit).
2. Copy every existing element into the new block — O(n).
3. Free the old block.

Because this expensive resize happens only occasionally, the *amortized* cost of `push` is still O(1). Think of it as the cost of occasional highway construction spreading out over many smooth miles of driving.

---

## 3. Why Popping Is Always O(1)

Removing the last element with `nums.pop()` never triggers a resize — it just decreases the logical length and (optionally) clears the slot. No copying, no allocation, just O(1) work.

---

## 4. Inserting and Deleting in the Middle Is O(n)

```ts
nums.splice(1, 0, 99); // insert 99 at index 1
```

To insert at index `i`, everything from `i` onward must shift right to make a hole. In the worst case (inserting at the front) that’s the whole array — O(n).

Deleting works the same way: `nums.splice(i, 1)` shifts everything left to fill the gap, which is O(n).

---

## 5. Pre-Allocation and Capacity Control

TypeScript arrays do not expose capacity directly, but you can influence reallocations by starting with the right size. If you know you’ll need exactly 1,000 elements, write:

```ts
const nums = new Array(1000); // creates an array with length 1000, filled with `undefined`
```

Now the first 1,000 `push` operations will never trigger a resize because the slots already exist (though you’ll still need to assign values). This trick is useful when building performance-sensitive code.

---

## 6. Time Complexity Summary

| Operation       | Time Complexity | Notes |
|-----------------|-----------------|-------|
| Indexing (`[i]`)      | O(1)            | Direct memory access |
| Appending (`push`)    | O(1) amortized  | Resizing happens infrequently |
| Popping (`pop`)       | O(1)            | Never resizes |
| Inserting (`splice`)  | O(n)            | May require shifting elements |
| Deleting (`splice`)   | O(n)            | May require shifting elements |
| Iteration (`for...of`)| O(n)            | Visits each element once |

---

## 7. Space Complexity

A dynamic array never uses more than a constant factor times the space needed for the elements themselves. The wasted space due to over-allocation is at most a constant factor (typically < 12.5% in practice), so space complexity is still O(n).

---

## 8. When to Use a Dynamic Array

Use TypeScript’s built-in array when you need:
- Fast indexing and iteration
- Amortized constant-time appends and pops
- Simplicity and built-in methods (`map`, `filter`, `reduce`, etc.)

Consider building your own dynamic array (or using a linked list) when:
- You need guaranteed O(1) worst-case time for appends (rare)
- You want to minimize memory overhead (arrays may overallocate)
- You frequently insert/delete at the front (consider a deque or linked list)

---

## 9. Predicting the Output

```ts
const arr = [1, 2, 3];
arr.push(4);
arr.splice(1, 0, 99);
console.log(arr);
arr.pop();
console.log(arr.length);
```

And this one, which shows the cost of resizing:

```ts
let total = 0;
for (let i = 0; i < 100; i++) {
  total += new Array(i).length; // length of the array just created
}
console.log(total);
```

<details>
<summary>Answers</summary>

**First:** `[1, 99, 2, 3, 4]` then `4`.

- Start: `[1, 2, 3]`
- `push(4)` → `[1, 2, 3, 4]`
- `splice(1, 0, 99)` → insert 99 at index 1 → `[1, 99, 2, 3, 4]`
- `pop()` → remove last element → `[1, 99, 2, 3]`; length is 4.

**Second:** `4950`.

`new Array(i)` creates an array of length `i` (filled with `undefined`). The loop sums `0 + 1 + 2 + ... + 99 = 4950`.

</details>

---

## 10. Cheat Sheet Summary

```ts
const arr = [];               // empty dynamic array
arr.push(5);                  // O(1) amortized
arr[0];                       // O(1)
arr.splice(0, 1, 99);         // O(n) — shift elements
arr.pop();                    // O(1)
```

| Idea | One-line version |
|---|---|
| Dynamic array | Array that resizes automatically as elements are added |
| Indexing | O(1) — direct memory access |
| Appending | O(1) amortized — occasional O(n) resize |
| Popping | O(1) — never resizes |
| Inserting/deleting in middle | O(n) — may require shifting elements |
| Pre-allocation | `new Array(n)` avoids early resizes |
| Space | O(n) with small constant-factor overhead |
| When to use | Default choice for sequences; fast indexing and iteration |
| When to avoid | Frequent front insertions (consider linked list or deque) |

---

## Self-Check

- [ ] Why is indexing O(1) in a dynamic array?
- [ ] Why is appending O(1) amortized rather than O(1) worst-case?
- [ ] What makes inserting at the front O(n)?
- [ ] How can you reduce the number of resizes when you know the final size?
- [ ] What is the space overhead of a dynamic array?

---

## 📚 Resources

- **Docs:** [TypeScript Handbook — Arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays)
- **Reference:** [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- **Article:** [Dynamic Array](https://en.wikipedia.org/wiki/Dynamic_array) — amortized analysis explained
- **Video:** [Amortized Analysis](https://www.youtube.com/watch?v=wcK9i-_pKyA) — easy explanation of the accounting method
- **Python parallel:** [Python list](https://docs.python.org/3/tutorial/introduction.html#lists) — same dynamic array concept

---

## 🧠 Try It Yourself

Open `exercises.ts` in this folder:

1. Verify that indexing is O(1) by timing access to the first vs. last element in a large array.
2. Measure the amortized cost of `push` by timing 100,000 appends and checking for occasional slowdowns.
3. Show that inserting at the front is slower than inserting at the end.
4. Pre-allocate with `new Array(1000)` and verify the first 1,000 pushes do not trigger a resize (you can’t measure this directly, but trust the logic).
5. Explain why `splice` can be used for both insertion and deletion.