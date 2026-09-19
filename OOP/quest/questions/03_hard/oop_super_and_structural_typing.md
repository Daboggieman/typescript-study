# OOP — Super, Extend, and Duck Typing

Source: oop_super_and_structural_typing

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Build a small payroll model that shows the two different ways TypeScript lets unrelated objects respond to the same method call:

| Route | How it works | Which classes here |
|---|---|---|
| Inheritance polymorphism | A subclass overrides a parent's method | `Employee` → `Manager` |
| Duck typing (structural) | An unrelated class just has the same method name | `Contractor` |

The payoff: one loop calls `paySummary()` on all three, and each responds correctly — even though `Contractor` shares no parent with the other two.

**Concepts used:** inheritance, method overriding, `super()`, duck typing (structural typing)

---

## Build It In Steps

Do these in order and run after each one. Don't write all three classes at once.

### Step 1 — `Employee` (the base class)

```ts
class Employee {
    constructor(name: string, baseSalary: number) {}
    paySummary(): string {
        return "";
    }
}
```

- `__init__` stores `name` and `baseSalary` on `self`.
- `paySummary()` **returns** (does not print) the string:
  `"Sam: base $50000"` for `new Employee("Sam", 50000)`

  Format: `\`${this.name}: base \$${this.baseSalary}\``

**Checkpoint:** `console.log(new Employee("Sam", 50000).paySummary())` → `Sam: base $50000`

### Step 2 — `Manager` (subclass, uses `super()` twice)

```ts
class Manager extends Employee {
    constructor(name: string, baseSalary: number, bonus: number) {}
    paySummary(): string {
        return "";
    }
}
```

This is the heart of the exercise — `super()` is used in **two separate places**:

1. In the constructor, call `super(name, baseSalary)` to let the parent store `name` and `baseSalary`, then store `bonus` yourself. Don't re-assign `this.name` by hand — the whole point of `super()` is to not repeat the parent's work.
2. In `paySummary`, call `super.paySummary()` to get the parent's string, then **append** to it:

   `\`${super.paySummary()} + bonus \$${this.bonus}\`**

**Checkpoint:** `console.log(new Manager("Ada", 70000, 5000).paySummary())`
→ `Ada: base $70000 + bonus $5000`

Notice you never rewrote `"...: base $..."` in `Manager` — you reused it. That reuse is what `super()` buys you: change the format once in `Employee` and `Manager` follows.

### Step 3 — `Contractor` (no parent at all)

```ts
class Contractor {
    constructor(name: string, hourlyRate: number) {}
    paySummary(): string {
        return "";
    }
}
```

- Constructor stores `name` and `hourlyRate`.
- `paySummary()` returns:
  `\`${this.name}: contractor at \$${this.hourlyRate}/hr\`"

`Contractor` has **no relationship** to `Employee` — no shared parent, no inheritance.
The only thing it shares is a method *name*. That is enough for the loop below to work,
and that is duck typing (structural typing): *"if it has a `paySummary()`, I can call `paySummary()` on it."*

---

## Test Program

```ts
const people = [
    new Employee("Sam", 50000),
    new Manager("Ada", 70000, 5000),
    new Contractor("Lee", 80),
];
for (const p of people) {
    console.log(p.paySummary());
}
```

## Expected Output

```text
Sam: base $50000
Ada: base $70000 + bonus $5000
Lee: contractor at $80/hr
```

---

## Hints

<details>
<summary>Hint 1 — `super()` in the constructor</summary>

```ts
class Manager extends Employee {
    constructor(name: string, baseSalary: number, bonus: number) {
        super(name, baseSalary);   // parent sets this.name, this.baseSalary
        this.bonus = bonus;        // then add what's new to Manager
    }
}
```
Note there's no `this` inside the `super(...)` call — `super()` already knows which object it's working on.
</details>

<details>
<summary>Hint 2 — `super()` in an overriding method</summary>

`super.paySummary()` runs `Employee`'s version and hands you back its **return value**.
Capture it, then build on it:

```ts
paySummary(): string {
    const base = super.paySummary();      // "Ada: base $70000"
    return base + ` + bonus \$${this.bonus}`;
}
```
</details>

<details>
<summary>Hint 3 — why the loop works at all</summary>

TypeScript does not check nominal types before calling `p.paySummary()`. At each iteration it looks up `paySummary` on whatever object `p` currently is, and calls what it finds. Three different classes, three different method bodies, one call site.
This is structural typing: if it has the method, it works.
</details>

---

## Common Mistakes

- **Printing instead of returning.** Every `paySummary` must `return` a string. If it prints, the test loop's `console.log()` will show `undefined` on each line.
- **Making `Contractor` inherit from `Employee`.** That defeats the entire point — the exercise exists to show a class with *no* shared parent still works.
- **Re-writing the base string inside `Manager.paySummary`.** If your `Manager` contains the literal text `": base $"`, you skipped `super()`. Build on the parent's return value.
- **Calling `super(this, name, baseSalary)`.** Passing `this` explicitly to `super()` is incorrect — `super()` supplies it for you.
- **Forgetting `extends Employee`:** `class Manager extends Employee:`, not `class Manager:`. Without it `super()` has no parent to reach and `Manager` has no inherited `paySummary`.

---

## Stretch Goal (optional)

Add a fourth class `Intern` that duck-types `paySummary()` returning
`"${name}: unpaid intern"`, append one to the `people` list, and confirm the loop needs **no changes at all** to handle it. That "no changes at all" is the practical value of polymorphism: new types plug into existing loops.