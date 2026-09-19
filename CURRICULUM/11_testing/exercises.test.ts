// Exercise 11: Testing — the tests
//
// Run with: npm test        (or npm run test:watch while working)
//
// These tests are written to FAIL until you implement the stubs in exercises.ts.
// Read the failure output carefully: Vitest shows the expected and received
// values side by side, which is the fastest way to see what is wrong.
//
// Note the "./exercises.js" extension. This repo uses Node's real ES module
// rules, where relative imports must name the file that exists AFTER compilation.
// You write .js; TypeScript and Vitest resolve it to the .ts next to it.

import { describe, it, expect, beforeEach } from "vitest";
import {
  add,
  subtract,
  multiply,
  divide,
  fizzbuzz,
  isPalindrome,
  sumAll,
  Cart,
  fetchUser,
} from "./exercises.js";


describe("arithmetic", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negatives", () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it("adds zero without changing the value", () => {
    expect(add(7, 0)).toBe(7);
  });

  it("subtracts", () => {
    expect(subtract(10, 4)).toBe(6);
  });

  it("subtracts into negatives", () => {
    expect(subtract(4, 10)).toBe(-6);
  });

  it("multiplies", () => {
    expect(multiply(6, 7)).toBe(42);
  });

  it("multiplying by zero gives zero", () => {
    expect(multiply(999, 0)).toBe(0);
  });

  it("multiplying negatives gives a positive", () => {
    expect(multiply(-3, -4)).toBe(12);
  });

  it("divides", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("divides into a fraction — there is no integer division", () => {
    expect(divide(7, 2)).toBe(3.5);
  });
});


// TODO: Exercise 2
// Decide what your `divide` does for a zero divisor and write the test here.
// Two valid designs: return Infinity (matching bare JavaScript), or throw.
// Whichever you choose, the test and the implementation must agree.
describe("divide by zero", () => {
  it("is defined by you — uncomment one of these and implement to match", () => {
    // expect(divide(1, 0)).toBe(Infinity);
    // expect(() => divide(1, 0)).toThrow("cannot divide by zero");
  });
});


describe("fizzbuzz", () => {
  it("returns the number as a string for a plain input", () => {
    expect(fizzbuzz(1)).toBe("1");
  });

  it("returns Fizz for multiples of 3", () => {
    expect(fizzbuzz(3)).toBe("Fizz");
  });

  it("returns Buzz for multiples of 5", () => {
    expect(fizzbuzz(5)).toBe("Buzz");
  });

  it("returns FizzBuzz for multiples of 15", () => {
    expect(fizzbuzz(15)).toBe("FizzBuzz");
  });

  it("returns FizzBuzz for 0 — the boundary", () => {
    expect(fizzbuzz(0)).toBe("FizzBuzz");
  });

  it("handles negatives", () => {
    expect(fizzbuzz(-3)).toBe("Fizz");
  });
});


describe("isPalindrome", () => {
  it("is true for a simple palindrome", () => {
    expect(isPalindrome("racecar")).toBe(true);
  });

  it("is false for a non-palindrome", () => {
    expect(isPalindrome("hello")).toBe(false);
  });

  it("ignores case", () => {
    expect(isPalindrome("RaceCar")).toBe(true);
  });

  it("ignores spaces", () => {
    expect(isPalindrome("never odd or even")).toBe(true);
  });

  it("is true for an empty string — the boundary", () => {
    expect(isPalindrome("")).toBe(true);
  });

  it("is true for a single character", () => {
    expect(isPalindrome("x")).toBe(true);
  });
});


describe("sumAll", () => {
  it("sums the numbers", () => {
    expect(sumAll([1, 2, 3])).toBe(6);
  });

  it("returns 0 for an empty array — the boundary", () => {
    expect(sumAll([])).toBe(0);
  });

  it("handles negatives", () => {
    expect(sumAll([5, -5])).toBe(0);
  });
});


describe("Cart", () => {
  let cart: Cart;

  // A FRESH cart before every test, so no test can leak state into another.
  beforeEach(() => {
    cart = new Cart();
  });

  it("starts empty", () => {
    expect(cart.total()).toBe(0);
    expect(cart.count()).toBe(0);
  });

  it("increases the total when an item is added", () => {
    cart.add("apple", 1.5);
    expect(cart.total()).toBe(1.5);
  });

  it("accumulates quantity when the same item is added twice", () => {
    cart.add("apple", 1.5);
    cart.add("apple", 1.5);
    expect(cart.count()).toBe(2);
    expect(cart.total()).toBe(3);
  });

  it("handles an explicit multi-quantity add", () => {
    cart.add("widget", 10, 3);
    expect(cart.count()).toBe(3);
    expect(cart.total()).toBe(30);
  });

  it("uses toBeCloseTo for computed floats", () => {
    cart.add("thing", 0.1);
    cart.add("thing", 0.2);
    // expect(cart.total()).toBe(0.3);      // would FAIL — 0.30000000000000004
    expect(cart.total()).toBeCloseTo(0.3, 10);
  });
});


describe("fetchUser", () => {
  it("resolves with the user", async () => {
    const user = await fetchUser(1);
    expect(user.id).toBe(1);
    expect(user.name).toBeTruthy();
  });

  it("rejects for an unknown id", async () => {
    await expect(fetchUser(999)).rejects.toThrow("not found");
  });
});
