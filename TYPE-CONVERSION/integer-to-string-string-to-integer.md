# Integer ↔ String Conversion in TypeScript

Converting between integers and strings is one of the most common operations in programming. TypeScript provides several ways to perform these conversions while maintaining type safety.

## Converting Integer to String

### 1. Using `toString()` Method
The most straightforward way to convert a number to a string:

```typescript
const num: number = 42;
const str: string = num.toString(); // "42"

// With base specification
const binaryStr = num.toString(2); // "101010"
const hexStr = num.toString(16); // "2a"
```

### 2. Using String Template Literals
Modern approach using template literals:

```typescript
const num: number = 42;
const str: string = `${num}`; // "42"

// With formatting
const formatted: string = `Value: ${num}`; // "Value: 42"
```

### 3. Using String Constructor
```typescript
const num: number = 42;
const str: string = String(num); // "42"
```

### 4. Using String Concatenation
```typescript
const num: number = 42;
const str: string = "" + num; // "42"
```

## Converting String to Integer

### 1. Using `parseInt()` (Recommended for Integers)
```typescript
const str: string = "42";
const num: number = parseInt(str, 10); // 42

// Always specify radix to avoid confusion
// parseInt(str) without radix can lead to unexpected results
```

### 2. Using `Number()` Constructor
```typescript
const str: string = "42";
const num: number = Number(str); // 42

// Note: Number() can also handle floats and special values
Number("3.14"); // 3.14
Number(""); // 0
Number(null); // 0
Number(undefined); // NaN
```

### 3. Using Unary Plus Operator
```typescript
const str: string = "42";
const num: number = +str; // 42

// Same behavior as Number()
```

### 4. Using `Math.floor()` with `Number()`
For ensuring integer results from potentially float strings:
```typescript
const str: string = "42.7";
const num: number = Math.floor(Number(str)); // 42
```

## TypeScript-Specific Approaches

### 1. Type Assertions with Conversion Functions
```typescript
function toString(num: number): string {
  return num.toString();
}

function toInt(str: string): number {
  const result = parseInt(str, 10);
  return isNaN(result) ? 0 : result; // or throw error
}

// Usage
const numStr: string = toString(123);
const numVal: number = toInt("456");
```

### 2. Generic Conversion Functions
```typescript
function convertToString<T extends number | string>(input: T): string {
  return input.toString();
}

function convertToNumber<T extends string>(input: T): number {
  const result = parseInt(input, 10);
  return isNaN(result) ? 0 : result;
}
```

### 3. Validation-Focused Conversion
```typescript
interface ConversionResult<T> {
  success: boolean;
  value?: T;
  error?: string;
}

function safeStringToInt(str: string): ConversionResult<number> {
  const trimmed = str.trim();
  if (trimmed === "") {
    return { success: false, error: "Empty string" };
  }
  
  const num = parseInt(trimmed, 10);
  if (isNaN(num)) {
    return { success: false, error: "Not a valid integer" };
  }
  
  return { success: true, value: num };
}

// Usage
const result = safeStringToInt("  42  ");
if (result.success) {
  console.log(result.value); // 42
} else {
  console.error(result.error);
}
```

## Handling Edge Cases

### 1. Empty Strings and Whitespace
```typescript
""; // parseInt -> NaN, Number -> 0
"   "; // parseInt -> NaN, Number -> 0
" \n\t "; // parseInt -> NaN, Number -> 0
```

### 2. Non-Numeric Characters
```typescript
"42abc"; // parseInt -> 42 (stops at first non-digit)
"abc42"; // parseInt -> NaN
"42 24"; // parseInt -> 42 (stops at space)
```

### 3. Floating Point Strings
```typescript
"42.7"; // parseInt -> 42 (integer part only)
"42.7"; // Number -> 42.7 (preserves decimal)
"42.0"; // parseInt -> 42
"42.0"; // Number -> 42
```

### 4. Special Values
```typescript
"Infinity"; // Number -> Infinity
"-Infinity"; // Number -> -Infinity
"NaN"; // Number -> NaN
"0xFF"; // parseInt with radix 16 -> 255
"0xFF"; // Number -> 255 (auto-detects hex)
"0o755"; // Number -> 493 (auto-detects octal in modern JS)
"0b1010"; // Number -> 10 (auto-detects binary in modern JS)
```

### 5. Very Large Numbers
```typescript
"9007199254740991"; // Number.MAX_SAFE_INTEGER
"9007199254740992"; // Beyond safe integer range - precision loss possible
```

## Practical Examples

### 1. Formatting Numbers with Leading Zeros
```typescript
function padNumber(num: number, width: number): string {
  return String(num).padStart(width, '0');
}

// Usage
padNumber(5, 3); // "005"
padNumber(123, 5); // "00123"
```

### 2. Currency Formatting
```typescript
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Usage
formatCurrency(1234.5); // "$1,234.50"
formatCurrency(0.99); // "$0.99"
```

### 3. Input Validation and Conversion
```typescript
function parseAge(input: string): number | null {
  const trimmed = input.trim();
  
  // Check if it's a positive integer
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  
  const age = parseInt(trimmed, 10);
  return age >= 0 && age <= 150 ? age : null;
}

// Usage
parseAge("25"); // 25
parseAge("abc"); // null
parseAge("-5"); // null
parseAge("200"); // null
```

### 4. Hex Color Parsing
```typescript
function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');
  
  // Validate format
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }
  
  // Expand 3-digit to 6-digit
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  // Convert to RGB
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  return { r, g, b };
}

// Usage
parseHexColor("#FF0000"); // { r: 255, g: 0, b: 0 }
parseHexColor("#0F0"); // { r: 0, g: 255, b: 0 }
```

## Performance Considerations

1. **`+` vs `Number()`**: Both have similar performance; `+` is slightly faster in some engines
2. **`parseInt()` vs `Number()`**: `parseInt()` is faster for pure integers as it doesn't handle floats
3. **Template literals**: Slightly slower than `toString()` but more flexible for formatting
4. **String concatenation**: Generally avoided for performance in loops

## Best Practices

1. **Always specify radix** with `parseInt()`: `parseInt(str, 10)`
2. **Validate input** before conversion when possible
3. **Use appropriate method** for your needs:
   - `toString()` for number → string
   - `parseInt(str, 10)` for string → integer
   - `Number()` or `+` for string → number (including floats)
4. **Handle edge cases** like empty strings, whitespace, and invalid input
5. **Consider using utility libraries** like lodash/underscore for complex conversion needs
6. **Leverage TypeScript's type system** to create safe conversion functions

## Common Mistakes to Avoid

1. **Forgetting radix in `parseInt()`**: Leading to octal interpretation
2. **Confusing `==` with `===`**: When validating numeric strings
3. **Not handling `NaN` results**: From failed conversions
4. **Assuming all strings convert cleanly**: User input often needs validation
5. **Ignoring locale differences**: In number formatting (commas vs periods for decimals)

## Exercises

Practice these conversion scenarios:

1. Create a function that converts RGB values to a hex color string
2. Build a format function that adds commas to large numbers (1000 → "1,000")
3. Implement a Roman numeral converter (integer ↔ Roman string)
4. Create a binary string adder (e.g., "1010" + "1101" = "10111")
5. Build a phone number formatter that handles various input formats