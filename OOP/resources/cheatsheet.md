# 🧱 OOP Cheatsheet

A comprehensive quick-reference for Object-Oriented Programming in TypeScript. Pairs with `OOP/curriculum/` (theory) and `OOP/quest/` (practice problems).

---

## 1. Classes and Objects

```ts
class Dog {
}

const myDog = new Dog();             // an instance (object) of class Dog
console.log(myDog instanceof Dog);          // true
```
A **class** is a blueprint. An **object**/**instance** is a specific thing built from it. Every value in TypeScript (string, number, boolean, etc.) is an object of some type.

---

## 2. Constructor

```ts
class Dog {
    constructor(public name: string, public age: number) {
    }
}

const dog = new Dog("Rex", 5);
```
The `constructor` method is called when creating a new instance. Parameter properties (`public name: string`) automatically create and initialize properties.

---

## 3. Properties

```ts
class Dog {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}
```
Properties must be declared in the class body. They can be `public`, `protected`, or `private`. Use `#` for runtime-private fields.

---

## 4. Methods

```ts
class Dog {
    constructor(public name: string) {}

    bark(): string {
        return `${this.name} says Woof!`;
    }
}
```
Methods are functions defined inside a class. They have access to `this` (the instance).

---

## 5. Getters and Setters

```ts
class Circle {
    private _radius: number = 0;

    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        if (value < 0) {
            throw new Error("radius cannot be negative");
        }
        this._radius = value;
    }

    get area(): number {
        return Math.PI * this._radius ** 2;
    }
}
```
Getters and setters allow you to execute code when a property is read or written. They appear as properties to external code.

---

## 6. Static Members

```ts
class Dog {
    static readonly species = "Canis familiaris";

    static create(name: string): Dog {
        return new Dog(name);
    }
}

console.log(Dog.species); // "Canis familiaris"
const dog = Dog.create("Rex");
```
Static members belong to the class itself, not to instances. Use `static` for constants, factories, and shared state.

---

## 7. Inheritance

```ts
class Animal {
    constructor(public name: string) {}

    speak(): string {
        return `${this.name} makes a sound`;
    }
}

class Dog extends Animal {
    constructor(name: string, public breed: string) {
        super(name); // Call parent constructor
    }

    override speak(): string {
        return `${super.speak()} — woof`;
    }
}
```
Use `extends` to inherit from a base class. Use `super()` to call the parent constructor. Use `override` to override a method (required in this repo).

---

## 8. Abstract Classes

```ts
abstract class Shape {
    constructor(public readonly name: string) {}

    abstract area(): number;

    describe(): string {
        return `${this.name} with area ${this.area()}`;
    }
}

class Circle extends Shape {
    constructor(public radius: number) {
        super("circle");
    }

    override area(): number {
        return Math.PI * this.radius ** 2;
    }
}
```
An `abstract` class cannot be instantiated. It can contain abstract methods that must be implemented by subclasses.

---

## 9. Interfaces

```ts
interface Serializable {
    toJSON(): unknown;
}

class User implements Serializable {
    constructor(public id: string, public name: string) {}

    toJSON(): unknown {
        return { id: this.id, name: this.name };
    }
}
```
An `interface` describes a shape. A class can `implement` one or more interfaces. Interfaces are erased at runtime.

---

## 10. Polymorphism

```ts
abstract class Shape {
    abstract area(): number;
}

class Circle extends Shape {
    constructor(public radius: number) { super(); }
    override area(): number { return Math.PI * this.radius ** 2; }
}

class Square extends Shape {
    constructor(public side: number) { super(); }
    override area(): number { return this.side ** 2; }
}

function totalArea(shapes: Shape[]): number {
    return shapes.reduce((sum, s) => sum + s.area(), 0);
}
```
Polymorphism allows the same method call to behave differently based on the object's actual type.

---

## 11. Encapsulation

```ts
class BankAccount {
    private #balance = 0;

    deposit(amount: number): void {
        if (amount <= 0) throw new Error("amount must be positive");
        this.#balance += amount;
    }

    get balance(): number {
        return this.#balance;
    }
}
```
Encapsulation means hiding internal state and exposing only what is necessary. Use `#` for truly private fields.

---

## 12. Method Chaining

```ts
class QueryBuilder {
    private parts: string[] = [];

    select(...columns: string[]): this {
        this.parts.push(`SELECT ${columns.join(", ")}`);
        return this;
    }

    from(table: string): this {
        this.parts.push(`FROM ${table}`);
        return this;
    }

    build(): string {
        return this.parts.join(" ");
    }
}

const sql = new QueryBuilder()
    .select("id", "name")
    .from("users")
    .where("age > 18")
    .build();
```
Methods that return `this` can be chained together for a fluent API.