// DSA Exercise 01: Lists (Dynamic Arrays)
// Run this file with: npm run ex DSA/curriculum/01_lists/exercises.ts
// Typecheck with:    npm run check

// Exercise 1: Indexing O(1)
// Create an array of 1,000,000 numbers and time accessing the first vs last element.
// (We'll just demonstrate the concept; actual timing requires console.time which we can use.)

console.log("--- Exercise 1: Indexing O(1) ---");
const bigArray = new Array(1_000_000).fill(0).map((_, i) => i);
// Access first element
const first = bigArray[0];
// Access last element
const last = bigArray[bigArray.length - 1];
console.log(`First element: ${first}, Last element: ${last}`);
// Both should be O(1) operations.

// Exercise 2: Amortized O(1) push
// We'll push 100,000 elements and note that it's fast overall.
console.log("\n--- Exercise 2: Amortized O(1) push ---");
const pushArray = [];
// We can time it roughly with Date.now()
const startPush = Date.now();
for (let i = 0; i < 100_000; i++) {
  pushArray.push(i);
}
const endPush = Date.now();
console.log(`Pushed 100,000 elements in ${endPush - startPush} ms`);
// Note: This is not a precise benchmark but shows it's fast.

// Exercise 3: O(n) insert at front vs end
// Inserting at the front (index 0) should be slower than at the end.
console.log("\n--- Exercise 3: Insert at front vs end ---");
const frontArray = [];
const endArray = [];

// Time inserting at the front (we'll do a smaller number to see the difference)
const startFront = Date.now();
for (let i = 0; i < 10_000; i++) {
  frontArray.unshift(i); // unshift is O(n) because it shifts all elements
}
const endFront = Date.now();
console.log(`Inserted 10,000 at front with unshift: ${endFront - startFront} ms`);

// Time inserting at the end
const startEnd = Date.now();
for (let i = 0; i < 10_000; i++) {
  endArray.push(i); // push is O(1) amortized
}
const endEnd = Date.now();
console.log(`Inserted 10,000 at end with push: ${endEnd - startEnd} ms`);

// Exercise 4: Pre-allocation to avoid resizes
// If we know the size, we can pre-allocate.
console.log("\n--- Exercise 4: Pre-allocation ---");
let preAllocated = new Array(1_000_000); // length 1,000,000, filled with undefined
// Now we can assign by index without triggering a resize (for the first 1,000,000 assignments)
for (let i = 0; i < 1_000_000; i++) {
  preAllocated[i] = i * 2;
}
console.log(`Pre-allocated array length: ${preAllocated.length}`);
console.log(`First element: ${preAllocated[0]}, Last element: ${preAllocated[preAllocated.length - 1]}`);

// Exercise 5: Using splice for insertion and deletion
console.log("\n--- Exercise 5: splice for insertion and deletion ---");
const spliceArray = [1, 2, 3, 4, 5];
console.log(`Original: ${spliceArray}`);
// Insert 99 at index 2
spliceArray.splice(2, 0, 99);
console.log(`After splice(2,0,99): ${spliceArray}`);
// Delete two elements starting at index 3
spliceArray.splice(3, 2);
console.log(`After splice(3,2): ${spliceArray}`);

// Exercise 6: Popping from the end
console.log("\n--- Exercise 6: Popping ---");
const popArray = [10, 20, 30, 40];
console.log(`Before pop: ${popArray}`);
const popped = popArray.pop();
console.log(`Popped: ${popped}, After pop: ${popArray}`);

// Exercise 7: Space overhead demonstration (conceptual)
// We can't measure the exact overhead easily, but we can show that the array length
// and the actual number of elements we store are the same, but the underlying
// allocated memory might be more. We'll just note the concept.
console.log("\n--- Exercise 7: Space overhead (conceptual) ---");
const overheadArray = [1, 2, 3];
console.log(`Array with 3 elements has length: ${overheadArray.length}`);
// The actual memory allocated might be more than 3 * size_of(element) to allow for growth.

// Exercise 8: When to use dynamic array vs alternatives
console.log("\n--- Exercise 8: When to use ---");
// Use dynamic array for:
// - Fast indexing: arr[i]
// - Fast iteration: for...of
// - Amortized constant time push/pop
//
// Consider alternatives (like linked list) when:
// - Frequent insertions at the front
// - Need guaranteed O(1) worst-case time for insertions (rare)
// We'll just note this in comments.

// Exercise 9: Predict the output (from lecture)
console.log("\n--- Exercise 9: Predict the output ---");
const arr1 = [1, 2, 3];
arr1.push(4);
arr1.splice(1, 0, 99);
console.log(`After push and splice: ${arr1}`); // Expected: [1, 99, 2, 3, 4]
arr1.pop();
console.log(`After pop, length: ${arr1.length}`); // Expected: 4

// Exercise 10: Cost of resizing (from lecture)
console.log("\n--- Exercise 10: Cost of resizing ---");
let total = 0;
for (let i = 0; i < 100; i++) {
  total += new Array(i).length; // length of the array just created
}
console.log(`Total of array lengths from 0 to 99: ${total}`); // Expected: 4950

console.log("\n=== All exercises completed ===");