// Exercise 06: Control Flow
// Run this file with: npm run ex CURRICULUM/06_control_flow/exercises.ts


// TODO: Exercise 1
// Write an if / else if / else chain that turns a score into "A" (90+),
// "B" (80+), "C" (70+), or "F". Print the grade for each score below.
const scores = [95, 85, 72, 60];


// TODO: Exercise 2
// Show that indentation means nothing to the compiler.
// The second console.log here is NOT part of the if. Add braces to fix it.
const age = 15;
if (age >= 18)
  console.log("adult");
  console.log("this line runs unconditionally");


// TODO: Exercise 3
// Write a switch on `command` with cases "start", "stop", and a default.
// Then delete one break on purpose and observe the fall-through.


// TODO: Exercise 4
// Rewrite this range check using the switch (true) idiom, then rewrite it again
// as a flat if/else if chain. Which reads better?
const score = 85;


// TODO: Exercise 5
// Wrap this JSON.parse in try/catch. Narrow the error with instanceof Error
// before reading .message, and print a different message for non-Errors.
const raw = "{ this is not json";


// TODO: Exercise 6
// Throw a plain string (not an Error) inside a try block and catch it.
// Prove that JavaScript lets you throw anything.


// TODO: Exercise 7
// Rewrite this nested function using flat guard clauses.
// Every failure should throw, and the happy path should be the last line.
function processOrder(order: { items: string[]; paid: boolean } | null): string {
  if (order) {
    if (order.items.length > 0) {
      if (order.paid) {
        return "shipped";
      } else {
        throw new Error("unpaid");
      }
    } else {
      throw new Error("empty");
    }
  } else {
    throw new Error("no order");
  }
}


// TODO: Exercise 8
// Show the difference between || and ?? inside a condition, using 0 as the value.
const config: { size?: number } = { size: 0 };
