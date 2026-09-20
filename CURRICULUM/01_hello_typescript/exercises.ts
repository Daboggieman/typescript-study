// Exercise 01: Hello, TypeScript!
// Run this file with: npm run ex CURRICULUM/01_hello_typescript/exercises.ts
// Typecheck everything with: npm run check

// TODO: Exercise 1
// Write a console.log statement that outputs: I am learning TypeScript!
console.log("");


// TODO: Exercise 2
// Write a console.log statement that uses single quotes to output: TypeScript is fun.
console.log("");


// TODO: Exercise 3
// Write a mathematical expression inside console.log() that calculates 2 raised to the power of 10.
console.log();


// TODO: Exercise 4
// Write a multi-line comment below explaining what console.log does.


// TODO: Exercise 5: Type Annotations
// Declare a variable named 'message' with type string and assign it the value "Hello TypeScript"
// Then try to reassign it to a number and observe the error
let message: string = "Hello TypeScript";
// message = 42; // Uncomment this line to see the type error

// TODO: Exercise 6: Interface Basics
// Create an interface for a Person with properties: name (string), age (number), and email (string)
// Then create a variable of type Person and assign it an object
interface Person {
    // TODO: Define the properties
}
// TODO: Create a person variable here

// TODO: Exercise 7: Array Types
// Create an array of numbers called 'scores' and initialize it with some test scores
// Then try to push a string into it and observe the error
const scores: number[] = []; // TODO: Initialize with some scores
// scores.push("95"); // Uncomment this line to see the type error

// TODO: Exercise 8: Function Parameters
// Write a function called 'greet' that takes a name parameter of type string and returns a greeting message
// Try calling it with both a string and a number to see the type checking in action
function greet(name: string): string {
    // TODO: Return a greeting message
    return "";
}
// TODO: Test the function
// greet("Alice"); // Should work
// greet(42); // Should cause a type error
