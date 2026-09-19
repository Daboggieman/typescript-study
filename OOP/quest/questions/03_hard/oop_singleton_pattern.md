# OOP Singleton Pattern

Source: oop_singleton_pattern

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Implement the Singleton pattern using a static method: define a `Config` class where calling `Config.getInstance()` always returns the SAME object, creating it only the first time it's called (store it on a class attribute). Direct instantiation with `new Config()` should still work normally and create a separate object -- only `getInstance()` guarantees a shared single instance.

Expected function
```ts
class Config {
    private static _instance: Config | null = null;

    constructor() {
    }

    static getInstance(): Config {
        return new Config();
    }
}
```


Here is a possible program to test your function :
```ts
const a = Config.getInstance();
const b = Config.getInstance();
console.log(a === b);

const c = new Config();
console.log(a === c);
```

And its output :
```text
true
false
```