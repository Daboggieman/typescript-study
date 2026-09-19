// Exercise 04: Arrays & Tuples
// Run this file with: npm run ex CURRICULUM/04_arrays_tuples/exercises.ts


// TODO: Exercise 1
// Create an array of the numbers 0-4 three different ways, and print each:
//   a. a literal
//   b. new Array(5).fill(...)
//   c. Array.from({ length: 5 }, ...)


// TODO: Exercise 2
// Print arr[99] and arr.at(99) for this array. Neither should throw.
// Then print arr.at(-1) and explain in a comment why arr[-1] is not the same thing.
const nums = [10, 20, 30];


// TODO: Exercise 3
// Starting from [2, 3]:
//   push 4, print; pop, print; unshift 1, print; shift, print.
// Print the array after every single step.


// TODO: Exercise 4
// Demonstrate that slice COPIES and splice MUTATES.
// Call each one on the SAME starting array and print the original afterwards.
const letters = ["a", "b", "c", "d", "e"];


// TODO: Exercise 5
// Sort this array first with NO comparator, then with (a, b) => a - b.
// Print both. In a comment, explain why the first result is wrong.
const unsorted = [10, 1, 5, 25];


// TODO: Exercise 6
// Using filter, map, and reduce in a chain on `values`, print the total of the
// even numbers after doubling each one. Expected: 2+4=6, doubled = 12.
const values = [1, 2, 3, 4, 5];


// TODO: Exercise 7
// Copy this array with spread, mutate the nested object, and print both.
// Then do the same with structuredClone and print both again.
// Explain in a comment why the results differ.
const records = [{ id: 1 }, { id: 2 }];


// TODO: Exercise 8
// Declare a readonly tuple for a (name, age) pair and destructure it.
// Then try to push a third element and read the error.
type Person = readonly [string, number];


// TODO: Exercise 9
// Write a function `minMax` that takes an array of numbers and returns a
// [min, max] tuple, or null when the array is empty.
function minMax(numbers: number[]): [number, number] | null {
  return null;
}
