# OOP Rectangle Default Args

Source: oop_rectangle_default_args

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `Rectangle` class with a constructor `(width: number, height?: number)`. If `height` is not given, treat the rectangle as a square (`height = width`). Add a method `area(): number` returning `width * height`.

Expected function
```ts
class Rectangle {
    constructor(width: number, height?: number) {
    }

    area(): number {
        return 0;
    }
}
```


Here is a possible program to test your function :
```ts
const square = new Rectangle(4);
const rect = new Rectangle(4, 6);
console.log(square.area());
console.log(rect.area());
```

And its output :
```text
16
24
```