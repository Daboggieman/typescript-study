// Exercise 11: Testing — the code under test
//
// Unlike the other modules, this file is a MODULE, not a runnable script.
// Run it with:  npm test
// While working: npm run test:watch
//
// The tests live in exercises.test.ts. They are written to FAIL until you
// implement the stubs below — that is the exercise, not a broken repo.


// TODO: Exercise 1
// Implement add, subtract, multiply, and divide.

export function add(a: number, b: number): number {
  return 0;
}

export function subtract(a: number, b: number): number {
  return 0;
}

export function multiply(a: number, b: number): number {
  return 0;
}

// TODO: Exercise 2
// Decide what divide-by-zero SHOULD do, make the test match, then implement it.
export function divide(a: number, b: number): number {
  return 0;
}


// TODO: Exercise 3
// Implement fizzbuzz: multiples of 15 -> "FizzBuzz", of 3 -> "Fizz",
// of 5 -> "Buzz", otherwise the number as a string.
// Watch the 0 case — 0 is divisible by everything.
export function fizzbuzz(n: number): string {
  return "";
}


// TODO: Exercise 4
// Implement isPalindrome. It must ignore case and whitespace,
// and return true for an empty string and a single character.
export function isPalindrome(s: string): boolean {
  return false;
}


// TODO: Exercise 5
// Implement sumAll. The empty array must return 0.
export function sumAll(nums: number[]): number {
  return 0;
}


// TODO: Exercise 6
// Implement Cart so that the tests in exercises.test.ts pass.
// Note the field is initialised inline, so every `new Cart()` gets a fresh array.
export class Cart {
  private items: { name: string; price: number; qty: number }[] = [];

  add(name: string, price: number, qty: number = 1): void {
  }

  total(): number {
    return 0;
  }

  count(): number {
    return 0;
  }
}


// TODO: Exercise 7
// Implement fetchUser so the resolved and rejected tests both pass.
// Reject with an Error whose message contains "not found" for an unknown id.
// There is no database here — an in-memory record is fine.
export async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  throw new Error("TODO: implement fetchUser");
}
