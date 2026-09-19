# 🧱 OOP — Object-Oriented Programming

A dedicated module covering TypeScript's object-oriented programming, built in the same two-part style as the rest of this repo:

- **`curriculum/`** — 10 lessons (`lecture.md` + `exercises.ts`), same format as the root `CURRICULUM/` folder.
- **`quest/`** — 12 practice problems in the same style as the root `typescript-quest/` folder, spread across three difficulty tiers (`01_easy`, `02_intermediate`, `03_hard`), each with a question spec (`quest/questions/<tier>/`) and a starter answer stub (`quest/answers/`).
- **`resources/`** — `cheatsheet.md` (one-page reference for everything in this module) and `links.md` (every link used throughout, consolidated).
- **`solutions/`** — a few worked programs that use the module's ideas together.

## Curriculum Order

| # | Topic | The one thing it settles |
|---|---|---|
| 01 | [Classes and Objects](curriculum/01_classes_and_objects/lecture.md) | what a class *is*, and why `new` exists |
| 02 | [Constructors](curriculum/02_constructors/lecture.md) | guaranteeing an object is complete; parameter properties |
| 03 | [`this` and Binding](curriculum/03_this_and_binding/lecture.md) | the one thing that differs most from Python |
| 04 | [Properties and Accessors](curriculum/04_properties_and_accessors/lecture.md) | `get`/`set`, `readonly`, computed validation |
| 05 | [Methods and Encapsulation](curriculum/05_methods_and_encapsulation/lecture.md) | `private`, `#`, and method chaining |
| 06 | [Static Members](curriculum/06_static_members/lecture.md) | statics, factories, and the Singleton pattern |
| 07 | [Inheritance and `super`](curriculum/07_inheritance_and_super/lecture.md) | `extends`, `super`, `override`, `instanceof` |
| 08 | [Abstract Classes and Interfaces](curriculum/08_abstract_classes_and_interfaces/lecture.md) | contracts, and when to use which |
| 09 | [Polymorphism](curriculum/09_polymorphism/lecture.md) | one call, many behaviours; discriminated unions vs classes |
| 10 | [Composition and Patterns](curriculum/10_composition_and_patterns/lecture.md) | why composition beats inheritance, and the patterns that follow |

## Suggested Study Flow

1. Read `curriculum/NN_topic/lecture.md`.
2. Complete `curriculum/NN_topic/exercises.ts` — run it with `npm run ex OOP/curriculum/NN_topic/exercises.ts`.
3. Solve the matching `quest/` problems for that topic (filenames are prefixed `oop_`).
4. Keep `resources/cheatsheet.md` open as a running reference while you work.

Run `npm run check` at any point to typecheck everything you have written so far.

---

## Coming from Python

If you have read the `OOP/` module in the Python curriculum, most of this will be familiar and one part will not:

| Python | TypeScript | Notes |
|---|---|---|
| `class Dog:` | `class Dog {` | braces, and fields are **declared** |
| `def __init__(self, name):` | `constructor(name: string) {}` | one constructor only — no overloading |
| `self.name = name` | `this.name = name` | `this`, and it must be declared first |
| `self` | `this` | **bound at call time — see lesson 03** |
| `@property` | `get` / `set` | accessors, same idea |
| `_private` | `private` / `#` | enforced by the compiler, not just convention |
| `@classmethod` | `static` | different meanings — read lesson 06 |
| `@staticmethod` | `static` | |
| `super().__init__()` | `super()` | same |
| multiple inheritance | single inheritance + interfaces | `implements` as many as you like |
| `__eq__` | no direct equivalent | use a plain function or a library |

The headline difference is lesson 03. In Python, `self` is an ordinary parameter that happens to be filled in by the dot. In JavaScript, `this` is **determined by how the function is called**, which means a method passed as a callback loses its object. That single fact is behind most "why is my class broken" moments in JavaScript, and it is worth the whole lesson.

This module assumes you are comfortable with the fundamentals in the root `CURRICULUM/` folder (functions, arrays, objects, types) — start there first if you haven't already. It pairs naturally with the `DSA/` module, since most custom data structures (linked lists, trees, and so on) are themselves built using classes.
