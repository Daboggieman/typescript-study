# TypeScript Cheatsheet

Quick reference for common TypeScript syntax and patterns.

## Basic Types

```typescript
let isDone: boolean = false;
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
let color: string = "blue";
let list: number[] = [1, 2, 3];
let list: Array<number> = [1, 2, 3];

// Tuple
let x: [string, number];
// Initialize it
x = ["hello", 10]; // OK
// Initialize it incorrectly
// x = [10, "hello"]; // Error

// Enum
enum Color { Red, Green, Blue }
let c: Color = Color.Green;

// Any
let notSure: any = 4;
notSure = "maybe a string instead";
// OK, definitely a boolean
notSure = false;

// Void
function warnUser(): void {
  console.log("This is my warning message");
}

// Null and Undefined
let u: undefined = undefined;
let n: null = null;

// Never
function error(message: string): never {
  throw new Error(message);
}

// Object
declare function create(o: object | null): void;
create({ prop: 0 }); // OK
create(null); // OK
```

## Interfaces

```typescript
interface Person {
  firstName: string;
  lastName: string;
  age?: number; // Optional property
  readonly id: number; // Read-only property
  [key: string]: any; // Index signature
}

let person: Person = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
  id: 1234
};

// Interface extension
interface Employee extends Person {
  employeeId: number;
  department: string;
}
```

## Classes

```typescript
class Animal {
  name: string;
  constructor(theName: string) { this.name = theName; }
  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Snake extends Animal {
  constructor(name: string) { super(name); }
  move(distanceInMeters = 5) {
    console.log("Slithering...");
    super.move(distanceInMeters);
  }
}

// Access modifiers
class Person {
  public name: string;
  private age: number;
  protected readonly id: number;
  
  constructor(name: string, age: number, id: number) {
    this.name = name;
    this.age = age;
    this.id = id;
  }
}
```

## Functions

```typescript
// Basic function
function add(x: number, y: number): number {
  return x + y;
}

// Optional parameters
function buildName(firstName: string, lastName?: string) {
  if (lastName)
    return firstName + " " + lastName;
  else
    return firstName;
}

// Default parameters
function buildName(firstName: string, lastName = "Smith") {
  return firstName + " " + lastName;
}

// Rest parameters
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}

// Overloads
function pickCard(x: { suit: string; card: number; }[]): number;
function pickCard(x: number): { suit: string; card: number; };
function pickCard(x): any {
  // Check if we're working with an array/object
  // or if we're working with a number
  if (typeof x == "object") {
    let pickedCard = Math.floor(Math.random() * x.length);
    return pickedCard;
  }
  else if (typeof x == "number") {
    let pickedSuit = Math.floor(x / 13);
    return { suit: suits[pickedSuit], card: x % 13 };
  }
}
```

## Generics

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("myString"); // type of output will be 'string'

// Generic classes
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

// Generic constraints
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // Now we know it has a .length property
  return arg;
}
```

## Utility Types

```typescript
// Partial
interface Todo {
  title: string;
  description: string;
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}

// Required
interface Props {
  a?: number;
  b?: string;
}

const obj: Required<Props> = { a: 1, b: "string" }; // Both properties required

// Readonly
interface Todo {
  readonly title: string;
}

const todo: Readonly<Todo> = {
  title: "Delete inactive users",
};

// Pick
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

// Omit
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

type TodoPreview = Omit<Todo, "description">;

// Record
interface PageInfo {
  title: string;
}

type Page = "home" | "about" | "contact";

const x: Record<Page, PageInfo> = {
  about: { title: "about" },
  contact: { title: "contact" },
  home: { title: "home" },
};

// Exclude
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"

// Extract
type T1 = Extract<"a" | "b" | "c", "a" | "f">; // "a"

// NonNullable
type T0 = NonNullable<string | number | undefined>; // string | number

// ReturnType
type T0 = ReturnType<() => string>; // string
```

## Modules

```typescript
// Exporting
export interface StringValidator {
  isAcceptable(s: string): boolean;
}

export const lettersRegexp = /^[a-zA-Z]+$/;
export const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}

// Re-exports
export class ParseIntBasedZipCodeValidator
  extends ZipCodeValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}

// Exporting a default
export default function add(a: number, b: number) {
  return a + b;
}

// Importing
import { StringValidator } from "./validation";
import zipValidator from "./ZipCodeValidator";
import * as validation from "./validation";
```