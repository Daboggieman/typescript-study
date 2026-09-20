// Basic OOP Example in TypeScript

class Animal {
    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    makeSound(): void {
        console.log(`${this.name} makes a sound`);
    }

    move(distance: number = 0): void {
        console.log(`${this.name} moved ${distance}m`);
    }
}

class Dog extends Animal {
    constructor(name: string) {
        super(name);
    }

    makeSound(): void {
        console.log(`${this.name} barks: Woof! Woof!`);
    }

    fetch(item: string): void {
        console.log(`${this.name} fetches the ${item}`);
    }
}

class Cat extends Animal {
    constructor(name: string) {
        super(name);
    }

    makeSound(): void {
        console.log(`${this.name} meows: Meow!`);
    }

    climb(height: number): void {
        console.log(`${this.name} climbs ${height}m up the tree`);
    }
}

// Usage
const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");

dog.makeSound(); // Buddy barks: Woof! Woof!
dog.move(10);    // Buddy moved 10m
dog.fetch("ball"); // Buddy fetches the ball

cat.makeSound(); // Whiskers meows: Meow!
cat.move(5);     // Whiskers moved 5m
cat.climb(3);    // Whiskers climbs 3m up the tree

// Demonstrating polymorphism
const animals: Animal[] = [dog, cat];

animals.forEach(animal => {
    animal.makeSound();
    animal.move();
});