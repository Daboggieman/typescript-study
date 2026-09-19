// Exercise 08: Functions
// Run this file with: npm run ex CURRICULUM/08_functions/exercises.ts


// TODO: Exercise 1
// Write a function named 'multiply' that takes two parameters (a, b) and returns
// their product. Write it three ways: function declaration, function expression,
// and arrow. Call each one with 4 and 5 and print the results.


// TODO: Exercise 2
// Write 'describeCity(city, country)' with the country defaulting to "USA".
// Call it three times: twice relying on the default, once with a different country.
// Then call it with an explicit `undefined` as the country and explain the result.


// TODO: Exercise 3
// Write 'sumAll' taking a rest parameter of numbers and returning their sum.
// Call it with five numbers, then with an array spread into the call.


// TODO: Exercise 4
// Write a function 'addItem(item, list = [])' that pushes onto the list and returns it.
// Call it twice with no list argument. In a comment, explain why this is SAFE in
// JavaScript when the same pattern is a bug in Python.
function addItem(item: string, list: string[] = []): string[] {
  return list;
}


// TODO: Exercise 5
// Write 'request(url, options)' using a single options object with three defaults:
// method "GET", timeout 5000, retries 3. Call it three ways:
//   a. with no options at all
//   b. with only { method: "POST" }
//   c. with retries and timeout but no method, in a different order than declared
function request(url: string, options: { method?: string; timeout?: number; retries?: number } = {}): string {
  return "";
}


// TODO: Exercise 6
// Write an arrow function 'makePoint' that returns an object literal { x, y }.
// First write it WITHOUT wrapping parentheses and observe what it returns,
// then fix it.


// TODO: Exercise 7
// Demonstrate the `this` bug:
//   a. detach this method from its object and call it — it should throw
//   b. fix it with .bind()
//   c. write a second object whose method uses an arrow for an internal callback
const counter = {
  count: 0,
  increment() {
    this.count += 1;
    return this.count;
  },
};


// TODO: Exercise 8
// Write 'applyTwice(fn, value)' that applies fn to value twice.
// Call it with an inline arrow. Notice you do NOT annotate the arrow's parameter —
// TypeScript infers it from applyTwice's signature.
function applyTwice(fn: (n: number) => number, value: number): number {
  return value;
}


// TODO: Exercise 9
// Write an overloaded 'format' that accepts a string OR a number:
//   - a string is trimmed
//   - a number is formatted to 2 decimal places
// Write the overload signatures, then the implementation.
function format(value: string | number): string {
  return "";
}
