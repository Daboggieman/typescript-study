# OOP Person Init

Source: oop_person_init

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `Person` class with a constructor `(name: string, age: number)` and a method `greet(): string` that returns the string `Hi, I'm ${name} and I'm ${age} years old.`.

Expected function
```ts
class Person {
    constructor(name: string, age: number) {
    }

    greet(): string {
        return "";
    }
}
```


Here is a possible program to test your function :
```ts
const p = new Person("Ada", 30);
console.log(p.greet());
```

And its output :
```text
Hi, I'm Ada and I'm 30 years old.
```