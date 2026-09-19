// Exercise 13b: The Terminal & Git
// Run this file with: npm run ex CURRICULUM/13b_terminal_git/exercises.ts
//
// This module is mostly terminal practice. The file below is a checklist you can
// actually run, plus a few small shell commands invoked through Node.

import { execSync } from "node:child_process";


// TODO: Exercise 1
// Print the current working directory and the platform, using process.cwd()
// and process.platform. Compare with what `pwd` reports in your shell.


// TODO: Exercise 2
// Use execSync to run `git status --short` and print the output.
// Wrap it in try/catch — execSync THROWS when the command exits non-zero.
function run(command: string): string {
  return "";
}


// TODO: Exercise 3
// Run `git log --oneline` through your helper and print the history.
// If the repo has no commits yet, git exits non-zero — which is exactly the
// case your try/catch needs to handle.


// TODO: Exercise 4
// Run `git branch --show-current` and print the branch name.


// TODO: Exercise 5
// Count the TypeScript files in this repo by running:
//   find . -name "*.ts" -not -path "*/node_modules/*" | wc -l
// through execSync, and print the number.
// In a comment, explain why the -not -path filter is necessary.
