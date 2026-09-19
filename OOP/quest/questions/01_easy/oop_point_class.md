# OOP Point Class

Source: oop_point_class

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define an empty `Point` class. Write a function `distance(p1: Point, p2: Point): number` that computes the Euclidean distance between two `Point` objects, where each point has `.x` and `.y` properties (no constructor needed for this exercise).

Expected function
```ts
class Point {
}

function distance(p1: Point, p2: Point): number {
    return 0;
}
```


Here is a possible program to test your function :
```ts
const a = new Point();
a.x = 0; a.y = 0;
const b = new Point();
b.x = 3; b.y = 4;
console.log(distance(a, b));
```

And its output :
```text
5
```