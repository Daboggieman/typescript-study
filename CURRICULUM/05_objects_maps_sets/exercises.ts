// Exercise 05: Objects, Maps & Sets
// Run this file with: npm run ex CURRICULUM/05_objects_maps_sets/exercises.ts


// TODO: Exercise 1
// Build an object with three keys, including one that needs bracket access
// (a space or a dash). Read one with dot notation and one with brackets.
const person = {
  name: "Ada",
  age: 30,
  "favourite colour": "blue",
};


// TODO: Exercise 2
// Show that object keys are coerced to strings.
// Add a numeric key and a boolean key to `coerced`, print the object,
// then add an object as a key and explain the result in a comment.
const coerced: Record<string, string> = {};


// TODO: Exercise 3
// Read a property that does not exist and print it (it should be undefined, not an error).
// Then compare "name" in person against Object.hasOwn(person, "toString") and explain
// the difference in a comment.


// TODO: Exercise 4
// Iterate `person` three ways and print each:
//   a. Object.keys
//   b. Object.values
//   c. Object.entries with a for...of loop


// TODO: Exercise 5
// Using Object.entries on `scores`, print the names of everyone who scored 90 or above.
// Then compute the total using Object.values and reduce.
const scores = { ada: 95, grace: 88, alan: 71, edsger: 92 };


// TODO: Exercise 6
// Print Object.keys of this object. The numeric key does not stay where it was written.
// Explain the ordering rule in a comment.
const ordered: Record<string, number> = { b: 1, 2: 2, a: 3 };


// TODO: Exercise 7
// Copy `original` with spread, mutate the nested object's value, and print both.
// Then do the same with structuredClone and print both again.
const original = { a: 1, nested: { b: 2 } };


// TODO: Exercise 8
// Build a Map<string, number>, set three entries, then:
//   a. print its size
//   b. read a key that is missing
//   c. iterate it with for...of
//   d. convert it to a plain object with Object.fromEntries


// TODO: Exercise 9
// Build a Map keyed on an OBJECT. Add two keys with identical contents.
// Print the size and explain why it is 2, not 1.
// Then re-key the same data on a JSON string and show the lookup now works by value.
type Point = { x: number; y: number };


// TODO: Exercise 10
// Dedupe this array with a Set, then print:
//   a. the unique values
//   b. the intersection with [2, 3, 4]
//   c. the difference from [2, 3, 4]
const dupes = [1, 2, 2, 3, 3, 3, 4];


// TODO: Exercise 11
// Write a function that counts word frequencies in a string using a Map.
// Use the (map.get(word) ?? 0) + 1 idiom.
function countWords(text: string): Map<string, number> {
  return new Map();
}
