# Lecture 15: Final Project

Congratulations on reaching the final module of the core TypeScript curriculum! You have covered variables and types, strings, arrays and tuples, objects and Maps, control flow, loops, functions, classes, files and JSON, testing, modules and errors, npm, and the network.

Now it is time to put all of it together into a complete project.

---

## 1. Project Planning

Before writing any code, plan the structure. The same four questions apply to every project you will ever build:

1. **Define requirements** — what does the application do, and who uses it? Write this down in one paragraph. If you cannot, you do not know what you are building yet.
2. **Design the data model** — what are the *things* in this program, and what do they hold? This is where classes and interfaces come from.
3. **Map the control flow** — how does a user move through the program? A menu loop, a series of prompts, a single command?
4. **Decide the testing strategy** — which parts are pure logic (easy to test, and where the bugs live) and which are I/O (harder to test, usually thin)?

That fourth question is the one worth thinking about hardest, because it drives the file layout. **Put the logic in modules that take values and return values; put the I/O in a thin shell around them.** A `Tab` class that computes a total from an in-memory object is trivial to test. The same calculation entangled with `readline` prompts is not testable at all.

---

## 2. The Project: Bar Tab & Order Tracker

For your final project you will build a **Bar Tab & Order Tracker CLI application** — the same brief as the Python curriculum, ported to TypeScript.

It exercises everything the previous fourteen modules taught:

| Requirement | Module it comes from |
|---|---|
| A `Tab` class with methods and private state | [09_classes_oop](../09_classes_oop/lecture.md), and the [`OOP/`](../../OOP/README.md) module |
| Money and quantities, formatted for display | [02_variables_types](../02_variables_types/lecture.md), [02b_input_output](../02b_input_output/lecture.md) |
| Orders held in a keyed structure | [05_objects_maps_sets](../05_objects_maps_sets/lecture.md) |
| Saving and loading tabs from disk | [10_files_json](../10_files_json/lecture.md) |
| A validated interactive menu | [02b_input_output](../02b_input_output/lecture.md), [06_control_flow](../06_control_flow/lecture.md) |
| A test suite that actually passes | [11_testing](../11_testing/lecture.md) |
| Split across modules with imports | [12_modules_and_errors](../12_modules_and_errors/lecture.md) |
| Run from a script, dependencies declared | [13_npm_and_packages](../13_npm_and_packages/lecture.md) |
| Committed, with a readable history | [13b_terminal_git](../13b_terminal_git/lecture.md) |

Read **[project_brief.md](project_brief.md)** for the full requirements, the data model, and the starter hints.

---

## 3. How to Work On It

The order that avoids rework:

1. **Write `tab.ts` first, with no I/O in it at all.** A class that takes values and returns values.
2. **Write `tab.test.ts` next**, before the CLI exists. If the class is hard to test, the design is wrong — fix the design, not the test.
3. **Only then write `menu.ts`.** It should be thin: prompt, call the class, print the result.
4. **Add persistence last**, once the in-memory version is correct. Persistence bugs are much easier to find when you know the logic underneath is sound.

> **The one design rule worth repeating:** keep the logic out of the I/O layer. `menu.ts` should contain almost no arithmetic and almost no validation logic beyond parsing input — the `Tab` class owns the behaviour, and the tests prove it works.

---

## 4. Going Further

Once the brief is satisfied, these are the natural next steps:

- **Money as integer cents.** Floating-point currency is a real bug ([02_variables_types](../02_variables_types/lecture.md) section 2) — store cents as integers and format at the edges.
- **A schema validator for loaded files.** `JSON.parse` gives `any`; a `isTab` type predicate ([10_files_json](../10_files_json/lecture.md) section 6) makes a hand-edited file safe, and a failed validation is a real error rather than corrupt state.
- **Custom error classes** for the failure modes you keep handling inline ([12_modules_and_errors](../12_modules_and_errors/lecture.md) section 9).
- **Discounts and splits**, which is where a `Record<string, number>` stops being enough and the object-versus-`Map` question from [05_objects_maps_sets](../05_objects_maps_sets/lecture.md) becomes real.
- **A `satisfies` config object** for tax and service rates so a typo in a key is a compile error ([20_utility_types](../20_utility_types/lecture.md)).

---

## 5. Finished?

Once it works and the tests pass:

1. Run `npm run check` — it must be clean.
2. Run `npm test` — every test must pass.
3. Commit it with a message that says what it does.
4. Push it to GitHub to showcase your learning.

Then go back and do the [`OOP/`](../../OOP/README.md) and [`DSA/`](../../DSA/README.md) modules, which build directly on what this project just taught you.
