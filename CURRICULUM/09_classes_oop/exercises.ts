// Exercise 09: Classes & OOP
// Run this file with: npm run ex CURRICULUM/09_classes_oop/exercises.ts
// For the full treatment, work through the OOP/ module afterwards.


// TODO: Exercise 1
// Write a Car class with make, model, and year fields, a constructor, and a
// describe() method returning "2020 Toyota Corolla".
class Car {
}


// TODO: Exercise 2
// Add a `mileage` field initialised to 0 and a drive(miles) method that adds to it.


// TODO: Exercise 3
// Create two cars, drive one of them, and print both mileages.
// In a comment, explain why a class FIELD initialiser cannot be shared between
// instances the way a Python class attribute can.


// TODO: Exercise 4
// Add a private `vin` field. Try to read it from outside and read the error number.
// Then read it with `as any` and prove the value is still there at runtime.
class Vehicle {
  private vin = "VIN-001";
}


// TODO: Exercise 5
// Rewrite the Car class above using constructor parameter properties.
// Count the lines you saved.
class CarShort {
}


// TODO: Exercise 6
// Add a static factory 'create(model)' to CarShort that returns a new instance.
// Call it and print the result.


// TODO: Exercise 7
// Write a Temperature class with:
//   - a private _celsius
//   - a getter `celsius` and a setter that throws below -273.15
//   - a read-only getter `fahrenheit`
// Prove the setter rejects an impossible value.
class Temperature {
  private _celsius = 0;
}


// TODO: Exercise 8
// Demonstrate the detached-method bug on this class, then fix it two ways:
//   a. with .bind()
//   b. by rewriting increment as an arrow property
class Counter {
  count = 0;

  increment(): void {
    this.count += 1;
  }
}
