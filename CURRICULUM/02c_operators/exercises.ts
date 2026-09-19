// Exercise 02c: Operators
// Run this file with: npm run ex CURRICULUM/02c_operators/exercises.ts


// TODO: Exercise 1
// Predict each of these BEFORE running, then print them all.
// Write your prediction in a comment next to each line.
console.log(1 == "1");
console.log(1 === "1");
console.log(0 == "");
console.log(null == undefined);
console.log(NaN === NaN);


// TODO: Exercise 2
// Show the difference between || and ?? using 0 as the left-hand value,
// then again using "" as the left-hand value. Print all four results.
const count = 0;
const label = "";


// TODO: Exercise 3
// Safely read a two-level nested property off this null value using ?. and ??.
// It must not throw.
const user: { address: { city: string } } | null = null;


// TODO: Exercise 4
// Write a function `getCity` that takes a possibly-null user and returns
// their city, or "unknown". Use ?. and ?? together.
function getCity(user: { address?: { city?: string } } | null): string {
  return "";
}


// TODO: Exercise 5
// Translate these two Python expressions into TypeScript, then verify both
// for a NEGATIVE number, where floor and trunc differ:
//   label = "adult" if age >= 18 else "minor"
//   result = 7 // 2
const age = 20;


// TODO: Exercise 6
// Demonstrate the array truthiness difference. Print:
//   - whether an empty array is truthy in a boolean context
//   - whether its .length is truthy
const empty: number[] = [];
