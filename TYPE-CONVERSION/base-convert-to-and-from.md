# Base Conversion: To and From Different Number Systems

Understanding how to convert between different number bases is fundamental in programming. TypeScript, being a superset of JavaScript, inherits JavaScript's capabilities for base conversion while providing type safety.

## Number Bases Overview

- **Binary (Base 2)**: Uses digits 0-1
- **Octal (Base 8)**: Uses digits 0-7  
- **Decimal (Base 10)**: Uses digits 0-9 (standard)
- **Hexadecimal (Base 16)**: Uses digits 0-9 and A-F

## Converting to Different Bases

JavaScript/TypeScript provides the `toString(base)` method for converting numbers to different base representations:

```typescript
const decimalNumber = 42;

// To binary (base 2)
const binaryString = decimalNumber.toString(2); // "101010"

// To octal (base 8)
const octalString = decimalNumber.toString(8); // "52"

// To hexadecimal (base 16)
const hexString = decimalNumber.toString(16); // "2a"

// To base 36 (maximum base)
const base36String = decimalNumber.toString(36); // "16"
```

## Converting from Different Bases

Use `parseInt(string, radix)` to convert string representations back to numbers:

```typescript
// From binary
const binaryStr = "101010";
const fromBinary = parseInt(binaryStr, 2); // 42

// From octal
const octalStr = "52";
const fromOctal = parseInt(octalStr, 8); // 42

// From hexadecimal
const hexStr = "2a";
const fromHex = parseInt(hexStr, 16); // 42

// From base 36
const base36Str = "16";
const fromBase36 = parseInt(base36Str, 36); // 42
```

## Important Notes About parseInt

1. **Always specify the radix**: Without a radix, `parseInt` may guess incorrectly:
   ```typescript
   // ❌ Dangerous - might be interpreted as octal
   parseInt("08"); // 0 in some implementations!
   
   // ✅ Safe - always specify radix
   parseInt("08", 10); // 8
   ```

2. **Leading zeros**: Strings with leading zeros can be problematic:
   ```typescript
   parseInt("010", 10); // 10
   parseInt("010", 8);  // 8 (octal)
   ```

## Practical Examples

### Color Manipulation
Converting RGB values to hexadecimal color codes:

```typescript
function rgbToHex(r: number, g: number, b: number): string {
  // Ensure values are in valid range
  const clamp = (val: number): number => Math.max(0, Math.min(255, val));
  
  const red = clamp(r).toString(16).padStart(2, '0');
  const green = clamp(g).toString(16).padStart(2, '0');
  const blue = clamp(b).toString(16).padStart(2, '0');
  
  return `#${red}${green}${blue}`.toUpperCase();
}

// Usage
rgbToHex(255, 165, 0); // "#FFA500" (orange)
```

### Binary Operations
Working with bitwise operations and binary representations:

```typescript
function toggleBit(num: number, position: number): number {
  return num ^ (1 << position);
}

// Check if a specific bit is set
function isBitSet(num: number, position: number): boolean {
  return (num & (1 << position)) !== 0;
}

// Convert to binary string with leading zeros
function toBinaryString(num: number, bits: number = 8): string {
  return num.toString(2).padStart(bits, '0');
}
```

### Network Applications
IP address manipulation often involves base conversion:

```typescript
// Convert dotted decimal IP to single number
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(part => parseInt(part, 10));
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

// Convert number back to dotted decimal IP
function numberToIp(num: number): string {
  return [
    (num >>> 24) & 0xFF,
    (num >>> 16) & 0xFF,
    (num >>> 8) & 0xFF,
    num & 0xFF
  ].join('.');
}

// Usage
const ipNum = ipToNumber("192.168.1.1"); // 3232235777
const backToIp = numberToIp(ipNum); // "192.168.1.1"
```

## TypeScript-Specific Considerations

### Type Safety with Base Conversion
When working with base conversion, maintain proper types:

```typescript
function safeParseInt(str: string, radix: number): number | null {
  const result = parseInt(str, radix);
  return isNaN(result) ? null : result;
}

// Usage
const maybeNum = safeParseInt("FF", 16); // 255
const invalidNum = safeParseInt("XYZ", 16); // null
```

### Working with BigInt for Large Numbers
For numbers larger than JavaScript's safe integer limit:

```typescript
// BigInt base conversion (ES2020+)
const bigNum = 12345678901234567890n;
const bigHex = bigNum.toString(16); // "ab54a98da6d50d56a"
const fromBigHex = BigInt(`0x${bigHex}`); // 12345678901234567890n
```

## Common Pitfalls

1. **Floating point precision**: `parseFloat` behaves differently from `parseInt`
2. **Negative numbers**: Handle the sign separately when needed
3. **Invalid characters**: `parseInt` stops at first invalid character
4. **Empty strings**: Returns `NaN`
5. **Whitespace**: Leading/trailing whitespace is ignored

## Exercises

Try implementing these functions to practice base conversion:

1. `decimalToBase(num: number, base: number): string` - Converts decimal to any base (2-36)
2. `baseToDecimal(str: string, base: number): number` - Converts any base string to decimal
3. `formatBinary(num: number): string` - Formats number as 8-bit binary with spaces
4. `hexToRgb(hex: string): {r: number, g: number, b: number}` - Converts hex color to RGB

## References

- MDN: [parseInt()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
- MDN: [Number.prototype.toString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString)
- ECMAScript Specification: [Number.toString](https://tc39.es/ecma262/#sec-number.prototype.tostring)