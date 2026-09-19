# OOP Temperature Accessors

Source: oop_temperature_accessors

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `Temperature` class that stores the value internally in Celsius (`private _celsius: number`), with a `celsius` property (getter + setter) AND a `fahrenheit` property (getter + setter) that stay in sync -- setting either one updates the underlying Celsius value so BOTH properties reflect the change consistently. Use `fahrenheit = celsius * 9/5 + 32`.

Expected function
```ts
class Temperature {
    private _celsius: number = 0;

    get celsius(): number {
        return 0;
    }

    set celsius(value: number) {
    }

    get fahrenheit(): number {
        return 0;
    }

    set fahrenheit(value: number) {
    }
}
```


Here is a possible program to test your function :
```ts
const t = new Temperature(0);
console.log(t.fahrenheit);
t.fahrenheit = 212;
console.log(t.celsius.toFixed(2));
```

And its output :
```text
32
100.00
```