# OOP Method Chaining

Source: oop_method_chaining

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `StringBuilder` class with an internal array of parts. Add an `add(text: string): StringBuilder` method that appends `text` and returns `this` (enabling method chaining), and a `build(): string` method that returns all parts joined into one string with no separator.

Expected function
```ts
class StringBuilder {
    private parts: string[] = [];

    add(text: string): StringBuilder {
        return this;
    }

    build(): string {
        return "";
    }
}
```


Here is a possible program to test your function :
```ts
const result = new StringBuilder().add("Hello").add(", ").add("world!").build();
console.log(result);
```

And its output :
```text
Hello, world!
```