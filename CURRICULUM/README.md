# Curriculum Index

A self-paced TypeScript curriculum: 25 modules, each a `lecture.md` and a runnable `exercises.ts`. The same structure as the Python curriculum next door, for TypeScript instead of Python.

## How to work through a module

```bash
npm run ex CURRICULUM/01_hello_typescript/exercises.ts   # run it
npm run check                                            # typecheck everything
```

Read the `lecture.md` first, then open the `exercises.ts` and fill in the `TODO` stubs. Every module ends with a **🧠 Try It Yourself** list that maps one-to-one onto the exercises.

> **`npm run check` is clean on a fresh clone, and that is deliberate.** The stubs are written so they typecheck before you touch them — TypeScript's strict mode will not accept an empty function body the way Python accepts an empty `def`. Where an exercise asks you to *provoke* a type error, those lines are commented out; uncomment them one at a time, run `npm run check`, read the error, and comment them back.

---

## Core modules

| # | Module | What it covers |
|---|---|---|
| 01 | [01_hello_typescript](01_hello_typescript/lecture.md) | running TypeScript, `console.log`, the toolchain |
| 02 | [02_variables_types](02_variables_types/lecture.md) | `let`/`const`, primitives, `typeof`, numbers and floats |
| 02b | [02b_input_output](02b_input_output/lecture.md) | `node:readline`, `process.argv`, prompts and parsing |
| 02c | [02c_operators](02c_operators/lecture.md) | arithmetic, `===` vs `==`, logical operators |
| 03 | [03_strings](03_strings/lecture.md) | methods, template literals, immutability |
| 04 | [04_arrays_tuples](04_arrays_tuples/lecture.md) | arrays, tuples, `map`/`filter`/`reduce`, `toSorted` |
| 05 | [05_objects_maps_sets](05_objects_maps_sets/lecture.md) | objects, `Map`, `Set`, and when to use which |
| 06 | [06_control_flow](06_control_flow/lecture.md) | `if`, `switch`, ternary, truthiness |
| 07 | [07_loops](07_loops/lecture.md) | `for`, `for...of`, `for...in`, `while` |
| 08 | [08_functions](08_functions/lecture.md) | declarations, arrows, parameters, closures, `this` |
| 09 | [09_classes_oop](09_classes_oop/lecture.md) | classes, inheritance, `private`, getters, statics |
| 10 | [10_files_json](10_files_json/lecture.md) | `node:fs/promises`, `JSON.parse`/`stringify`, errors |
| 11 | [11_testing](11_testing/lecture.md) | vitest, `expect`, `describe`/`it`, TDD |
| 12 | [12_modules_and_errors](12_modules_and_errors/lecture.md) | `import`/`export`, custom errors, `try`/`catch` |
| 13 | [13_npm_and_packages](13_npm_and_packages/lecture.md) | `package.json`, semver, scripts, `node_modules` |
| 13b | [13b_terminal_git](13b_terminal_git/lecture.md) | the terminal, git, committing your work |
| 14 | [14_fetch_apis](14_fetch_apis/lecture.md) | `fetch`, HTTP, JSON APIs, status codes |
| 15 | [15_final_project](15_final_project/lecture.md) | the bar tab tracker — [project_brief.md](15_final_project/project_brief.md) |

## The type system

| # | Module | What it covers |
|---|---|---|
| 16 | [16_type_annotations](16_type_annotations/lecture.md) | annotations, inference, `any`/`unknown`/`never`/`void`, `as const` |
| 17 | [17_interfaces_and_aliases](17_interfaces_and_aliases/lecture.md) | `interface` vs `type`, structural typing, declaration merging |
| 18 | [18_unions_and_narrowing](18_unions_and_narrowing/lecture.md) | unions, `typeof`/`instanceof`/`in`, discriminated unions, exhaustiveness |
| 19 | [19_generics](19_generics/lecture.md) | type parameters, `extends` constraints, `keyof`, generic classes |
| 20 | [20_utility_types](20_utility_types/lecture.md) | `Partial`, `Omit`, `Pick`, `Record`, `Exclude`, `satisfies` |
| 21 | [21_tsconfig_deep_dive](21_tsconfig_deep_dive/lecture.md) | every flag that matters, and the two this repo turns off |
| 22 | [22_iterators_and_generators](22_iterators_and_generators/lecture.md) | the iteration protocol, `function*`, `yield`, async generators |
| 23 | [23_advanced_types](23_advanced_types/lecture.md) | mapped and conditional types, `infer`, template literals, brands |
| 24 | [24_declaration_files](24_declaration_files/lecture.md) | `.d.ts`, `declare`, `@types`, module augmentation |
| 25 | [25_async_and_promises](25_async_and_promises/lecture.md) | the event loop, `async`/`await`, `Promise.all`, `AbortController` |

---

## Related modules

- [`../OOP/`](../OOP/README.md) — a focused Object-Oriented Programming module (curriculum + quest style), from encapsulation through polymorphism
- [`../DSA/`](../DSA/README.md) — Data Structures & Algorithms, from arrays through merge sort
- [`../quests/`](../quests/) — graded practice problems with solutions
- [`../typescript-quest/`](../typescript-quest/questions/README.md) — a large set of short drill questions
- [`../RESOURCES/`](../RESOURCES/) — cheat sheet, links, and common mistakes

---

## Where to start

**Never written code before:** [01_hello_typescript](01_hello_typescript/lecture.md), and go in order.

**Coming from Python:** the first fifteen modules are a translation exercise — the concepts are identical and the syntax is the thing to learn. Watch for the differences called out in each lecture's "Python comparison" notes, and read [`../RESOURCES/common_mistakes.md`](../RESOURCES/common_mistakes.md) before you write anything serious. Then start at [16_type_annotations](16_type_annotations/lecture.md), which is where TypeScript stops looking like Python.

**Coming from JavaScript:** skim 01–15, then read 16 through 25 in order. That block is what TypeScript adds.
