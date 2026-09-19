# Final Project: Bar Tab & Order Tracker

Build a Command Line Interface (CLI) application to manage customer tabs and orders at a bar or restaurant.

The same brief as the Python curriculum, in TypeScript. The point is not the bar — it is that one small program touches every concept in the fourteen modules before this one.

---

## Requirements

### 1. Data Model

Create a `Tab` class to represent a single table or customer's bar tab:

- **Fields**:
  - `tableName: string`
  - `orders: Record<string, { quantity: number; price: number }>` — keyed by item name
  - `taxRate: number`, defaulting to `0.10` (10%)
  - `serviceCharge: number`, defaulting to `0.05` (5%)
- **Methods**:
  - `addItem(item: string, price: number, quantity?: number): void` — adds items to the tab. If the item already exists, **increment the quantity** rather than replacing the entry. Default `quantity` to `1`.
  - `calculateSubtotal(): number` — the sum of price × quantity over every order.
  - `calculateTax(): number` — subtotal × taxRate.
  - `calculateServiceCharge(): number` — subtotal × serviceCharge.
  - `calculateTotal(): number` — subtotal + tax + service charge.
  - `printBill(): string` — a formatted multi-line receipt string.
  - `toJSON(): TabData` — a plain, serialisable view of the tab (see the note below).

> **Note on `orders` as a `Record`.** It is an object here because it has to serialise to JSON, which is exactly the trade-off from [05_objects_maps_sets](../../05_objects_maps_sets/lecture.md) section 6. If you later need items keyed by something other than a string — a category object, say — a `Map` becomes the right answer and you write a serialisation step yourself. Decide deliberately, and note the reason in a comment.

### 2. File Persistence

- When a bill is printed, or when the user exits, save the tab as a JSON file in a `tabs/` folder so it can be reloaded later. One file per table.
- Write a `loadTab(name: string): Promise<Tab | null>` function that reads a tab back from disk. It must return `null` when the file is absent and **throw** for any other failure — study the `ENOENT` handling in [10_files_json](../../10_files_json/lecture.md) section 4.
- Use `path.join` with `import.meta.dirname`, not a bare relative path.

### 3. User Interface (CLI Menu)

An interactive loop, reading with `node:readline/promises`:

- Option 1: Create a new tab.
- Option 2: Add items to an existing tab.
- Option 3: View the current status of a tab.
- Option 4: Print/Close a tab (calculates totals, prints the bill, saves it to file).
- Option 5: Exit.

The loop must survive bad input. Typing `abc` for a quantity should print an error and re-prompt — **not** crash the program. See [02b_input_output](../../02b_input_output/lecture.md) section 4 for the prompt loop, and remember `rl.close()` or the process will hang.

### 4. Code Modularity

Split your code into modules:

| File | Contains |
|---|---|
| `tab.ts` | the `Tab` class and the `TabData` type. **No I/O.** |
| `storage.ts` | `saveTab` / `loadTab` — everything touching the filesystem |
| `menu.ts` | the CLI loop. Thin: prompt, call `Tab`, print |
| `tab.test.ts` | the vitest suite for `Tab` |

---

## Starter Code Hints

### `tab.ts`

```ts
export type Order = { quantity: number; price: number };

export type TabData = {
  tableName: string;
  orders: Record<string, Order>;
  taxRate: number;
  serviceCharge: number;
};

export class Tab {
  orders: Record<string, Order> = {};
  taxRate = 0.10;
  serviceCharge = 0.05;

  constructor(public readonly tableName: string) {}

  addItem(item: string, price: number, quantity: number = 1): void {
    // If the item is already on the tab, INCREMENT the quantity.
    // Otherwise create a fresh entry.
  }

  // Implement the calculation methods and printBill...
}
```

Note `readonly tableName` — a parameter property ([09_classes_oop](../../09_classes_oop/lecture.md) section 4). The table a tab belongs to never changes, so the type should say so.

### `tab.test.ts`

Write tests with vitest ([11_testing](../../11_testing/lecture.md)). At a minimum:

- A new tab has a subtotal of `0`.
- `addItem` with the same item twice increments the quantity to `2` rather than replacing the entry.
- `addItem` with an explicit quantity `3` gives a count of `3`.
- The subtotal for a known set of items matches a hand-computed value.
- Tax and service charge are calculated off the **subtotal**, not off the running total.
- `calculateTotal` equals subtotal + tax + service.

**Use `expect(x).toBeCloseTo(y, 10)` for every money assertion.** `toBe` on a computed float fails — `0.1 + 0.2` is `0.30000000000000004`. This is not a hypothetical; it will happen to you in the tax calculation.

---

## Stretch Goals

- **Store money as integer cents.** Convert at the boundary, keep integers internally, format for display. This eliminates the float problem entirely and is what real systems do.
- **Validate loaded JSON with a type predicate.** `isTabData(value: unknown): value is TabData`. A hand-edited file should produce a clear error, not corrupt state.
- **Custom error classes** — `TabNotFoundError`, `InvalidQuantityError` — caught by `instanceof` ([12_modules_and_errors](../../12_modules_and_errors/lecture.md) section 9).
- **Splitting a tab** between N people, including the awkward division of a remainder cent.
- **Discounts**, which is where `Record<string, number>` stops being sufficient and the `Map` question becomes real.

---

## 🚀 How to Complete

1. Build `tab.ts` and write the test suite in `tab.test.ts`. Get `npm test` green.
2. Add `storage.ts` and prove a round trip: save a tab, load it, compare.
3. Build the interactive loop in `menu.ts`.
4. Validate user input — a non-integer quantity must re-prompt, not throw.
5. Run `npm run check` until it is clean, then commit.

---

## Checklist

- [ ] `Tab` is testable without any I/O in it
- [ ] `addItem` increments rather than replaces, and the test proves it
- [ ] Money assertions use `toBeCloseTo`
- [ ] Loading a missing file returns `null`; other errors propagate
- [ ] Bad input re-prompts instead of crashing
- [ ] `rl.close()` is called, so the process actually exits
- [ ] `npm run check` is clean
- [ ] `npm test` is green
- [ ] Committed with a message that says what it does
