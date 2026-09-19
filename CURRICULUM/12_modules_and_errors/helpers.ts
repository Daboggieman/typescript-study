// Companion module for Exercise 12.
// Imported by exercises.ts as "./helpers.js" — note the extension rule.

export type Point = { x: number; y: number };

export function multiply(a: number, b: number): number {
  return a * b;
}

export const PI = 3.14159;

// A default export. The importer chooses the name, which is exactly why
// this repo prefers named exports everywhere else.
export default function greet(name: string): string {
  return `Hello, ${name}!`;
}
