// Exercise 03: Strings
// Run this file with: npm run ex CURRICULUM/03_strings/exercises.ts


// TODO: Exercise 1
// Build the same greeting twice: once with + concatenation, once with a
// template literal. Print both and confirm they match.
const name = "Ada";
const language = "TypeScript";


// TODO: Exercise 2
// Call .toUpperCase() on this string WITHOUT capturing the result, print the
// string, then capture the result and print again. Explain the difference.
let greeting = "hello world";


// TODO: Exercise 3
// Print the first and last character of `word`.
// Use word.at(-1) for the last, then try word[-1] and explain the result in a comment.
const word = "TypeScript";


// TODO: Exercise 4
// Extract "Script" from `word` using slice, substring, and substr.
// Print all three. In a comment, note what substr's second argument means.


// TODO: Exercise 5
// Replace every "-" with "+" in this string, three different ways:
//   a. replaceAll
//   b. split + join
// Then print what a single .replace("-", "+") does, and explain why.
const dashed = "a-b-c-d";


// TODO: Exercise 6
// Reverse `backwards` using spread, .reverse(), and .join("").
// Then print how many characters it has using .length,
// and again using [...backwards].length. They should match for this word.
const backwards = "TypeScript";


const sentence = "The quick brown fox jumps over the lazy dog";

// TODO: Exercise 7
// Count how many times the letter "a" appears in `sentence`.
// Hint: split on "a" and look at the length of the result.


// TODO: Exercise 8
// Find the first index of "fox" and print the boolean "is it there?" using includes.
// Then explain in a comment why `if (sentence.indexOf("cat"))` would always be true.


// TODO: Exercise 9: Template Literal Types
// Create a type for CSS class names using template literal types
type Size = "small" | "medium" | "large";
type Color = "red" | "blue" | "green";
// type ClassName = `btn-${Size}-${Color}`;
// const btnClass: ClassName = `btn-${size}-${color}`;
// TODO: Define size and color variables and create a valid className
// TODO: Try creating an invalid className and observe the type error


// TODO: Exercise 10: String Enums
// Create a string enum for UI directions and use it in a function
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT"
//}
// function move(direction: Direction) {
//     console.log(`Moving ${direction}`);
// }
// TODO: Test the function with valid and invalid values
