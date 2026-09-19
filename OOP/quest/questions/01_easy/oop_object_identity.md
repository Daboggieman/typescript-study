# OOP Object Identity

Source: oop_object_identity

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define an empty `Box` class. Write a function `sameObject(a: Box, b: Box): boolean` that returns true only if `a` and `b` are literally the SAME object in memory (not just equal-looking) -- use `===`, not `==`.

Expected function
```ts
class Box {
}

function sameObject(a: Box, b: Box): boolean {
    return false;
}
```


Here is a possible program to test your function :
```ts
const box1 = new Box();
const box2 = new Box();
const box3 = box1;
console.log(sameObject(box1, box2));
console.log(sameObject(box1, box3));
```

And its output :
```text
false
true
```