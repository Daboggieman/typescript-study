// Exercise 07: Loops
// Run this file with: npm run ex CURRICULUM/07_loops/exercises.ts


// TODO: Exercise 1
// Loop over this array FOUR different ways, printing the same output each time:
//   a. for...of
//   b. for...of with .entries()  (print the index too)
//   c. the C-style for loop with an index
//   d. forEach
const fruits = ["apple", "banana", "cherry"];


// TODO: Exercise 2
// Print every key and value of `fruits` using for...in.
// Then print typeof of the key. Explain in a comment why this is the wrong tool.
// Finally, rewrite it with Object.entries and for...of.


// TODO: Exercise 3
// Write a range(start, end, step) helper returning a number[].
// Use it to print the even numbers from 2 to 20.
// Then show the one-liner alternative using Array.from.
function range(start: number, end: number, step: number = 1): number[] {
  return [];
}


// TODO: Exercise 4
// Using do...while, keep doubling `value` until it exceeds 1000.
// Print each step and, at the end, how many iterations it took.
let value = 1;


// TODO: Exercise 5
// In a single loop over 1..14:
//   - skip even numbers with continue
//   - stop the whole loop with break once you pass 7
// Print only what survives. Expected: 1, 3, 5, 7.


// TODO: Exercise 6
// Search this grid for 9 using two nested loops and a LABELLED break.
// Then write a second version as a function that uses an early return.
const grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const target = 9;


// TODO: Exercise 7
// Demonstrate that `return` inside a forEach callback behaves like continue,
// NOT like break. Print from a forEach that tries to stop at 3,
// then print the same thing with a for...of loop that actually breaks.
const numbers = [1, 2, 3, 4, 5];
