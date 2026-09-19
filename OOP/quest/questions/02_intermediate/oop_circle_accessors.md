# OOP Circle Accessors

Source: oop_circle_accessors

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `Circle` class with a validated `radius` property (getter + setter; setter must throw an error for negative values) and a read-only `area` property computed as `3.14159 * radius ** 2`.

Expected function
```ts
class Circle {
    constructor(radius: number) {
    }

    get radius(): number {
        return 0;
    }

    set radius(value: number) {
    }

    get area(): number {
        return 0;
    }
}
```


Here is a possible program to test your function :
```ts
const c = new Circle(5);
console.log(c.radius, c.area.toFixed(2));
c.radius = 10;
console.log(c.radius, c.area.toFixed(2));
```

And its output :
```text
5 78.54
10 314.16
```