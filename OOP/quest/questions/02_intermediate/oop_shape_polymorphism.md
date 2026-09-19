# OOP Shape Polymorphism

Source: oop_shape_polymorphism

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `Shape` base class with an abstract method `area(): number`. Define `Circle` and `Square` subclasses that each override `area()` correctly. Write a function `totalArea(shapes: Shape[]): number` that sums the `.area()` of every shape in a list, regardless of which subclass each one is.

Expected function
```ts
abstract class Shape {
    abstract area(): number;
}

class Circle extends Shape {
    constructor(public radius: number) {
        super();
    }

    override area(): number {
        return 0;
    }
}

class Square extends Shape {
    constructor(public side: number) {
        super();
    }

    override area(): number {
        return 0;
    }
}

function totalArea(shapes: Shape[]): number {
    return 0;
}
```


Here is a possible program to test your function :
```ts
const shapes = [new Circle(2), new Square(3)];
console.log(totalArea(shapes).toFixed(2));
```

And its output :
```text
21.57
```