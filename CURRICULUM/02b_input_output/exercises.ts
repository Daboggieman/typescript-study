// Exercise 02b: Input & Output
// Run this file with: npm run ex CURRICULUM/02b_input_output/exercises.ts
// To pass arguments:  npm run ex CURRICULUM/02b_input_output/exercises.ts -- Ada 30


// TODO: Exercise 1
// Print three lines of text with a SINGLE console.log call.
// Then print one line to stderr with console.error.
// Run it twice, redirecting stdout to a file the second time, and note what still appears.


// TODO: Exercise 2
// Print how many user arguments were passed to this file (not counting node and the script path).
// Run with: npm run ex CURRICULUM/02b_input_output/exercises.ts -- one two three
console.log(process.argv);


// TODO: Exercise 3
// Read a name and an age from process.argv and print a greeting.
// If the age is not a number, print an error to stderr and exit with code 1.
// Everything from process.argv is a string — you must convert it yourself.


// TODO: Exercise 4
// Format 1234.5678 four different ways and print each:
//   a. toFixed(2)
//   b. Intl.NumberFormat("en-US")
//   c. as USD currency
//   d. padded to a total width of 12
const value = 1234.5678;


// TODO: Exercise 5
// Build a two-column table using padEnd and padStart, matching this layout exactly:
//   Apple          1.5
//   Banana       12.25
//   Cherry         100


// TODO: Exercise 6
// Use node:readline/promises to ask the user for two numbers, then print their sum.
// Remember: the answer is always a string, and you MUST call rl.close().
// Uncomment the block below to start, and run it with npm run ex.

// import { createInterface } from "node:readline/promises";
// import { stdin as input, stdout as output } from "node:process";
//
// const rl = createInterface({ input, output });
// const first = await rl.question("First number:  ");
// const second = await rl.question("Second number: ");
//
// rl.close();
