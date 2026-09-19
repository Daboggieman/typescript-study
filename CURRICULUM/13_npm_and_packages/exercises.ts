// Exercise 13: npm & Packages
// Run this file with: npm run ex CURRICULUM/13_npm_and_packages/exercises.ts
//
// Most of this module is terminal work. The prompts below tell you what to run.
// The code part reads this repo's own package.json.

import { readFile } from "node:fs/promises";
import path from "node:path";


// TODO: Exercise 1
// In your terminal, run:  npm ls --depth=0
// The output lists the direct dependencies. Nothing is nested yet because
// node_modules is not installed. Read what it reports either way.


// TODO: Exercise 2
// Run:  npm outdated
// In a comment, explain what the "Current", "Wanted", and "Latest" columns mean.
// Which one does the ^ in package.json allow?


// TODO: Exercise 3
// Read this repo's package.json and print:
//   a. the "type" field and what it changes about .js files
//   b. every key of "scripts"
//   c. whether "typescript" is in dependencies or devDependencies
//   d. the "engines" field


// TODO: Exercise 4
// In a comment, answer: why is typescript a devDependency and not a dependency?
// And why does a LIBRARY get this distinction right or wrong more consequentially
// than an application does?


// TODO: Exercise 5
// Read package-lock.json (if it exists) and print the resolved version of "tsx".
// If the file does not exist, print a message saying to run npm install first.
// The lockfile records EXACT versions; package.json records ranges.


// TODO: Exercise 6
// Work out by hand, and write as comments:
//   - what "^4.19.2" permits
//   - what "~4.19.2" would permit instead
//   - whether "^4.19.2" allows 5.0.0


// TODO: Exercise 7
// Read package.json and print every dependency range, sorted alphabetically.
// Use Object.entries on devDependencies.
const packageJsonPath = path.join(import.meta.dirname, "..", "..", "package.json");
console.log(packageJsonPath);
