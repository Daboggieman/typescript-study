# Common TypeScript Mistakes and Pitfalls

This document outlines common mistakes that TypeScript developers make and how to avoid them.

## Type System Misunderstandings

### 1. Overusing `any`
Using `any` defeats the purpose of TypeScript's type safety.
```typescript
// ❌ Bad
let data: any = getData();

// ✅ Better
interface Data { id: number; name: string; }
let data: Data = getData();
```

### 2. Confusing Type Assertions with Type Conversion
```typescript
// ❌ Bad - This doesn't actually convert the value
const num: number = "42" as number;

// ✅ Better - Actually convert the value
const num: number = parseInt("42", 10);
```

### 3. Misunderstanding `null` and `undefined`
```typescript
// ❌ Bad - Assuming a value isn't null/undefined
function processValue(val: string | null) {
  return val.toUpperCase(); // Error if val is null
}

// ✅ Better - Proper null checking
function processValue(val: string | null) {
  if (val === null) {
    return "DEFAULT";
  }
  return val.toUpperCase();
}
```

## Configuration Issues

### 4. Incorrect tsconfig Settings
Common tsconfig.json mistakes:
- Setting `"target": "ES3"` when you need modern features
- Forgetting to set `"strict": true` for maximum type safety
- Incorrect `"outDir"` or `"rootDir"` settings

### 5. Module Resolution Problems
Issues with importing files:
- Using relative paths when path mapping would be cleaner
- Forgetting to add `.ts` extensions when using certain module resolutions
- Incorrect baseUrl configuration

## Runtime vs Type Checking Confusion

### 6. Forgetting That Types Are Erased
Remember that TypeScript types are removed during compilation:
```typescript
// ❌ Bad - This won't work at runtime
function processItems(items: number[] | string[]) {
  if (typeof items === 'number') { // Always false at runtime!
    // ...
  }
}

// ✅ Better - Use runtime checks
function processItems(items: number[] | string[]) {
  if (items.length > 0 && typeof items[0] === 'number') {
    // ...
  }
}
```

## Best Practices to Avoid These Mistakes

1. **Enable strict mode**: `"strict": true` in tsconfig.json
2. **Use interface vs type appropriately**: Interfaces for object shapes, types for unions/etc.
3. **Prefer const over let**: Unless reassignment is needed
4. **Handle all union cases**: Use exhaustive checks in switch statements
5. **Learn structural typing**: TypeScript compares by structure, not nominal types
6. **Use utility types**: Partial, Required, Pick, Omit, etc. instead of recreating them