// Exercise 10: Files & JSON
// Run this file with: npm run ex CURRICULUM/10_files_json/exercises.ts
//
// These exercises write real files into this folder. That is what .gitignore is for;
// the working files here are named *.tmp so they stay out of your way.

import { readFile, writeFile, appendFile, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";


// TODO: Exercise 1
// Write a string to "exercise.tmp" and read it back.
// Then read it again WITHOUT the "utf8" argument and print both values.


// TODO: Exercise 2
// Append a second line to the same file, read it, split on "\n",
// and print each line with its number. Note the trailing empty string.


// TODO: Exercise 3
// Use path.join with import.meta.dirname to build a path to "next-to-me.tmp"
// in THIS folder, and write to it.
// In a comment, explain why this beats a bare relative filename.


// TODO: Exercise 4
// Write a readTextFile(path) function that returns null when the file is missing
// (ENOENT) and re-throws every other error.
async function readTextFile(file: string): Promise<string | null> {
  return null;
}


// TODO: Exercise 5
// Create an object, serialise it with JSON.stringify, print the JSON,
// then parse it back and print the object. Confirm the round trip.


// TODO: Exercise 6
// Serialise a Map and a Set into an object and print the result.
// In a comment, explain what JSON does with each of them, and how to fix it.


// TODO: Exercise 7
// Build an object containing undefined, a function, NaN, Infinity, and a Date.
// Stringify it and print the result. Explain EVERY disappearance in a comment.


// TODO: Exercise 8
// Build a cyclic object and try to stringify it. Catch the TypeError and print its message.
const cyclic: Record<string, unknown> = {};
cyclic.self = cyclic;


// TODO: Exercise 9
// Write a type predicate `isUser` and use it to validate a parsed JSON value.
// JSON.parse returns `any` — your job is to get back to something safe.
type User = { name: string; age: number };

function isUser(value: unknown): value is User {
  return false;
}


// TODO: Exercise 10
// Clean up: remove the .tmp files you created in this folder.
// Note that rm() throws if the file does not exist unless you pass `force: true`.
