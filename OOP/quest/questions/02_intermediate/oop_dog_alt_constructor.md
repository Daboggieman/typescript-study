# OOP Dog Alt Constructor

Source: oop_dog_alt_constructor

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `Dog` class with a constructor `(name: string, age: number)`, a static property `population` starting at 0 and incremented on every creation, a static method `fromBirthYear(name: string, birthYear: number, currentYear: number = 2026): Dog` that computes age and returns a new `Dog`, and a static method `getPopulation(): number`.

Expected function
```ts
class Dog {
    static population = 0;

    constructor(name: string, age: number) {
    }

    static fromBirthYear(name: string, birthYear: number, currentYear: number = 2026): Dog {
        return new Dog("", 0);
    }

    static getPopulation(): number {
        return 0;
    }
}
```


Here is a possible program to test your function :
```ts
const rex = Dog.fromBirthYear("Rex", 2022);
const fido = new Dog("Fido", 1);
console.log(rex.age);
console.log(Dog.getPopulation());
```

And its output :
```text
4
2
```