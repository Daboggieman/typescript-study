// Exercise 02: Variables & Types
// Run this file with: npm run ex CURRICULUM/02_variables_types/exercises.ts


// TODO: Exercise 1
// Declare a const named 'score' with the value 95, then print it.
// Then uncomment the second line and run `npm run check` to read the error.
const score = 95;
// score = 96; // Uncomment this line to see the error (const cannot be reassigned)


// TODO: Exercise 2
// Declare a 'gpa' of 3.8 and print both the value and typeof gpa.
// In a comment, explain why TypeScript calls it a "number".
const gpa = 3.8;
// TODO: Print gpa and typeof gpa
// console.log(gpa);
// console.log(typeof gpa);
// TypeScript calls it a "number" because JavaScript (and thus TypeScript) has only one number type
// that represents both integers and floating-point numbers. There is no separate "float" type.


// TODO: Exercise 3
// Declare an 'isWeekend' boolean, print it, and print its typeof.
let isWeekend = false;
// TODO: Print isWeekend and typeof isWeekend


// TODO: Exercise 4
// Convert each of these to a number and print the result, all three on one line:
//   Number("49.99"), Number("49.99 dollars"), parseFloat("49.99 dollars")
const priceStr = "49.99";
// TODO: Complete the conversions and print results
// console.log(Number("49.99"));
// console.log(Number("49.99 dollars"));
// console.log(parseFloat("49.99 dollars"));
// Explain the differences in a comment below:


// TODO: Exercise 5
// Declare a const object with a single property, mutate that property,
// then try to rebind the whole object. Which line errors?
const obj = { count: 1 };
// obj.count = 5; // This should work (mutating property)
// obj = { count: 5 }; // This should cause an error (rebinding const)
// Uncomment each line to test and observe which causes a type error


// TODO: Exercise 6
// What does `typeof null` print, and what is the correct way to test for null?
// Work it out in code below and print the comparison.
// TODO: Test typeof null and compare with null
// console.log(typeof null);
// console.log(null === null);
// The correct way to test for null is using the strict equality operator (===)
// typeof null returns "object" due to a historical bug in JavaScript


// TODO: Exercise 7: Union Types
// Create a variable that can hold either a string or a number
// Assign it both types of values and verify it works
let multiType: string | number;
// TODO: Assign both a string and a number to multiType
// multiType = "Hello";
// multiType = 42;
// TODO: Try assigning a boolean and observe the error
// multiType = true; // Should cause a type error


// TODO: Exercise 8: Type Assertion vs Type Conversion
// Demonstrate the difference between type assertion and actual type conversion
const someValue = "42";
// Type assertion (telling TypeScript what type you think it is)
const strLength1: number = (someValue as string).length;
// Alternative syntax for type assertion
const strLength2: number = (<string>someValue).length;
// Actual conversion (changing the value itself)
const numValue: number = Number(someValue);
// TODO: Print all three values to see they're the same in this case
// console.log(strLength1, strLength2, numValue);
// Try with a non-numeric string:
// const nonNumeric = "hello";
// const len = (nonNumeric as string).length; // Works (5)
// const num = Number(nonNumeric); // Returns NaN
